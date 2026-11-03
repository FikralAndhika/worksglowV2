import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home    from './pages/Home'
import Gallery from './pages/Gallery'
import About   from './pages/About'
import Admin   from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
