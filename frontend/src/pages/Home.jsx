import { useState } from 'react'
import Navbar        from '../components/Navbar'
import HeroSlider    from '../components/HeroSlider'
import Services      from '../components/Services'
import GalleryPreview from '../components/GalleryPreview'
import Contact       from '../components/Contact'
import Footer        from '../components/Footer'
import HeroModal     from '../components/ui/HeroModal'
import ServicesModal from '../components/ui/ServicesModal'
import ContactModal  from '../components/ui/ContactModal'
import { useAuth }   from '../context/AuthContext'

export default function Home() {
  const { isEdit } = useAuth()
  const [modal, setModal] = useState(null) // 'hero' | 'services' | 'contact'
  const [refresh, setRefresh] = useState(0)

  const onSaved = () => setRefresh(r => r + 1)

  return (
    <div className={isEdit ? 'edit-mode' : ''}>
      <Navbar />
      <HeroSlider    key={`hero-${refresh}`}     onEdit={() => setModal('hero')} />
      <Services      key={`svc-${refresh}`}      onEdit={() => setModal('services')} />
      <GalleryPreview key={`gal-${refresh}`} />
      <Contact       key={`contact-${refresh}`}  onEdit={() => setModal('contact')} />
      <Footer />

      {modal === 'hero'     && <HeroModal     onClose={() => setModal(null)} onSaved={onSaved} />}
      {modal === 'services' && <ServicesModal onClose={() => setModal(null)} onSaved={onSaved} />}
      {modal === 'contact'  && <ContactModal  onClose={() => setModal(null)} onSaved={onSaved} />}
    </div>
  )
}
