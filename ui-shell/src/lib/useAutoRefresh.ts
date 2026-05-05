import { useEffect, useRef } from 'react'

/**
 * Runs `fn` immediately and then every `intervalMs` while mounted.
 * Ensures only one in-flight call at a time.
 */
export function useAutoRefresh(fn: () => Promise<void>, intervalMs: number) {
  const inFlight = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      if (cancelled) return
      if (inFlight.current) return
      inFlight.current = true
      try {
        await fn()
      } finally {
        inFlight.current = false
      }
    }

    void tick()
    const t = setInterval(() => void tick(), intervalMs)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [fn, intervalMs])
}

