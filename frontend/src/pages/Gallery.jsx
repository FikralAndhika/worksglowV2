import { useState, useEffect, useRef } from 'react'
import Navbar   from '../components/Navbar'
import Footer   from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#30cfd0,#330867)',
]

const EMPTY = { title:'', subtitle:'', description:'', vehicle_type:'', service_type:'', duration:'', completed_date:'', display_order:0 }

export default function Gallery() {
  const { isEdit, authFetch } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  // lightbox
  const [lb, setLb]       = useState(null) // { project, imgIdx }

  // modal
  const [modal, setModal] = useState(null) // null | 'create' | project obj
  const [form,  setForm]  = useState(EMPTY)
  const [newFiles,      setNewFiles]      = useState([])
  const [newPreviews,   setNewPreviews]   = useState([])
  const [deletedImgIds, setDeletedImgIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [modalAlert, setModalAlert] = useState(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    const r = await fetch('/api/gallery'); const d = await r.json()
    if (d.status === 'success') setProjects(d.data)
    setLoading(false)
  }

  // ── LIGHTBOX ──────────────────────────────────────────────
  function openLb(project, idx = 0) { setLb({ project, idx }) }
  function closeLb() { setLb(null) }
  function lbNav(dir) {
    setLb(prev => {
      const imgs = prev.project.images
      let next = prev.idx + dir
      if (next < 0) next = imgs.length - 1
      if (next >= imgs.length) next = 0
      return { ...prev, idx: next }
    })
  }
  useEffect(() => {
    function onKey(e) {
      if (!lb) return
      if (e.key === 'ArrowLeft')  lbNav(-1)
      if (e.key === 'ArrowRight') lbNav(1)
      if (e.key === 'Escape')     closeLb()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lb])

  // ── MODAL ─────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY); setNewFiles([]); setNewPreviews([]); setDeletedImgIds([]); setModalAlert(null)
    setModal('create')
  }
  function openEdit(project) {
    setForm({ title:project.title||'', subtitle:project.subtitle||'', description:project.description||'',
      vehicle_type:project.vehicle_type||'', service_type:project.service_type||'',
      duration:project.duration||'', completed_date:project.completed_date||'',
      display_order:project.display_order||0 })
    setNewFiles([]); setNewPreviews([]); setDeletedImgIds([]); setModalAlert(null)
    setModal(project)
  }
  function closeModal() { setModal(null) }

  function addFiles(fileList) {
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']
    Array.from(fileList).forEach(f => {
      if (!allowed.includes(f.type)) return
      if (newFiles.length >= 10) return
      setNewFiles(p => [...p, f])
      setNewPreviews(p => [...p, URL.createObjectURL(f)])
    })
  }
  function removeNewFile(i) {
    setNewFiles(p => p.filter((_,idx) => idx !== i))
    setNewPreviews(p => p.filter((_,idx) => idx !== i))
  }
  function toggleDeleteImg(id) {
    setDeletedImgIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setModalAlert(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => v !== '' && fd.append(k, v))
      newFiles.forEach(f => fd.append('images', f))

      let res
      if (modal === 'create') {
        res = await authFetch('/api/gallery/create', { method:'POST', body: fd })
      } else {
        if (deletedImgIds.length) fd.append('deleted_images', JSON.stringify(deletedImgIds))
        newFiles.forEach((_, i) => { fd.delete('images') }) // remove 'images', re-add as 'newImages'
        const fd2 = new FormData()
        Object.entries(form).forEach(([k,v]) => v !== '' && fd2.append(k, v))
        if (deletedImgIds.length) fd2.append('deleted_images', JSON.stringify(deletedImgIds))
        newFiles.forEach(f => fd2.append('newImages', f))
        res = await authFetch(`/api/gallery/update/${modal.id}`, { method:'POST', body: fd2 })
      }
      const data = await res.json()
      if (data.status === 'success') { setModalAlert({ type:'success', msg:'✅ Berhasil disimpan!' }); setTimeout(() => { closeModal(); loadGallery() }, 1000) }
      else setModalAlert({ type:'error', msg: data.message })
    } catch (err) { setModalAlert({ type:'error', msg: err.message }) }
    finally { setSaving(false) }
  }

  async function handleDelete(project) {
    if (!confirm(`Hapus project "${project.title}"?`)) return
    try {
      const res = await authFetch(`/api/gallery/${project.id}`, { method:'DELETE' })
      const d   = await res.json()
      if (d.status === 'success') loadGallery()
      else alert('Gagal hapus: ' + d.message)
    } catch (err) { alert(err.message) }
  }

  // ── DRAG & DROP ───────────────────────────────────────────
  const dropRef = useRef(null)
  function onDragOver(e) { e.preventDefault(); dropRef.current?.classList.add('drag-over') }
  function onDragLeave() { dropRef.current?.classList.remove('drag-over') }
  function onDrop(e) { e.preventDefault(); dropRef.current?.classList.remove('drag-over'); addFiles(e.dataTransfer.files) }

  return (
    <div className={isEdit ? 'edit-mode' : ''}>
      <Navbar />
      <section className="gallery-page">
        <div className="container">
          <div className="section-title">
            <h2>Galeri Karya</h2>
            <p>Lihat hasil karya terbaik kami dengan kualitas premium</p>
          </div>

          {loading
            ? <div style={{ textAlign:'center', padding:'3rem', color:'#666' }}><i className="fas fa-spinner fa-spin fa-2x" /></div>
            : projects.length === 0
              ? <div style={{ textAlign:'center', padding:'3rem', color:'#999' }}>Belum ada project. {isEdit ? 'Klik + untuk menambahkan.' : ''}</div>
              : (
                <div className="gallery-cards">
                  {projects.map((p, idx) => {
                    const img = p.images?.find(x => x.is_primary) || p.images?.[0]
                    return (
                      <div key={p.id} className="gallery-card">
                        <div className="gallery-card-img" onClick={() => p.images?.length > 0 && openLb(p, 0)}>
                          {img
                            ? <img src={img.image_url} alt={p.title} />
                            : <div style={{ background: GRADS[idx % GRADS.length], width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', fontSize:'3rem' }}><i className="fas fa-car" /></div>
                          }
                        </div>
                        <div className="gallery-card-body" onClick={() => p.images?.length > 0 && openLb(p, 0)}>
                          <h3>{p.title}</h3>
                          <p>{p.subtitle || p.service_type || ''}</p>
                          <span className="photo-count"><i className="fas fa-images" />{p.images?.length || 0} Foto</span>
                        </div>
                        {isEdit && (
                          <div className="card-admin-actions">
                            <button className="btn-edit-sm" onClick={e => { e.stopPropagation(); openEdit(p) }}>
                              <i className="fas fa-edit" /> Edit
                            </button>
                            <button className="btn-del-sm" onClick={e => { e.stopPropagation(); handleDelete(p) }}>
                              <i className="fas fa-trash" /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
          }
        </div>
      </section>

      {/* FAB add button */}
      {isEdit && (
        <button className="fab" onClick={openCreate} title="Tambah Project">
          <i className="fas fa-plus" />
        </button>
      )}

      <Footer />

      {/* ── LIGHTBOX ── */}
      {lb && lb.project.images?.length > 0 && (
        <div className="lightbox" onClick={e => e.target.classList.contains('lightbox') && closeLb()}>
          <button className="lb-close" onClick={closeLb}><i className="fas fa-times" /></button>
          <div className="lb-inner">
            <div className="lb-left">
              <div className="lb-thumbs">
                {lb.project.images.map((img, i) => (
                  <img key={img.id} src={img.image_url} className={`lb-thumb${i === lb.idx ? ' active' : ''}`}
                    onClick={() => setLb(prev => ({ ...prev, idx: i }))} alt="" />
                ))}
              </div>
              <div className="lb-main">
                {lb.project.images.length > 1 && (
                  <button className="lb-nav prev" onClick={() => lbNav(-1)}><i className="fas fa-chevron-left" /></button>
                )}
                <img className="lb-img" src={lb.project.images[lb.idx]?.image_url} alt="" />
                {lb.project.images.length > 1 && (
                  <button className="lb-nav next" onClick={() => lbNav(1)}><i className="fas fa-chevron-right" /></button>
                )}
              </div>
            </div>
            <div className="lb-right">
              <div>
                <div className="lb-title">{lb.project.title}</div>
                <div className="lb-subtitle">{lb.project.subtitle}</div>
                <div className="lb-desc">{lb.project.description}</div>
              </div>
              <div className="lb-info">
                {lb.project.completed_date && <div className="lb-info-item"><i className="fas fa-calendar" /><span>{lb.project.completed_date}</span></div>}
                {lb.project.vehicle_type   && <div className="lb-info-item"><i className="fas fa-car" /><span>{lb.project.vehicle_type}</span></div>}
                {lb.project.service_type   && <div className="lb-info-item"><i className="fas fa-paint-brush" /><span>{lb.project.service_type}</span></div>}
                {lb.project.duration       && <div className="lb-info-item"><i className="fas fa-clock" /><span>{lb.project.duration}</span></div>}
              </div>
              <div className="lb-counter">{lb.idx + 1} / {lb.project.images.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECT MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>{modal === 'create' ? '➕ Tambah Project' : '✏️ Edit Project'}</h2>
            </div>
            <div className="modal-body">
              {modalAlert && <div className={`alert ${modalAlert.type}`}>{modalAlert.msg}</div>}
              <form onSubmit={handleSave}>
                {/* Existing images when editing */}
                {modal !== 'create' && modal.images?.length > 0 && (
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'.82rem', fontWeight:700, color:'#444', textTransform:'uppercase', letterSpacing:'.5px' }}>Foto Sekarang</label>
                    <div className="preview-grid" style={{ marginTop:'.5rem' }}>
                      {modal.images.map(img => (
                        <div key={img.id} className="preview-thumb" style={{ opacity: deletedImgIds.includes(img.id) ? .4 : 1, border: deletedImgIds.includes(img.id) ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
                          <img src={img.image_url} alt="" />
                          <button type="button" className="rm" onClick={() => toggleDeleteImg(img.id)}>
                            <i className={`fas ${deletedImgIds.includes(img.id) ? 'fa-undo' : 'fa-times'}`} />
                          </button>
                          {img.is_primary && <span style={{ position:'absolute', bottom:3, left:3, background:'rgba(102,126,234,.9)', color:'#fff', fontSize:'.55rem', fontWeight:700, padding:'1px 4px', borderRadius:8 }}>Primary</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Kendaraan *</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title:e.target.value }))} required placeholder="Toyota Avanza" />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle:e.target.value }))} placeholder="Full Body Repaint" />
                  </div>
                  <div className="form-group">
                    <label>Jenis Kendaraan</label>
                    <input value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type:e.target.value }))} placeholder="Mobil" />
                  </div>
                  <div className="form-group">
                    <label>Jenis Layanan</label>
                    <input value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type:e.target.value }))} placeholder="Full Body Repaint" />
                  </div>
                  <div className="form-group">
                    <label>Durasi</label>
                    <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration:e.target.value }))} placeholder="5 Hari" />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Selesai</label>
                    <input value={form.completed_date} onChange={e => setForm(p => ({ ...p, completed_date:e.target.value }))} placeholder="Januari 2025" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm(p => ({ ...p, description:e.target.value }))} placeholder="Deskripsikan pekerjaan..." />
                </div>

                {/* Upload new photos */}
                <div className="form-group">
                  <label>{modal === 'create' ? 'Upload Foto *' : 'Tambah Foto Baru'}</label>
                  <div className="upload-zone" ref={dropRef}
                    onClick={() => document.getElementById('galleryFileInput').click()}
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <input id="galleryFileInput" type="file" multiple accept="image/*" style={{ display:'none' }}
                      onChange={e => addFiles(e.target.files)} />
                    <i className="fas fa-cloud-upload-alt" />
                    <p>Drag & drop atau <strong style={{ color:'#667eea' }}>pilih foto</strong></p>
                    <p style={{ fontSize:'.75rem', color:'#aaa', marginTop:4 }}>Max 10 foto · JPEG PNG WebP · 10MB</p>
                  </div>
                  {newPreviews.length > 0 && (
                    <div className="preview-grid" style={{ marginTop:'.75rem' }}>
                      {newPreviews.map((url, i) => (
                        <div key={i} className="preview-thumb">
                          <img src={url} alt="" />
                          <button type="button" className="rm" onClick={() => removeNewFile(i)}>
                            <i className="fas fa-times" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? <><i className="fas fa-spinner fa-spin" /> Menyimpan...</> : modal === 'create' ? <><i className="fas fa-plus" /> Tambah</> : <><i className="fas fa-save" /> Simpan</>}
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Batalkan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
