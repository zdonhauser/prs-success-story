import React, { useState, useRef, useCallback, useEffect } from 'react'
import { FormPanel } from '@/features/story-form/FormPanel'
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { PhotoCropModal } from '@/features/photos/PhotoCropModal'
import { exportToPDF } from '@/features/export/exportPdf'
import { loadSavedForm, saveForm, clearSavedForm } from '@/services/storage'

function thisMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function makeDefaultForm() {
  return {
    community: '',
    coordinator: '',
    date: thisMonth(),
    narrative: '',
    narrativeFontSize: null, // null = auto-fit to available space
    photos: [],
    photoLayoutIndex: 0,
    theme: 'classic',
    aiAnswers: { situation: '', response: '', results: '' },
  }
}

export default function App() {
  const [form, setForm] = useState(() => ({ ...makeDefaultForm(), ...loadSavedForm() }))
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(null)
  const [cropTarget, setCropTarget] = useState(null) // { photoIndex, cellW, cellH }
  const [scale, setScale] = useState(0.6)
  const [autoNarrativeSize, setAutoNarrativeSize] = useState(13)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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

  // Persist everything typed so a trip out to a browser/app (e.g. the AI
  // prompt links) and back doesn't wipe the form if the PWA gets reloaded.
  useEffect(() => {
    const timer = setTimeout(() => saveForm(form), 400)
    return () => clearTimeout(timer)
  }, [form])

  const clearForm = () => {
    if (!window.confirm('Clear everything and start a new story?')) return
    clearSavedForm()
    setForm(makeDefaultForm())
  }

  // Compute preview scale to fit available width. Reads actual padding
  // instead of a hardcoded desktop value so it also fits correctly at
  // the mobile/tablet breakpoint, which uses much smaller padding.
  useEffect(() => {
    const measure = () => {
      const area = previewAreaRef.current
      if (!area) return
      const cs = getComputedStyle(area)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const label = area.querySelector('.preview-label')
      const labelH = label ? label.offsetHeight + parseFloat(getComputedStyle(label).marginBottom || 0) : 0
      const availW = area.clientWidth - padX
      const availH = area.clientHeight - padY - labelH
      const s = Math.min(availW / 816, availH / 1056, 1)
      setScale(Math.max(0.2, s))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [sidebarCollapsed])

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
      showToast('PDF ready!')
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
        <div className="app-header-actions">
          <button className="btn-header-ghost" onClick={() => setSidebarCollapsed(v => !v)}>
            {sidebarCollapsed ? '☰ Show Form' : '✕ Hide Form'}
          </button>
          <button className="btn-header-ghost" onClick={clearForm}>Clear</button>
          <button className="btn-download" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating…' : '↓ Download PDF'}
          </button>
        </div>
      </header>

      <div className={`app-body ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!sidebarCollapsed && <FormPanel form={form} onChange={update} autoNarrativeSize={autoNarrativeSize} />}

        <div className="preview-area" ref={previewAreaRef}>
          <div className="preview-label">Preview</div>
          <div
            className="preview-scaler"
            style={{ width: 816 * scale, height: 1056 * scale }}
          >
            <div ref={scalerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 816, height: 1056 }}>
              <div className="page-shadow">
                <PreviewCanvas ref={previewRef} form={form} onPhotoClick={handlePhotoClick} onAutoFontSize={setAutoNarrativeSize} />
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
