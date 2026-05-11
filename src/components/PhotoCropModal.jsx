import React, { useState, useRef, useEffect } from 'react'

export function PhotoCropModal({ photo, cellW, cellH, onSave, onCancel }) {
  const [zoom, setZoom] = useState(photo.zoom ?? 1)
  const [panX, setPanX] = useState(photo.panX ?? 0)
  const [panY, setPanY] = useState(photo.panY ?? 0)

  const frameRef = useRef(null)
  const dragState = useRef(null)
  const pinchState = useRef(null)

  // Frame display: maintain cell aspect ratio, max 560px wide
  const aspect = cellW / cellH
  const frameW = Math.min(560, Math.max(280, aspect > 1 ? 560 : 400 * aspect))
  const frameH = frameW / aspect

  // Mouse drag
  const onMouseDown = (e) => {
    e.preventDefault()
    dragState.current = { x: e.clientX, y: e.clientY, px: panX, py: panY }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  const onMouseMove = (e) => {
    if (!dragState.current) return
    setPanX(dragState.current.px + (e.clientX - dragState.current.x))
    setPanY(dragState.current.py + (e.clientY - dragState.current.y))
  }
  const onMouseUp = () => {
    dragState.current = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // Scroll to zoom (desktop)
  const onWheel = (e) => {
    e.preventDefault()
    setZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.001)))
  }

  // Touch: 1 finger pan, 2 finger pinch-zoom
  const onTouchStart = (e) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      dragState.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, px: panX, py: panY }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchState.current = { dist: Math.hypot(dx, dy), zoom }
      dragState.current = null
    }
  }
  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragState.current) {
      setPanX(dragState.current.px + (e.touches[0].clientX - dragState.current.x))
      setPanY(dragState.current.py + (e.touches[0].clientY - dragState.current.y))
    } else if (e.touches.length === 2 && pinchState.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / pinchState.current.dist
      setZoom(Math.min(4, Math.max(1, pinchState.current.zoom * ratio)))
    }
  }
  const onTouchEnd = () => {
    dragState.current = null
    pinchState.current = null
  }

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  })

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>Adjust Photo</h3>
          <p>Drag to reposition · Pinch or scroll to zoom</p>
        </div>

        <div
          ref={frameRef}
          className="crop-frame"
          style={{ width: frameW, height: frameH }}
          onMouseDown={onMouseDown}
        >
          <img
            src={photo.src}
            draggable={false}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>

        <div className="crop-controls">
          <div className="crop-zoom-row">
            <span>Zoom</span>
            <input
              type="range"
              min="1" max="4" step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
            />
            <span className="crop-zoom-val">{zoom.toFixed(1)}×</span>
          </div>

          <div className="crop-btn-row">
            <button className="btn-ghost" onClick={() => { setZoom(1); setPanX(0); setPanY(0) }}>
              Reset
            </button>
            <button className="btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn-primary-sm" onClick={() => onSave({ zoom, panX, panY })}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
