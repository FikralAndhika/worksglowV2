import { useState, useEffect } from 'react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const logo = '/logo.png' // place your logo in frontend/public/logo.png

const DEFAULT_VALUES = [
  {icon:'fa-star',title:'Kualitas Premium',description:'Menggunakan cat dan material terbaik dengan standar internasional.'},
  {icon:'fa-users',title:'Profesionalisme',description:'Tim ahli dengan pengalaman bertahun-tahun.'},
  {icon:'fa-lightbulb',title:'Inovasi',description:'Selalu mengikuti perkembangan teknologi terbaru.'},
  {icon:'fa-clock',title:'Ketepatan Waktu',description:'Menghargai waktu pelanggan.'},
  {icon:'fa-handshake',title:'Integritas',description:'Berkomitmen pada kejujuran dan transparansi.'},
  {icon:'fa-heart',title:'Passion',description:'Mengerjakan setiap proyek dengan dedikasi tinggi.'},
]
const DEFAULT_STATS = [
  {number:'8+',label:'Tahun Pengalaman'},{number:'2500+',label:'Kendaraan Ditangani'},
  {number:'98%',label:'Kepuasan Pelanggan'},{number:'15+',label:'Tim Profesional'},
]
const ICONS = ['fa-star','fa-users','fa-lightbulb','fa-clock','fa-handshake','fa-heart','fa-award','fa-trophy','fa-certificate','fa-shield-alt','fa-thumbs-up','fa-gem','fa-bolt','fa-fire','fa-rocket']

