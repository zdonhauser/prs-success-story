import React, { useState, useRef, useCallback } from 'react'
import { AppHeader } from './AppHeader'
import { useStoryForm } from './useStoryForm'
import { usePreviewScale } from './usePreviewScale'
import { FormPanel } from '@/features/story-form/FormPanel'
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { PhotoCropModal } from '@/features/photos/PhotoCropModal'
import { exportToPDF } from '@/features/export/exportPdf'
import { PAGE_W, PAGE_H } from '@/config/page'

export default function App() {
  const { form, update, updatePhoto, reset } = useStoryForm()
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(null)
  const [cropTarget, setCropTarget] = useState(null) // { photoIndex, cellW, cellH }
  const [autoNarrativeSize, setAutoNarrativeSize] = useState(13)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const previewRef = useRef(null)
  const previewAreaRef = useRef(null)
  const scalerRef = useRef(null)
  const scale = usePreviewScale(previewAreaRef, sidebarCollapsed)

  const clearForm = () => {
    if (!window.confirm('Clear everything and start a new story?')) return
    reset()
  }

  const handlePhotoClick = useCallback((photoIndex, cellW, cellH) => {
    setCropTarget({ photoIndex, cellW, cellH })
  }, [])

  const handleCropSave = ({ zoom, panX, panY }) => {
    if (!cropTarget) return
    updatePhoto(cropTarget.photoIndex, { zoom, panX, panY })
    setCropTarget(null)
  }

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
      await exportToPDF(previewRef.current, {
        community: form.community || 'Success_Story',
        photos: form.photos,
      })
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
      <AppHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
        onClear={clearForm}
        onExport={handleExport}
        exporting={exporting}
      />

      <div className={`app-body ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!sidebarCollapsed && <FormPanel form={form} onChange={update} autoNarrativeSize={autoNarrativeSize} />}

        <div className="preview-area" ref={previewAreaRef}>
          <div className="preview-label">Preview</div>
          <div
            className="preview-scaler"
            style={{ width: PAGE_W * scale, height: PAGE_H * scale }}
          >
            <div ref={scalerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_W, height: PAGE_H }}>
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
