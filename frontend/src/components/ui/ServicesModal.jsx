import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const ICONS = ['fa-car','fa-motorcycle','fa-tools','fa-palette','fa-shield-alt','fa-certificate','fa-paint-brush','fa-wrench','fa-cogs','fa-star','fa-bolt','fa-gem']

export default function ServicesModal({ onClose, onSaved }) {
  const { authFetch } = useAuth()
  const [services, setServices] = useState([])
  const [saving, setSaving]     = useState(false)
  const [alert, setAlert]       = useState(null)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => {
      if (d.status === 'success') setServices(d.data)
    })
  }, [])

  function update(i, key, val) {
    setServices(prev => { const n = [...prev]; n[i] = { ...n[i], [key]: val }; return n })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setAlert(null)
    try {
      const res  = await authFetch('/api/services/update', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ services })
      })
      const data = await res.json()
      if (data.status === 'success') { setAlert({ type:'success', msg:'✅ Services disimpan!' }); setTimeout(() => { onSaved(); onClose() }, 1200) }
      else setAlert({ type:'error', msg: data.message })
    } catch (err) { setAlert({ type:'error', msg: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h2>🛠️ Edit Services</h2><p>Update service cards</p></div>
        <div className="modal-body">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}
          <form onSubmit={handleSave}>
            {services.map((s, i) => (
              <div key={i} className="svc-item">
                <h4>Service {i+1}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Icon</label>
                    <select value={s.icon} onChange={e => update(i,'icon',e.target.value)}>
                      {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input value={s.title} onChange={e => update(i,'title',e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="2" value={s.description} onChange={e => update(i,'description',e.target.value)} required />
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
