const TOKEN_KEY = 'rcc_biotime_token_v1'
const AUTH_CHANGED_EVENT = 'rcc_auth_changed_v1'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string, persist: boolean) {
  try {
    if (persist) {
      localStorage.setItem(TOKEN_KEY, token)
      sessionStorage.removeItem(TOKEN_KEY)
    } else {
      sessionStorage.setItem(TOKEN_KEY, token)
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

export function onAuthChanged(cb: () => void) {
  try {
    window.addEventListener(AUTH_CHANGED_EVENT, cb)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, cb)
  } catch {
    return () => {}
  }
}
