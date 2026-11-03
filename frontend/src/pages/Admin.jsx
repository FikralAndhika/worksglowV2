import { useState, useEffect } from 'react'
import { Link }     from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'

const ICONS = ['fa-car','fa-motorcycle','fa-tools','fa-palette','fa-shield-alt','fa-certificate','fa-paint-brush','fa-wrench','fa-cogs','fa-star']

export default function Admin() {
  const { token, user, isEdit, loading, login, logout, authFetch } = useAuth()
  const [panel, setPanel]     = useState('overview')
  const [loginForm, setLF]    = useState({ username:'', password:'' })
  const [loginErr, setLE]     = useState('')
  const [logging, setLogging] = useState(false)

  // Data states
  const [stats,   setStats]   = useState({ gallery: '–', services: '–' })
  const [heroData, setHeroData]       = useState(null)
  const [heroFiles, setHeroFiles]     = useState([null,null,null])
  const [heroPreviews, setHeroPreviews] = useState([null,null,null])
  const [services, setServices]       = useState([])
  const [contact,  setContact]        = useState({ address:'', phone:'', email:'', hours:'', mapsLink:'', whatsapp:'' })
  const [profile,  setProfile]        = useState({ full_name:'', bio:'' })
  const [pInfo,    setPInfo]          = useState({ username:'', email:'' })
  const [pwForm,   setPwForm]         = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [alerts,   setAlerts]         = useState({})
  const [saving,   setSaving]         = useState({})

  useEffect(() => { if (isEdit) fetchAll() }, [isEdit])

  async function fetchAll() {
    try {
      const [gal, svc, ct, hero, me] = await Promise.all([
        fetch('/api/gallery').then(r=>r.json()),
        fetch('/api/services').then(r=>r.json()),
        fetch('/api/contact').then(r=>r.json()),
        fetch('/api/hero').then(r=>r.json()),
        fetch('/api/auth/me', { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
      ])
      if (gal.status==='success')  setStats(s => ({ ...s, gallery: gal.data.length }))
      if (svc.status==='success')  { setStats(s => ({ ...s, services: svc.data.length })); setServices(svc.data) }
      if (ct.status==='success')   setContact(ct.data)
      if (hero.status==='success') {
        setHeroData([hero.data.slide1||{}, hero.data.slide2||{}, hero.data.slide3||{}])
      }
      if (me.status==='success') {
        setProfile({ full_name: me.data.full_name||'', bio: me.data.bio||'' })
        setPInfo({ username: me.data.username||'', email: me.data.email||'' })
      }
    } catch {}
  }

  function setAlert(key, type, msg) {
    setAlerts(a => ({ ...a, [key]: { type, msg } }))
    if (type === 'success') setTimeout(() => setAlerts(a => ({ ...a, [key]: null })), 3000)
  }
  function setSav(key, val) { setSaving(s => ({ ...s, [key]: val })) }

  async function doLogin(e) {
    e.preventDefault(); setLE(''); setLogging(true)
    try { await login(loginForm.username, loginForm.password) }
    catch (err) { setLE(err.message) }
    finally { setLogging(false) }
  }

  async function saveHero(e) {
    e.preventDefault(); setSav('hero', true)
    try {
      const fd = new FormData()
      heroData?.forEach((s, i) => {
        fd.append(`hero${i+1}Subtitle`,    s.subtitle    || '')
        fd.append(`hero${i+1}Title`,       s.title       || '')
        fd.append(`hero${i+1}Description`, s.description || '')
        if (heroFiles[i]) fd.append(`hero${i+1}Image`, heroFiles[i])
      })
      const res  = await authFetch('/api/hero/update', { method:'POST', body: fd })
      const data = await res.json()
      data.status==='success' ? setAlert('hero','success','✅ Hero disimpan!') : setAlert('hero','error', data.message)
    } catch (err) { setAlert('hero','error', err.message) }
    finally { setSav('hero', false) }
  }

  async function saveServices(e) {
    e.preventDefault(); setSav('svc', true)
    try {
      const res  = await authFetch('/api/services/update', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ services }) })
      const data = await res.json()
      data.status==='success' ? setAlert('svc','success','✅ Services disimpan!') : setAlert('svc','error', data.message)
    } catch (err) { setAlert('svc','error', err.message) }
    finally { setSav('svc', false) }
  }

  async function saveContact(e) {
    e.preventDefault(); setSav('ct', true)
    try {
      const res  = await authFetch('/api/contact/update', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(contact) })
      const data = await res.json()
      data.status==='success' ? setAlert('ct','success','✅ Contact disimpan!') : setAlert('ct','error', data.message)
    } catch (err) { setAlert('ct','error', err.message) }
    finally { setSav('ct', false) }
  }

  async function saveProfile(e) {
    e.preventDefault(); setSav('prof', true)
    try {
      const res  = await authFetch('/api/auth/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(profile) })
      const data = await res.json()
      if (data.status==='success') {
        setAlert('prof','success','✅ Profile disimpan!')
        setProfile({ full_name: data.data.full_name||'', bio: data.data.bio||'' })
      } else setAlert('prof','error', data.message)
    } catch (err) { setAlert('prof','error', err.message) }
    finally { setSav('prof', false) }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) { setAlert('pw','error','Password baru tidak cocok'); return }
    if (pwForm.newPassword.length < 6) { setAlert('pw','error','Minimal 6 karakter'); return }
    setSav('pw', true)
    try {
      const res  = await authFetch('/api/auth/change-password', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) })
      const data = await res.json()
      if (data.status==='success') { setAlert('pw','success','✅ Password diubah!'); setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' }) }
      else setAlert('pw','error', data.message)
    } catch (err) { setAlert('pw','error', err.message) }
    finally { setSav('pw', false) }
  }

  // Render helper
  const Alert = ({ k }) => alerts[k] ? <div className={`alert ${alerts[k].type}`} style={{ marginBottom:'1rem' }}>{alerts[k].msg}</div> : null
  const SaveBtn = ({ k, label = 'Simpan' }) => (
    <button type="submit" className="btn-save" disabled={saving[k]}>
      {saving[k] ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fas fa-save" /> {label}</>}
    </button>
  )

  const name    = user?.full_name || user?.username || 'Admin'
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  // ── LOCK SCREEN ───────────────────────────────────────────
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" /></div>

  if (!isEdit) return (
    <div className="lock-screen">
      <div className="lock-box">
        <h2>🔐 Admin Login</h2>
        <p>Works Glow Admin Dashboard</p>
        {loginErr && <div className="alert error" style={{ marginBottom:'1rem' }}>{loginErr}</div>}
        <form onSubmit={doLogin}>
          <div className="form-group"><label>Username</label><input type="text" value={loginForm.username} onChange={e=>setLF(p=>({...p,username:e.target.value}))} required autoFocus /></div>
          <div className="form-group"><label>Password</label><input type="password" value={loginForm.password} onChange={e=>setLF(p=>({...p,password:e.target.value}))} required /></div>
          <button type="submit" className="btn-save" style={{ width:'100%', justifyContent:'center' }} disabled={logging}>
            {logging ? <><i className="fas fa-spinner fa-spin" /> Logging in...</> : <><i className="fas fa-sign-in-alt" /> Login</>}
          </button>
        </form>
      </div>
    </div>
  )

  // ── DASHBOARD ─────────────────────────────────────────────
  const NAV = [
    { id:'overview',  icon:'fa-home',        label:'Overview',       group:'Overview' },
    { id:'hero',      icon:'fa-images',       label:'Hero Slider',    group:'Content' },
    { id:'services',  icon:'fa-tools',        label:'Services',       group:'Content' },
    { id:'gallery',   icon:'fa-photo-video',  label:'Gallery',        group:'Content' },
    { id:'contact',   icon:'fa-phone',        label:'Contact',        group:'Content' },
    { id:'profile',   icon:'fa-user-cog',     label:'Profile & Bio',  group:'Account' },
    { id:'password',  icon:'fa-key',          label:'Change Password',group:'Account' },
  ]

  const panelLabel = NAV.find(n=>n.id===panel)?.label || ''

  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo"><h1>Works Glow</h1><span>Admin Dashboard</span></div>
        <nav className="sidebar-nav">
          {['Overview','Content','Account'].map(group => (
            <div key={group}>
              <div className="nav-section-label">{group}</div>
              {NAV.filter(n => n.group === group).map(n => (
                <button key={n.id} className={`sidebar-item${panel === n.id ? ' active' : ''}`} onClick={() => setPanel(n.id)}>
                  <i className={`fas ${n.icon}`} />{n.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-admin">
            <div className="s-avatar">{initials}</div>
            <div><div className="s-name">{name}</div><div className="s-role">Admin</div></div>
          </div>
          <button className="btn-logout" onClick={() => confirm('Yakin logout?') && logout()}>
            <i className="fas fa-sign-out-alt" />Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div><h2>{panelLabel}</h2><div className="topbar-sub">Works Glow Admin</div></div>
          <a href="/" target="_blank" className="btn-visit"><i className="fas fa-external-link-alt" />Lihat Website</a>
        </div>

        <div className="admin-content">

          {/* ── OVERVIEW ── */}
          {panel === 'overview' && (
            <div className="admin-panel active">
              <div className="stat-cards">
                <div className="stat-card"><div className="stat-icon purple"><i className="fas fa-photo-video" /></div><div><div className="stat-num">{stats.gallery}</div><div className="stat-lbl">Gallery Projects</div></div></div>
                <div className="stat-card"><div className="stat-icon green"><i className="fas fa-tools" /></div><div><div className="stat-num">{stats.services}</div><div className="stat-lbl">Active Services</div></div></div>
                <div className="stat-card"><div className="stat-icon blue"><i className="fas fa-images" /></div><div><div className="stat-num">3</div><div className="stat-lbl">Hero Slides</div></div></div>
                <div className="stat-card"><div className="stat-icon pink"><i className="fas fa-globe" /></div><div><div className="stat-num">Live</div><div className="stat-lbl">Website Status</div></div></div>
              </div>
              <div className="quick-grid">
                <a href="/" target="_blank" className="quick-card"><i className="fas fa-home" /><h3>Homepage</h3><p>Edit Hero, Services &amp; Contact</p></a>
                <a href="/gallery" target="_blank" className="quick-card"><i className="fas fa-photo-video" /><h3>Gallery</h3><p>Tambah / edit project galeri</p></a>
                <a href="/about" target="_blank" className="quick-card"><i className="fas fa-info-circle" /><h3>About Us</h3><p>Edit sejarah, visi, misi &amp; nilai</p></a>
                <div className="quick-card" style={{ cursor:'pointer' }} onClick={() => setPanel('profile')}><i className="fas fa-user-cog" /><h3>Profile</h3><p>Edit nama &amp; bio admin</p></div>
              </div>
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-lightbulb" />Petunjuk</h3></div>
                <div className="admin-card-body" style={{ fontSize:'.9rem', lineHeight:1.8, color:'#555' }}>
                  <p><strong>1.</strong> Setiap halaman (Home, Gallery, About) punya tombol <em>Edit</em> yang muncul saat login.</p>
                  <p><strong>2.</strong> Untuk gallery: login → buka <Link to="/gallery" style={{ color:'#667eea' }}>halaman Gallery</Link> → klik tombol <strong>+</strong> di pojok kanan bawah.</p>
                  <p><strong>3.</strong> Ganti password di menu <strong>Change Password</strong> sidebar kiri.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── HERO ── */}
          {panel === 'hero' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-images" />Edit Hero Slider</h3></div>
                <div className="admin-card-body">
                  <Alert k="hero" />
                  <form onSubmit={saveHero}>
                    {heroData?.map((s, i) => (
                      <div key={i} style={{ border:'1.5px solid #e0e4e8', borderRadius:10, padding:'1.25rem', marginBottom:'1rem', background:'#fafafa' }}>
                        <h4 style={{ color:'#667eea', marginBottom:'.75rem', fontSize:'.9rem' }}>Slide {i+1}</h4>
                        <div className="form-row">
                          <div className="form-group"><label>Subtitle</label><input value={s.subtitle||''} onChange={e => setHeroData(p => { const n=[...p]; n[i]={...n[i],subtitle:e.target.value}; return n })} /></div>
                          <div className="form-group"><label>Title</label><input value={s.title||''} onChange={e => setHeroData(p => { const n=[...p]; n[i]={...n[i],title:e.target.value}; return n })} /></div>
                        </div>
                        <div className="form-group"><label>Description</label><input value={s.description||''} onChange={e => setHeroData(p => { const n=[...p]; n[i]={...n[i],description:e.target.value}; return n })} /></div>
                        <div className="form-group">
                          <label>Background Image</label>
                          <div className="upload-zone" onClick={() => document.getElementById(`adh${i}`).click()}>
                            {heroPreviews[i] || s.image_url
                              ? <img src={heroPreviews[i]||s.image_url} style={{ maxHeight:100, borderRadius:8, objectFit:'cover' }} alt="" />
                              : <><i className="fas fa-cloud-upload-alt" /><p>Klik upload gambar</p></>
                            }
                            <input id={`adh${i}`} type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                              const f=e.target.files[0]; if(!f) return
                              setHeroFiles(p => { const n=[...p]; n[i]=f; return n })
                              setHeroPreviews(p => { const n=[...p]; n[i]=URL.createObjectURL(f); return n })
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <SaveBtn k="hero" label="Simpan Hero" />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {panel === 'services' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-tools" />Edit Services</h3></div>
                <div className="admin-card-body">
                  <Alert k="svc" />
                  <form onSubmit={saveServices}>
                    {services.map((s, i) => (
                      <div key={i} className="svc-item">
                        <h4>Service {i+1}</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Icon</label>
                            <select value={s.icon} onChange={e => setServices(p => { const n=[...p]; n[i]={...n[i],icon:e.target.value}; return n })}>
                              {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                            </select>
                          </div>
                          <div className="form-group"><label>Title</label><input value={s.title} onChange={e => setServices(p => { const n=[...p]; n[i]={...n[i],title:e.target.value}; return n })} /></div>
                        </div>
                        <div className="form-group"><label>Description</label><textarea rows="2" value={s.description} onChange={e => setServices(p => { const n=[...p]; n[i]={...n[i],description:e.target.value}; return n })} /></div>
                      </div>
                    ))}
                    <SaveBtn k="svc" label="Simpan Services" />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── GALLERY ── */}
          {panel === 'gallery' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-photo-video" />Gallery</h3></div>
                <div className="admin-card-body">
                  <p style={{ color:'#888', fontSize:'.9rem', marginBottom:'1rem' }}>Kelola gallery langsung dari halaman <strong><a href="/gallery" target="_blank" style={{ color:'#667eea' }}>Gallery</a></strong> — login dulu agar tombol Edit/Hapus/+ muncul.</p>
                  <a href="/gallery" target="_blank" className="btn-save" style={{ textDecoration:'none', display:'inline-flex' }}>
                    <i className="fas fa-external-link-alt" />Buka Gallery Manager
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {panel === 'contact' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-phone" />Edit Contact</h3></div>
                <div className="admin-card-body">
                  <Alert k="ct" />
                  <form onSubmit={saveContact}>
                    <div className="form-group"><label>Alamat</label><textarea rows="3" value={contact.address||''} onChange={e => setContact(p => ({...p,address:e.target.value}))} /></div>
                    <div className="form-row">
                      <div className="form-group"><label>Telepon</label><input value={contact.phone||''} onChange={e => setContact(p => ({...p,phone:e.target.value}))} /></div>
                      <div className="form-group"><label>Email</label><input type="email" value={contact.email||''} onChange={e => setContact(p => ({...p,email:e.target.value}))} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Jam Operasional</label><input value={contact.hours||''} onChange={e => setContact(p => ({...p,hours:e.target.value}))} /></div>
                      <div className="form-group"><label>WhatsApp Number</label><input value={contact.whatsapp||''} onChange={e => setContact(p => ({...p,whatsapp:e.target.value}))} /></div>
                    </div>
                    <div className="form-group"><label>Google Maps Link</label><input type="url" value={contact.mapsLink||''} onChange={e => setContact(p => ({...p,mapsLink:e.target.value}))} /></div>
                    <SaveBtn k="ct" label="Simpan Contact" />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {panel === 'profile' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-user-cog" />Profile &amp; Bio</h3></div>
                <div className="admin-card-body" style={{ maxWidth:560 }}>
                  <Alert k="prof" />
                  <form onSubmit={saveProfile}>
                    <div className="form-row">
                      <div className="form-group"><label>Username</label><input value={pInfo.username} disabled style={{ background:'#f0f2f5', color:'#888' }} /></div>
                      <div className="form-group"><label>Email</label><input value={pInfo.email} disabled style={{ background:'#f0f2f5', color:'#888' }} /></div>
                    </div>
                    <div className="form-group"><label>Full Name</label><input value={profile.full_name} onChange={e => setProfile(p => ({...p,full_name:e.target.value}))} /></div>
                    <div className="form-group"><label>Bio</label><textarea rows="4" value={profile.bio} onChange={e => setProfile(p => ({...p,bio:e.target.value}))} placeholder="Ceritakan sedikit tentang Anda..." /></div>
                    <SaveBtn k="prof" label="Simpan Profile" />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ── CHANGE PASSWORD ── */}
          {panel === 'password' && (
            <div className="admin-panel active">
              <div className="admin-card">
                <div className="admin-card-header"><h3><i className="fas fa-key" />Ganti Password</h3></div>
                <div className="admin-card-body" style={{ maxWidth:480 }}>
                  <Alert k="pw" />
                  <form onSubmit={savePassword}>
                    <div className="form-group"><label>Password Sekarang</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({...p,currentPassword:e.target.value}))} required /></div>
                    <div className="form-group"><label>Password Baru</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({...p,newPassword:e.target.value}))} required minLength="6" /></div>
                    <div className="form-group"><label>Konfirmasi Password Baru</label><input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({...p,confirmPassword:e.target.value}))} required /></div>
                    <SaveBtn k="pw" label="Ganti Password" />
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
