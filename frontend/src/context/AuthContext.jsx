import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, TOKEN_KEY } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Restore the session from a stored token
  useEffect(() => {
    if (!getToken()) return setReady(true)
    api('/user/me').then(({ ok, data }) => {
      if (ok) setUser(data.user)
      else localStorage.removeItem(TOKEN_KEY)
      setReady(true)
    })
  }, [])

  const authenticate = useCallback(async (mode, credentials) => {
    const { ok, data } = await api(`/user/${mode}`, { method: 'POST', body: credentials })
    if (ok) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
    }
    return { ok, message: data.message }
  }, [])

  const logout = useCallback(async () => {
    await api('/user/logout', { method: 'POST' })
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
