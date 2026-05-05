type DonutSlice = {
  label: string
  value: number
  color: string
}

export function DonutCard(props: {
  title: string
  slices: DonutSlice[]
  centerLabel: string
  centerValue?: string
  right?: React.ReactNode
}) {
  const total = props.slices.reduce((a, s) => a + (Number.isFinite(s.value) ? s.value : 0), 0) || 0
  const r = 58
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="vizCard">
      <div className="vizCardHead">
        <div className="vizTitle">{props.title}</div>
        {props.right ? <div className="vizRight">{props.right}</div> : null}
      </div>

      <div className="vizDonut">
        <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
          <g transform="translate(80 80) rotate(-90)">
            <circle r={r} cx="0" cy="0" fill="none" stroke="rgba(12,18,28,0.10)" strokeWidth="16" />
            {props.slices.map((s, idx) => {
              const v = Number.isFinite(s.value) ? s.value : 0
              const pct = total > 0 ? v / total : 0
              const dash = pct * c
              const seg = (
                <circle
                  key={idx}
                  r={r}
                  cx="0"
                  cy="0"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += dash
              return seg
            })}
          </g>
        </svg>

        <div className="vizDonutCenter">
          <div className="vizDonutCenterTop">{props.centerLabel}</div>
          {props.centerValue ? <div className="vizDonutCenterValue">{props.centerValue}</div> : null}
        </div>
      </div>

      <div className="vizLegend">
        {props.slices.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
          return (
            <div key={s.label} className="vizLegItem">
              <span className="vizDot" style={{ background: s.color }} aria-hidden="true" />
              <span className="vizLegLabel">{s.label}</span>
              <span className="vizLegValue mono">
                {s.value} ({pct}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MultiLineCard(props: {
  title: string
  series: Array<{ label: string; color: string; values: number[] }>
  labels: string[]
  right?: React.ReactNode
}) {
  const w = 920
  const h = 260
  const pad = 20
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  const max = Math.max(
    1,
    ...props.series.flatMap((s) => s.values.map((v) => (Number.isFinite(v) ? v : 0))),
  )

  const points = (vals: number[]) => {
    const n = Math.max(1, vals.length - 1)
    return vals
      .map((v, i) => {
        const x = pad + (i / n) * innerW
        const y = pad + innerH - (Math.max(0, v) / max) * innerH
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div className="vizCard vizCardWide">
      <div className="vizCardHead">
        <div className="vizTitle">{props.title}</div>
        <div className="vizRight">
          <div className="vizKey">
            {props.series.map((s) => (
              <div key={s.label} className="vizKeyItem">
                <span className="vizDot" style={{ background: s.color }} aria-hidden="true" />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          {props.right}
        </div>
      </div>

      <div className="vizChart">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="260" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="vizFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(11,77,187,0.16)" />
              <stop offset="1" stopColor="rgba(11,77,187,0.00)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={w} height={h} fill="rgba(255,255,255,0.55)" />

          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={pad}
              x2={w - pad}
              y1={pad + innerH * t}
              y2={pad + innerH * t}
              stroke="rgba(12,18,28,0.08)"
              strokeWidth="1"
            />
          ))}

          {props.series.map((s) => (
            <polyline
              key={s.label}
              fill="none"
              stroke={s.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points(s.values)}
            />
          ))}
        </svg>
      </div>

      <div className="vizXAxis">
        {props.labels.map((l) => (
          <div key={l} className="vizXTick mono">
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

