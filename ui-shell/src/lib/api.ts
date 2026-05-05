export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

// In production we run behind nginx and proxy API under `/api`.
// In local dev you can set VITE_API_URL="http://localhost:3000".
export const API_URL = (import.meta as any).env?.VITE_API_URL ?? '/api'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let token: string | null = null
  try {
    token = localStorage.getItem('rcc_biotime_token_v1') ?? sessionStorage.getItem('rcc_biotime_token_v1')
  } catch {
    token = null
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    if (res.status === 403) message = 'Access denied'
    if (data && typeof data === 'object') {
      const m = (data as any).message
      if (Array.isArray(m)) message = m.join(', ')
      else if (typeof m === 'string') message = m
    }
    throw new ApiError(message, res.status, data)
  }

  return data as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}
