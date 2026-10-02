import getFingerprint from '../utils/getFingerprint'

const BASE_URL = import.meta.env.VITE_BASE_URL
export const TOKEN_KEY = 'ai.hr'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

let fingerprintPromise
const clientId = () => (fingerprintPromise ??= getFingerprint().catch(() => ''))

// fetch wrapper: adds auth + guest id headers and always resolves to { ok, status, data }
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const finalHeaders = { 'X-Client-Id': await clientId(), ...headers }
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  let payload = body
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, { method, headers: finalHeaders, body: payload })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { message: "Can't reach the server. Check your connection and try again" } }
  }
}
