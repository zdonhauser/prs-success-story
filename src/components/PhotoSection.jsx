import React, { useRef } from 'react'
import { photoLayouts } from '../utils/photoLayouts'

export function PhotoSection({ photos, layoutIndex, onPhotosChange, onLayoutChange }) {
  const fileRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    const slots = 8 - photos.length
    const toAdd = files.slice(0, slots)
    if (!toAdd.length) return

    Promise.all(
      toAdd.map((file, i) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const src = ev.target.result
          const img = new window.Image()
          const finish = () => resolve({
            id: `photo_${Date.now()}_${i}`,
            src,
            naturalW: img.naturalWidth || undefined,
            naturalH: img.naturalHeight || undefined,
            zoom: 1,
            panX: 0,
            panY: 0,
          })
          img.onload = finish
          img.onerror = finish
          img.src = src
        }
        reader.readAsDataURL(file)
      }))
    ).then((added) => onPhotosChange([...photos, ...added]))

    e.target.value = ''
  }

  const remove = (idx) => onPhotosChange(photos.filter((_, i) => i !== idx))

  const move = (idx, dir) => {
    const next = [...photos]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onPhotosChange(next)
  }

  const layouts = photos.length > 0 ? (photoLayouts[photos.length] || []) : []

  return (
    <section className="form-section">
      <h2>Photos</h2>

      {photos.length < 8 && (
        <button className="btn-upload" onClick={() => fileRef.current?.click()}>
          + Add Photos {photos.length > 0 ? `(${photos.length} of 8)` : '— up to 8'}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />

      {photos.length > 0 && (
        <>
          <div className="photo-thumb-list">
            {photos.map((p, i) => (
              <div key={p.id} className="photo-thumb">
                <img src={p.src} alt={`Photo ${i + 1}`} />
                <div className="thumb-num">{i + 1}</div>
                <div className="thumb-controls">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left">‹</button>
                  <button onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move right">›</button>
                  <button onClick={() => remove(i)} className="thumb-remove" aria-label="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>

          {layouts.length > 1 && (
            <div className="layout-picker">
              <div className="layout-picker-label">Arrangement</div>
              <div className="layout-options">
                {layouts.map((layout, i) => (
                  <button
                    key={i}
                    className={`layout-option ${i === layoutIndex ? 'active' : ''}`}
                    onClick={() => onLayoutChange(i)}
                    title={layout.name}
                  >
                    <LayoutThumb cells={layout.cells} />
                    <span>{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function LayoutThumb({ cells }) {
  return (
    <svg width="60" height="41" viewBox="0 0 696 380" xmlns="http://www.w3.org/2000/svg">
      {cells.map((c, i) => (
        <rect key={i} x={c.x + 1} y={c.y + 1} width={c.w - 2} height={c.h - 2} fill="#c5d8f0" stroke="#2056a0" strokeWidth="3" />
      ))}
    </svg>
  )
}