export default function About() {
  const { isEdit, authFetch } = useAuth()
  const [data, setData]     = useState(null)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({})
  const [saving, setSaving] = useState(false)
  const [alert, setAlert]   = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch('/api/about'); const d = await r.json()
    if (d.status === 'success') setData(d.data)
  }

  function openModal(section) {
    setAlert(null)
    if (section === 'hero') setForm({ title: data?.hero?.title||'', subtitle: data?.hero?.subtitle||'' })
    if (section === 'history') setForm({ title: data?.history?.title||'', p1: data?.history?.paragraphs?.[0]||'', p2: data?.history?.paragraphs?.[1]||'', p3: data?.history?.paragraphs?.[2]||'' })
    if (section === 'vm') setForm({ visionContent: data?.vision?.content||'', missionContent: data?.mission?.content||'' })
    if (section === 'values') setForm({ title: data?.values?.title||'', subtitle: data?.values?.subtitle||'', items: data?.values?.items || DEFAULT_VALUES })
    if (section === 'stats') setForm({ title: data?.stats?.title||'', subtitle: data?.stats?.subtitle||'', items: data?.stats?.items || DEFAULT_STATS })
    setModal(section)
  }

  async function save(sections) {
    setSaving(true); setAlert(null)
    try {
      const res = await authFetch('/api/about/update', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sections })
      })
      const d = await res.json()
      if (d.status === 'success') { setAlert({ type:'success', msg:'✅ Disimpan!' }); await load(); setTimeout(() => setModal(null), 900) }
      else setAlert({ type:'error', msg: d.message })
    } catch (err) { setAlert({ type:'error', msg: err.message }) }
    finally { setSaving(false) }
  }

  const hero    = data?.hero
  const history = data?.history
  const vision  = data?.vision
  const mission = data?.mission
  const values  = data?.values
  const stats   = data?.stats

  return (
    <div className={isEdit ? 'edit-mode' : ''}>
      <Navbar />

      {/* Hero */}
      <section className="about-hero">
        {isEdit && <button className="edit-section-btn" onClick={() => openModal('hero')} style={{ display:'inline-flex' }}><i className="fas fa-edit" />Edit</button>}
        <div className="container">
          <h1>{hero?.title || 'Tentang Works Glow'}</h1>
          <p>{hero?.subtitle || 'Bengkel cat profesional yang telah dipercaya sejak 2015'}</p>
        </div>
      </section>

      {/* History */}
      <section className="about-content-section" style={{ position:'relative' }}>
        {isEdit && <button className="edit-section-btn" onClick={() => openModal('history')} style={{ display:'inline-flex' }}><i className="fas fa-edit" />Edit</button>}
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>{history?.title || 'Sejarah Kami'}</h2>
              {(history?.paragraphs || ['','','']).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="about-img-box">
              <img src={logo} alt="Works Glow" onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Mission */}
      <section className="mission-vision-section" style={{ position:'relative' }}>
        {isEdit && <button className="edit-section-btn" onClick={() => openModal('vm')} style={{ display:'inline-flex' }}><i className="fas fa-edit" />Edit</button>}
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <i className="fas fa-eye" />
              <h3>Visi</h3>
              <p>{vision?.content || 'Menjadi bengkel cat kendaraan terdepan di Indonesia.'}</p>
            </div>
            <div className="mv-card">
              <i className="fas fa-bullseye" />
              <h3>Misi</h3>
              <p>{mission?.content || 'Memberikan layanan cat kendaraan berkualitas tinggi.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section" style={{ position:'relative' }}>
        {isEdit && <button className="edit-section-btn" onClick={() => openModal('values')} style={{ display:'inline-flex' }}><i className="fas fa-edit" />Edit</button>}
        <div className="container">
          <div className="section-title">
            <h2>{values?.title || 'Nilai-Nilai Kami'}</h2>
            <p>{values?.subtitle || 'Prinsip yang menjadi fondasi dalam setiap layanan Works Glow'}</p>
          </div>
          <div className="values-grid">
            {(values?.items || DEFAULT_VALUES).map((v, i) => (
              <div className="value-item" key={i}>
                <i className={`fas ${v.icon}`} />
                <h4>{v.title}</h4>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" style={{ position:'relative' }}>
        {isEdit && <button className="edit-section-btn" onClick={() => openModal('stats')} style={{ display:'inline-flex' }}><i className="fas fa-edit" />Edit</button>}
        <div className="container">
          <div className="section-title">
            <h2>{stats?.title || 'Works Glow dalam Angka'}</h2>
            <p>{stats?.subtitle || 'Prestasi dan pencapaian yang membanggakan'}</p>
          </div>
          <div className="stats-grid">
            {(stats?.items || DEFAULT_STATS).map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ── MODALS ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2>✏️ Edit {modal === 'hero' ? 'Hero' : modal === 'history' ? 'Sejarah' : modal === 'vm' ? 'Visi & Misi' : modal === 'values' ? 'Nilai-Nilai' : 'Statistik'}</h2>
            </div>
            <div className="modal-body">
              {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}

              {/* HERO */}
              {modal === 'hero' && (
                <form onSubmit={e => { e.preventDefault(); save({ hero: { title: form.title, subtitle: form.subtitle } }) }}>
                  <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="form-group"><label>Subtitle</label><textarea rows="2" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
                  <ModalFoot saving={saving} onClose={() => setModal(null)} />
                </form>
              )}

              {/* HISTORY */}
              {modal === 'history' && (
                <form onSubmit={e => { e.preventDefault(); save({ history: { title: form.title, paragraphs: [form.p1, form.p2, form.p3] } }) }}>
                  <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                  {[1,2,3].map(n => <div className="form-group" key={n}><label>Paragraph {n}</label><textarea rows="3" value={form[`p${n}`]} onChange={e => setForm(p => ({ ...p, [`p${n}`]: e.target.value }))} /></div>)}
                  <ModalFoot saving={saving} onClose={() => setModal(null)} />
                </form>
              )}

              {/* VISION & MISSION */}
              {modal === 'vm' && (
                <form onSubmit={e => { e.preventDefault(); save({ vision: { title:'Visi', icon:'fa-eye', content: form.visionContent }, mission: { title:'Misi', icon:'fa-bullseye', content: form.missionContent } }) }}>
                  <div className="form-group"><label>Visi</label><textarea rows="4" value={form.visionContent} onChange={e => setForm(p => ({ ...p, visionContent: e.target.value }))} /></div>
                  <div className="form-group"><label>Misi</label><textarea rows="4" value={form.missionContent} onChange={e => setForm(p => ({ ...p, missionContent: e.target.value }))} /></div>
                  <ModalFoot saving={saving} onClose={() => setModal(null)} />
                </form>
              )}

              {/* VALUES */}
              {modal === 'values' && (
                <form onSubmit={e => { e.preventDefault(); save({ values: { title: form.title, subtitle: form.subtitle, items: form.items } }) }}>
                  <div className="form-row">
                    <div className="form-group"><label>Section Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                    <div className="form-group"><label>Subtitle</label><input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
                  </div>
                  {form.items?.map((item, i) => (
                    <div key={i} style={{ border:'1px solid #e0e0e0', borderRadius:8, padding:'1rem', marginBottom:'.75rem', background:'#fafafa' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
                        <strong style={{ fontSize:'.85rem', color:'#667eea' }}>Item {i+1}</strong>
                        <button type="button" style={{ background:'#f44336', color:'#fff', border:'none', borderRadius:6, padding:'2px 10px', fontSize:'.8rem' }}
                          onClick={() => setForm(p => ({ ...p, items: p.items.filter((_,idx) => idx !== i) }))}>Hapus</button>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Icon</label>
                          <select value={item.icon} onChange={e => setForm(p => { const items=[...p.items]; items[i]={...items[i],icon:e.target.value}; return {...p,items} })}>
                            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Title</label>
                          <input value={item.title} onChange={e => setForm(p => { const items=[...p.items]; items[i]={...items[i],title:e.target.value}; return {...p,items} })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea rows="2" value={item.description} onChange={e => setForm(p => { const items=[...p.items]; items[i]={...items[i],description:e.target.value}; return {...p,items} })} />
                      </div>
                    </div>
                  ))}
                  <button type="button" style={{ background:'#28a745', color:'#fff', border:'none', borderRadius:6, padding:'8px 16px', fontWeight:600, marginBottom:'1rem' }}
                    onClick={() => setForm(p => ({ ...p, items: [...(p.items||[]), { icon:'fa-star', title:'', description:'' }] }))}>
                    <i className="fas fa-plus" /> Tambah Item
                  </button>
                  <ModalFoot saving={saving} onClose={() => setModal(null)} />
                </form>
              )}

              {/* STATS */}
              {modal === 'stats' && (
                <form onSubmit={e => { e.preventDefault(); save({ stats: { title: form.title, subtitle: form.subtitle, items: form.items } }) }}>
                  <div className="form-row">
                    <div className="form-group"><label>Section Title</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                    <div className="form-group"><label>Subtitle</label><input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
                  </div>
                  {form.items?.map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:'1rem', alignItems:'flex-end', marginBottom:'.75rem' }}>
                      <div className="form-group" style={{ flex:1, margin:0 }}>
                        <label>Number</label>
                        <input value={item.number} placeholder="8+" onChange={e => setForm(p => { const items=[...p.items]; items[i]={...items[i],number:e.target.value}; return {...p,items} })} />
                      </div>
                      <div className="form-group" style={{ flex:2, margin:0 }}>
                        <label>Label</label>
                        <input value={item.label} placeholder="Tahun Pengalaman" onChange={e => setForm(p => { const items=[...p.items]; items[i]={...items[i],label:e.target.value}; return {...p,items} })} />
                      </div>
                      <button type="button" style={{ background:'#f44336', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', marginBottom:0 }}
                        onClick={() => setForm(p => ({ ...p, items: p.items.filter((_,idx) => idx !== i) }))}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))}
                  <button type="button" style={{ background:'#28a745', color:'#fff', border:'none', borderRadius:6, padding:'8px 16px', fontWeight:600, marginBottom:'1rem' }}
                    onClick={() => setForm(p => ({ ...p, items: [...(p.items||[]), { number:'', label:'' }] }))}>
                    <i className="fas fa-plus" /> Tambah Statistik
                  </button>
                  <ModalFoot saving={saving} onClose={() => setModal(null)} />
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalFoot({ saving, onClose }) {
  return (
    <div className="modal-footer">
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fas fa-save" /> Simpan</>}
      </button>
      <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
    </div>
  )
}
