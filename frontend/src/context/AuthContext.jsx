import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => localStorage.getItem('adminToken'))
  const [user, setUser]       = useState(() => { try { return JSON.parse(localStorage.getItem('adminUser')) } catch { return null } })
  const [isEdit, setIsEdit]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) verifyToken()
    else setLoading(false)
  }, [])

  async function verifyToken() {
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setUser(data.data)
        setIsEdit(true)
      } else logout(true)
    } catch { logout(true) }
    finally { setLoading(false) }
  }

  async function login(username, password) {
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    const tk = data.data.token
    const u  = data.data.user
    localStorage.setItem('adminToken', tk)
    localStorage.setItem('adminUser', JSON.stringify(u))
    setToken(tk); setUser(u); setIsEdit(true)
    return u
  }

  function logout(silent = false) {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setToken(null); setUser(null); setIsEdit(false)
    if (!silent) window.location.href = '/'
  }

  async function authFetch(url, opts = {}) {
    const headers = { Authorization: `Bearer ${token}`, ...(opts.headers || {}) }
    const res = await fetch(url, { ...opts, headers })
    if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired') }
    return res
  }

  return (
    <AuthContext.Provider value={{ token, user, isEdit, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
