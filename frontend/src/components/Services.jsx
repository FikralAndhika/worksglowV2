import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const DEFAULT = [
  { icon:'fa-car',         title:'Cat Mobil',        description:'Layanan cat mobil profesional dengan hasil sempurna dan tahan lama.' },
  { icon:'fa-motorcycle',  title:'Cat Motor',        description:'Spesialis cat motor dengan berbagai pilihan warna dan finishing.' },
  { icon:'fa-tools',       title:'Body Repair',      description:'Layanan perbaikan body kendaraan dengan teknik terbaik.' },
  { icon:'fa-palette',     title:'Custom Paint',     description:'Desain cat custom sesuai keinginan Anda.' },
  { icon:'fa-shield-alt',  title:'Paint Protection', description:'Layanan perlindungan cat kendaraan dengan coating berkualitas tinggi.' },
  { icon:'fa-certificate', title:'Warranty',         description:'Garansi resmi untuk setiap pekerjaan kami.' },
]

export default function Services({ onEdit }) {
  const [services, setServices] = useState(DEFAULT)
  const { isEdit } = useAuth()

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => {
      if (d.status === 'success' && d.data?.length) setServices(d.data)
    }).catch(() => {})
  }, [])

  return (
    <section className="services" id="services" style={{ position:'relative' }}>
      {isEdit && (
        <button className="edit-section-btn" onClick={onEdit} style={{ display:'inline-flex' }}>
          <i className="fas fa-edit" />Edit Services
        </button>
      )}
      <div className="container">
        <div className="section-title">
          <h2>Layanan Kami</h2>
          <p>Kami menyediakan berbagai layanan cat berkualitas tinggi untuk kebutuhan Anda</p>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon"><i className={`fas ${s.icon}`} /></div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
