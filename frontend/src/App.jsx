import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home    from './pages/Home'
import Gallery from './pages/Gallery'
import About   from './pages/About'
import Admin   from './pages/Admin'

function FloatingSocial() {
  return (
    <div className="floating-social">
      <a href="https://wa.me/6285606296686" target="_blank" rel="noreferrer" className="float-btn float-wa" title="WhatsApp">
        <i className="fab fa-whatsapp" />
      </a>
      <a href="https://www.instagram.com/works_glow/" target="_blank" rel="noreferrer" className="float-btn float-ig" title="Instagram">
        <i className="fab fa-instagram" />
      </a>
      <a href="https://www.tiktok.com/@works_glow" target="_blank" rel="noreferrer" className="float-btn float-tt" title="TikTok">
        <i className="fab fa-tiktok" />
      </a>
    </div>
  )
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FloatingSocial />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about"   element={<About />} />
          <Route path="/admin"   element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
