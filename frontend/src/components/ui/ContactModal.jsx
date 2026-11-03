import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ContactModal({ onClose, onSaved }) {
  const { authFetch } = useAuth()
  const [form, setForm]   = useState({ address:'', phone:'', email:'', hours:'', mapsLink:'', whatsapp:'' })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert]   = useState(null)

  useEffect(() => {
    fetch('/api/contact').then(r => r.json()).then(d => { if (d.status==='success') setForm(d.data) })
  }, [])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setAlert(null)
    try {
      const res  = await authFetch('/api/contact/update', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.status==='success') { setAlert({ type:'success', msg:'✅ Contact disimpan!' }); setTimeout(() => { onSaved(); onClose() }, 1200) }
      else setAlert({ type:'error', msg: data.message })
    } catch (err) { setAlert({ type:'error', msg: err.message }) }
    finally { setSaving(false) }
  }

  const F = (key, label, type='text') => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={form[key]||''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h2>📞 Edit Contact</h2></div>
        <div className="modal-body">
          {alert && <div className={`alert ${alert.type}`}>{alert.msg}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Alamat</label>
              <textarea rows="3" value={form.address||''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="form-row">
              {F('phone','Telepon')}
              {F('email','Email','email')}
            </div>
            <div className="form-row">
              {F('hours','Jam Operasional')}
              {F('whatsapp','WhatsApp Number')}
            </div>
            {F('mapsLink','Google Maps Link','url')}
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
