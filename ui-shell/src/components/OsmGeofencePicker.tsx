import { useEffect, useId, useMemo, useRef, useState } from 'react'
import L from 'leaflet'

type LatLng = { lat: number; lng: number }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function round6(n: number) {
  return Math.round(n * 1_000_000) / 1_000_000
}

export default function OsmGeofencePicker(props: {
  center: LatLng
  radiusMeters: number
  marker?: LatLng | null
  onChange: (next: LatLng) => void
}) {
  const mapId = useId()
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null)

  const [geoErr, setGeoErr] = useState<string | null>(null)

  const activePos = props.marker ?? props.center
  const radius = useMemo(() => {
    const r = Number(props.radiusMeters)
    return Number.isFinite(r) && r > 0 ? clamp(r, 10, 50_000) : 100
  }, [props.radiusMeters])

  useEffect(() => {
    if (!mapEl.current) return
    if (mapRef.current) return

    // Create map
    const map = L.map(mapEl.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    // No API key: use Carto basemap tiles.
    // Note: map labels are ultimately determined by the tile provider + OSM data; this tends to be more English-friendly
    // than the default OSM raster tiles, but some areas may still show local language names.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map)

    // Basic marker icon (works in Vite because it inlines)
    const icon = L.divIcon({
      className: 'osmPin',
      html: '<div class="osmPinDot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    markerRef.current = L.marker([activePos.lat, activePos.lng], { icon }).addTo(map)
    circleRef.current = L.circle([activePos.lat, activePos.lng], {
      radius,
      color: '#0B4DBB',
      opacity: 0.7,
      weight: 2,
      fillColor: '#0B4DBB',
      fillOpacity: 0.12,
    }).addTo(map)

    map.setView([activePos.lat, activePos.lng], 15)

    const onClick = (e: L.LeafletMouseEvent) => {
      props.onChange({ lat: round6(e.latlng.lat), lng: round6(e.latlng.lng) })
    }
    clickHandlerRef.current = onClick
    map.on('click', onClick)

    return () => {
      try {
        map.off()
        map.remove()
      } catch {
        // ignore
      } finally {
        mapRef.current = null
        markerRef.current = null
        circleRef.current = null
        clickHandlerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markerRef.current?.setLatLng([activePos.lat, activePos.lng])
    circleRef.current?.setLatLng([activePos.lat, activePos.lng])
    circleRef.current?.setRadius(radius)
    // Keep the current zoom, only pan gently.
    map.panTo([activePos.lat, activePos.lng], { animate: true, duration: 0.2 })
  }, [activePos.lat, activePos.lng, radius])

  function useMyLocation() {
    setGeoErr(null)
    if (!('geolocation' in navigator)) {
      setGeoErr('Geolocation is not supported on this device/browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        props.onChange({ lat: round6(pos.coords.latitude), lng: round6(pos.coords.longitude) })
      },
      (err) => {
        setGeoErr(err.message || 'Failed to get current location.')
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 10_000 },
    )
  }

  return (
    <div className="mapWrap" aria-label="Geofence location picker">
      <div className="mapToolbar">
        <button type="button" className="btn btnGhost btnSm" onClick={useMyLocation}>
          Use current location
        </button>
        <div className="mapToolbarHint muted">Tip: click on the map to set the project location.</div>
      </div>

      {geoErr ? <div className="callout bad">{geoErr}</div> : null}

      <div key={mapId} ref={mapEl} className="osmMap" />
      <div className="mapHint">No API key required (OpenStreetMap).</div>
    </div>
  )
}
