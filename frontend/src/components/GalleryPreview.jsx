import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#30cfd0,#330867)',
]

export default function GalleryPreview() {
  const [items, setItems] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    fetch('/api/gallery').then(r => r.json()).then(d => {
      if (d.status === 'success') setItems(d.data.slice(0, 6))
    }).catch(() => {})
  }, [])

  return (
    <section className="gallery-section" id="gallery">
      <div className="container">
        <div className="section-title">
          <h2>Galeri Karya</h2>
          <p>Lihat hasil karya terbaik kami dengan kualitas premium</p>
        </div>
        <div className="gallery-grid">
          {items.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gallery-thumb" onClick={() => nav('/gallery')}>
                  <div className="gallery-thumb-placeholder" style={{ background: GRADS[i % GRADS.length] }}>
                    <i className="fas fa-car" />
                  </div>
                </div>
              ))
            : items.map((p, i) => {
                const img = p.images?.find(x => x.is_primary) || p.images?.[0]
                return (
                  <div key={p.id} className="gallery-thumb" onClick={() => nav('/gallery')}>
                    {img
                      ? <img src={img.image_url} alt={p.title} />
                      : <div className="gallery-thumb-placeholder" style={{ background: GRADS[i % GRADS.length] }}><i className="fas fa-car" /></div>
                    }
                  </div>
                )
              })
          }
        </div>
        <div className="gallery-actions">
          <button className="btn-detail" onClick={() => nav('/gallery')}>LIHAT SEMUA GALERI</button>
        </div>
      </div>
    </section>
  )
}
