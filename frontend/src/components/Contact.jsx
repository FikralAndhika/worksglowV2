import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const DEFAULT = {
  address:'Jl. Pasir Pogor Raya No.7 Blok DD No.6, Mekarjaya, Kec. Rancasari, Kota Bandung, Jawa Barat 40292',
  phone:'+62 856-0629-6686', email:'info@worksglow.com',
  hours:'Senin - Sabtu: 08:00 - 17:00',
  mapsLink:'https://maps.app.goo.gl/SkXTYsDLL7NzeyRz5', whatsapp:'6285606296686'
}

export default function Contact({ onEdit }) {
  const [info, setInfo] = useState(DEFAULT)
  const [form, setForm] = useState({ name:'', email:'', phone:'', service:'', message:'' })
  const { isEdit } = useAuth()

  useEffect(() => {
    fetch('/api/contact').then(r => r.json()).then(d => {
      if (d.status === 'success') setInfo(d.data)
    }).catch(() => {})
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const msg = `Halo Works Glow!%0A%0ANama: ${form.name}%0AEmail: ${form.email}%0ATelepon: ${form.phone}%0ALayanan: ${form.service}%0APesan: ${form.message}`
    window.open(`https://wa.me/${info.whatsapp}?text=${msg}`, '_blank')
  }

  return (
    <section className="contact" id="contact" style={{ position:'relative' }}>
      {isEdit && (
        <button className="edit-section-btn" onClick={onEdit} style={{ display:'inline-flex' }}>
          <i className="fas fa-edit" />Edit Contact
        </button>
      )}
      <div className="container">
        <div className="section-title">
          <h2>Hubungi Kami</h2>
          <p>Siap melayani kebutuhan cat kendaraan Anda dengan kualitas terbaik</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Informasi Kontak</h3>
            <a href={info.mapsLink} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt" />
                <div><strong>Alamat</strong>{info.address}</div>
              </div>
            </a>
            <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
              <div className="contact-item">
                <i className="fas fa-phone" />
                <div><strong>Telepon</strong>{info.phone}</div>
              </div>
            </a>
            <div className="contact-item">
              <i className="fas fa-envelope" />
              <div><strong>Email</strong>{info.email}</div>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock" />
              <div><strong>Jam Buka</strong>{info.hours}</div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {['name','email','phone','service'].map(f => (
              <div className="form-group" key={f}>
                <label>{f.charAt(0).toUpperCase()+f.slice(1)}</label>
                <input
                  type={f === 'email' ? 'email' : 'text'}
                  value={form[f]}
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder={f === 'service' ? 'Cat mobil, motor, custom, dll.' : ''}
                  required={f !== 'service'}
                />
              </div>
            ))}
            <div className="form-group">
              <label>Pesan</label>
              <textarea rows="4" placeholder="Deskripsikan kebutuhan Anda..."
                value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
            </div>
            <button type="submit" className="submit-btn">Kirim via WhatsApp</button>
          </form>
        </div>
      </div>
    </section>
  )
}
