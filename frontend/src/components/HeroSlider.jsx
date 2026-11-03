import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const DEFAULT = [
  { subtitle:'Make A Desire',        title:'WORKS GLOW',      description:'Bengkel Cat Profesional dengan Kualitas Premium', image_url: null },
  { subtitle:'Professional Service', title:'PREMIUM QUALITY', description:'Hasil Cat Terbaik dengan Teknologi Modern',        image_url: null },
  { subtitle:'Expert Team',          title:'SATISFACTION',    description:'Kepuasan Pelanggan adalah Prioritas Utama',        image_url: null },
]

const GRADS = [
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
]

export default function HeroSlider({ onEdit }) {
  const [slides, setSlides]     = useState(DEFAULT)
  const [current, setCurrent]   = useState(0)
  const { isEdit }              = useAuth()
  const timerRef                = useRef(null)

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then(d => {
      if (d.status === 'success') {
        const s = [d.data.slide1, d.data.slide2, d.data.slide3].filter(Boolean)
        if (s.length) setSlides(s)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(next, 4000)
    return () => clearInterval(timerRef.current)
  }, [current, slides.length])

  function next()  { setCurrent(c => (c + 1) % slides.length) }
  function prev()  { setCurrent(c => (c - 1 + slides.length) % slides.length) }
  function goTo(i) { setCurrent(i); clearInterval(timerRef.current) }

  return (
    <section className="hero" id="home">
      {isEdit && (
        <button className="edit-section-btn" onClick={onEdit} style={{ display:'inline-flex' }}>
          <i className="fas fa-edit" />Edit Hero
        </button>
      )}

      <div className="hero-slider">
        {slides.map((slide, i) => (
          <div key={i} className={`slide${i === current ? ' active' : ''}`}>
            <div className="slide-bg" style={{
              backgroundImage: slide.image_url
                ? `url(${slide.image_url})`
                : GRADS[i % GRADS.length],
              background: slide.image_url ? undefined : GRADS[i % GRADS.length],
            }} />
            <div className="hero-content">
              <div className="hero-subtitle">{slide.subtitle}</div>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-description">{slide.description}</p>
              <a href="#contact" className="cta-button">LEARN MORE!</a>
            </div>
          </div>
        ))}
      </div>

      <div className="slide-indicators">
        {slides.map((_, i) => (
          <span key={i} className={`indicator${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>

      <div className="slide-nav">
        <button className="slide-btn" onClick={() => { prev(); clearInterval(timerRef.current) }}>
          <i className="fas fa-chevron-left" />
        </button>
        <button className="slide-btn" onClick={() => { next(); clearInterval(timerRef.current) }}>
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </section>
  )
}
