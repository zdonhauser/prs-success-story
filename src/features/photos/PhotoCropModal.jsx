import React, { useState, useRef, useEffect } from 'react'
import { coverRect, clampPan as clampPanValues } from '@/domain/photoGeometry'

export function PhotoCropModal({ photo, cellW, cellH, onSave, onCancel }) {
  const [zoom, setZoom] = useState(photo.zoom ?? 1)
  const [panX, setPanX] = useState(photo.panX ?? 0)
  const [panY, setPanY] = useState(photo.panY ?? 0)

  const frameRef = useRef(null)
  const dragState = useRef(null)
  const pinchState = useRef(null)

  // Track viewport size so the frame never renders wider/taller than the
  // screen — otherwise on narrow (mobile) viewports it overflows the
  // modal card and the right/bottom edge gets clipped off-screen.
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Frame display: maintain cell aspect ratio, max 560px wide, but never
  // exceed the space actually available inside the modal card.
  const aspect = cellW / cellH
  const idealW = aspect > 1 ? 560 : 400 * aspect
  // .crop-modal padding (24px * 2) + .crop-overlay margin (16px * 2)
  const maxAvailW = viewport.w - 80
  // header + controls + modal padding, roughly
  const maxAvailH = viewport.h - 260
  const frameW = Math.max(160, Math.min(idealW, maxAvailW, maxAvailH * aspect))
  const frameH = frameW / aspect
  // panX/panY are stored in the page's real cell-pixel units (same units
  // used by the preview and PDF export), which are usually bigger than
  // this on-screen frame — convert drag deltas so a drag feels 1:1 here
  // but still lands correctly at full cell size.
  const frameScale = frameW / cellW

  // Pan is clamped so the image can never move far enough to expose blank
  // space around it — the image must always fully cover the cell. The
  // valid range shrinks/grows with zoom (more overflow at higher zoom).
  const clampPan = (px, py, z) => {
    const { x, y } = clampPanValues(photo.naturalW, photo.naturalH, cellW, cellH, px, py, z)
    return [x, y]
  }

  // Re-clamp pan whenever zoom changes (zooming out can leave a
  // previously-valid pan now exposing a gap).
  useEffect(() => {
    const [cx, cy] = clampPan(panX, panY, zoom)
    if (cx !== panX) setPanX(cx)
    if (cy !== panY) setPanY(cy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  // Mouse drag
  const onMouseDown = (e) => {
    e.preventDefault()
    dragState.current = { x: e.clientX, y: e.clientY, px: panX, py: panY }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  const onMouseMove = (e) => {
    if (!dragState.current) return
    const rawX = dragState.current.px + (e.clientX - dragState.current.x) / frameScale
    const rawY = dragState.current.py + (e.clientY - dragState.current.y) / frameScale
    const [cx, cy] = clampPan(rawX, rawY, zoom)
    setPanX(cx)
    setPanY(cy)
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
      const rawX = dragState.current.px + (e.touches[0].clientX - dragState.current.x) / frameScale
      const rawY = dragState.current.py + (e.touches[0].clientY - dragState.current.y) / frameScale
      const [cx, cy] = clampPan(rawX, rawY, zoom)
      setPanX(cx)
      setPanY(cy)
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
            style={(() => {
              const rect = coverRect(photo.naturalW, photo.naturalH, cellW, cellH)
              return {
                position: 'absolute',
                left: rect.left * frameScale,
                top: rect.top * frameScale,
                width: rect.width * frameScale,
                height: rect.height * frameScale,
                maxWidth: 'none',
                transform: `translate(${panX * frameScale}px, ${panY * frameScale}px) scale(${zoom})`,
                transformOrigin: 'center center',
                pointerEvents: 'none',
                userSelect: 'none',
              }
            })()}
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
