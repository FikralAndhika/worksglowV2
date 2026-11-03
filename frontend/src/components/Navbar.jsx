import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loginErr, setLoginErr]  = useState('')
  const [logging, setLogging]    = useState(false)
  const { isEdit, login, logout } = useAuth()
  const loc = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginErr(''); setLogging(true)
    try {
      await login(loginData.username, loginData.password)
      setShowLogin(false)
      setLoginData({ username: '', password: '' })
    } catch (err) {
      setLoginErr(err.message)
    } finally { setLogging(false) }
  }

  const active = (path) => loc.pathname === path ? 'active' : ''

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">Works Glow</Link>

          <button className="hamburger" onClick={() => setOpen(!open)}>
            <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`} />
          </button>

          <ul className={`nav-menu${open ? ' open' : ''}`}>
            <li><Link to="/"        className={active('/')}        onClick={() => setOpen(false)}>Beranda</Link></li>
            <li><a href="/#services"                               onClick={() => setOpen(false)}>Layanan</a></li>
            <li><Link to="/gallery" className={active('/gallery')} onClick={() => setOpen(false)}>Galeri</Link></li>
            <li><Link to="/about"   className={active('/about')}   onClick={() => setOpen(false)}>About Us</Link></li>
            <li><a href="/#contact"                                onClick={() => setOpen(false)}>Kontak</a></li>
          </ul>
        </div>
      </nav>

      {/* Admin button or edit badge */}
      {!isEdit ? (
        <button className="admin-login-btn" onClick={() => setShowLogin(true)}>
          <i className="fas fa-lock" style={{ marginRight: 8 }} /> Admin Login
        </button>
      ) : (
        <div className="edit-badge">
          <span><i className="fas fa-edit" style={{ marginRight: 6 }} />Edit Mode ON</span>
          <Link to="/admin"><i className="fas fa-tachometer-alt" style={{ marginRight: 4 }} />Dashboard</Link>
          <button onClick={() => { if (confirm('Yakin logout?')) logout() }}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: 4 }} />Logout
          </button>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>🔐 Admin Login</h2>
              <p>Works Glow Admin Panel</p>
            </div>
            <div className="modal-body">
              {loginErr && <div className="alert error"><i className="fas fa-exclamation-circle" />{loginErr}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={loginData.username} onChange={e => setLoginData(p => ({ ...p, username: e.target.value }))} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn-primary" disabled={logging}>
                    {logging ? <><i className="fas fa-spinner fa-spin" /> Logging in...</> : 'Login'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLogin(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
