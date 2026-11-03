import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function HeroModal({ onClose, onSaved }) {
  const { authFetch } = useAuth()
  const [slides, setSlides] = useState([
    { subtitle:'', title:'', description:'', image_url:'' },
    { subtitle:'', title:'', description:'', image_url:'' },
    { subtitle:'', title:'', description:'', image_url:'' },
  ])
  const [files, setFiles]   = useState([null, null, null])
  const [previews, setPreviews] = useState([null, null, null])
  const [saving, setSaving] = useState(false)
  const [alert, setAlert]   = useState(null)

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then(d => {
      if (d.status === 'success') {
        setSlides([
          d.data.slide1 || slides[0],
          d.data.slide2 || slides[1],
          d.data.slide3 || slides[2],
        ])
      }
    }).catch(() => {})
  }, [])

  function setFile(i, file) {
    if (!file) return
    const newFiles = [...files]; newFiles[i] = file; setFiles(newFiles)
    const newPrev  = [...previews]; newPrev[i] = URL.createObjectURL(file); setPreviews(newPrev)
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setAlert(null)
    try {
      const fd = new FormData()
      slides.forEach((s, i) => {
        fd.append(`hero${i+1}Subtitle`,     s.subtitle     || '')
        fd.append(`hero${i+1}Title`,        s.title        || '')
        fd.append(`hero${i+1}Description`,  s.description  || '')
        if (files[i]) fd.append(`hero${i+1}Image`, files[i])
      })
      const res  = await authFetch('/api/hero/update', { method:'POST', body: fd })
      const data = await res.json()
      if (data.status === 'success') { setAlert({ type:'success', msg:'✅ Hero disimpan!' }); setTimeout(() => { onSaved(); onClose() }, 1200) }
      else setAlert({ type:'error', msg: data.message })
    } catch (err) { setAlert({ type:'error', msg: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>✏️ Edit Hero Slider</h2>
          <p>Update slide images and text</p>
        </div>
        <div className="modal-body">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}
          <form onSubmit={handleSave}>
            {slides.map((s, i) => (
              <div key={i} style={{ marginBottom:'1.5rem', padding:'1.25rem', border:'1.5px solid #e0e0e0', borderRadius:10 }}>
                <h4 style={{ color:'#667eea', marginBottom:'1rem' }}>Slide {i+1}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Subtitle</label>
                    <input value={s.subtitle || ''} onChange={e => { const n=[...slides]; n[i]={...n[i],subtitle:e.target.value}; setSlides(n) }} />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input value={s.title || ''} onChange={e => { const n=[...slides]; n[i]={...n[i],title:e.target.value}; setSlides(n) }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={s.description || ''} onChange={e => { const n=[...slides]; n[i]={...n[i],description:e.target.value}; setSlides(n) }} />
                </div>
                <div className="form-group">
                  <label>Background Image</label>
                  <div className="upload-zone" onClick={() => document.getElementById(`h${i}img`).click()}>
                    {previews[i] || s.image_url
                      ? <img src={previews[i] || s.image_url} style={{ maxHeight:120, borderRadius:8, objectFit:'cover' }} alt="" />
                      : <><i className="fas fa-cloud-upload-alt" /><p>Klik untuk upload gambar</p></>
                    }
                    <input id={`h${i}img`} type="file" accept="image/*" style={{ display:'none' }} onChange={e => setFile(i, e.target.files[0])} />
                  </div>
                </div>
              </div>
            ))}
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fas fa-save" /> Simpan</>}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
