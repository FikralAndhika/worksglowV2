import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import API_BASE from '../config'

const CACHE_KEY = 'wg_hero_slides'

const GRADS = [
  'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
  'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
  'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
]

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export default function HeroSlider({ onEdit }) {
  const cached = getCached()
  const [slides, setSlides]   = useState(cached || [])
  const [ready,  setReady]    = useState(!!cached)
  const [current, setCurrent] = useState(0)
  const { isEdit }            = useAuth()
  const timerRef              = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/hero`).then(r => r.json()).then(d => {
      if (d.status === 'success') {
        const s = [d.data.slide1, d.data.slide2, d.data.slide3].filter(Boolean)
        if (s.length) {
          setSlides(s)
          setReady(true)
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)) } catch {}
        }
      }
    }).catch(() => {
      if (!cached) setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || slides.length === 0) return
    timerRef.current = setInterval(next, 4000)
    return () => clearInterval(timerRef.current)
  }, [current, slides.length, ready])

  function next()  { setCurrent(c => (c + 1) % slides.length) }
  function prev()  { setCurrent(c => (c - 1 + slides.length) % slides.length) }
  function goTo(i) { setCurrent(i); clearInterval(timerRef.current) }

  // Saat belum ada data sama sekali, tampilkan background gelap supaya tidak flash
  if (!ready && slides.length === 0) {
    return (
      <section className="hero" id="home" style={{ background: '#111' }}>
        <div className="hero-slider" />
      </section>
    )
  }

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
            <div className="slide-bg" style={
              slide.image_url
                ? { backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
                : { background: GRADS[i % GRADS.length] }
            } />
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
