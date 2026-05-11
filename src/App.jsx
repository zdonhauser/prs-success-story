import React, { useState, useRef, useCallback, useEffect } from 'react'
import { FormPanel } from './components/FormPanel'
import { PreviewCanvas } from './components/PreviewCanvas'
import { PhotoCropModal } from './components/PhotoCropModal'
import { exportToPDF } from './utils/exportPdf'

const defaultForm = {
  community: '',
  coordinator: '',
  date: '',
  narrative: '',
  photos: [],
  photoLayoutIndex: 0,
  theme: 'classic',
}

export default function App() {
  const [form, setForm] = useState(defaultForm)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(null)
  const [cropTarget, setCropTarget] = useState(null) // { photoIndex, cellW, cellH }
  const [scale, setScale] = useState(0.6)
  const previewRef = useRef(null)
  const previewAreaRef = useRef(null)
  const scalerRef = useRef(null)

  const update = useCallback((field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'photos' && value.length !== prev.photos.length) {
        next.photoLayoutIndex = 0
      }
      return next
    })
  }, [])

  // Compute preview scale to fit available width
  useEffect(() => {
    const measure = () => {
      if (previewAreaRef.current) {
        const availW = previewAreaRef.current.clientWidth - 72  // 36px each side for shadow
        const availH = previewAreaRef.current.clientHeight - 80 // 36px top+bottom + label
        const s = Math.min(availW / 816, availH / 1056, 1)
        setScale(Math.max(0.25, s))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handlePhotoClick = useCallback((photoIndex, cellW, cellH) => {
    setCropTarget({ photoIndex, cellW, cellH })
  }, [])

  const handleCropSave = useCallback(({ zoom, panX, panY }) => {
    setCropTarget(prev => {
      const idx = prev.photoIndex
      setForm(f => {
        const photos = [...f.photos]
        photos[idx] = { ...photos[idx], zoom, panX, panY }
        return { ...f, photos }
      })
      return null
    })
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleExport = async () => {
    setExporting(true)
    // Remove CSS scale transform so html2canvas captures at native 816x1056
    if (scalerRef.current) scalerRef.current.style.transform = 'none'
    await new Promise(r => setTimeout(r, 80))
    try {
      const community = form.community || 'Success_Story'
      await exportToPDF(previewRef.current, community)
      showToast('PDF downloaded!')
    } catch (err) {
      console.error(err)
      showToast('Export failed — please try again.')
    }
    if (scalerRef.current) scalerRef.current.style.transform = `scale(${scale})`
    setExporting(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PRS Success Story Builder</h1>
        <button className="btn-download" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Generating…' : '↓ Download PDF'}
        </button>
      </header>

      <div className="app-body">
        <FormPanel form={form} onChange={update} />

        <div className="preview-area" ref={previewAreaRef}>
          <div className="preview-label">Preview</div>
          <div
            className="preview-scaler"
            style={{ width: 816 * scale, height: 1056 * scale }}
          >
            <div ref={scalerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 816, height: 1056 }}>
              <div className="page-shadow">
                <PreviewCanvas ref={previewRef} form={form} onPhotoClick={handlePhotoClick} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {cropTarget && (
        <PhotoCropModal
          photo={form.photos[cropTarget.photoIndex]}
          cellW={cropTarget.cellW}
          cellH={cropTarget.cellH}
          onSave={handleCropSave}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
