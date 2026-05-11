import React, { forwardRef } from 'react'
import { photoLayouts, PHOTO_ZONE } from '../utils/photoLayouts'

function formatDate(val) {
  if (!val) return 'Month Year'
  const [year, month] = val.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export const PreviewCanvas = forwardRef(({ form, onPhotoClick }, ref) => {
  const { community, coordinator, date, narrative, photos, photoLayoutIndex, theme = 'classic' } = form
  const hasPhotos = photos.length > 0
  const layout = hasPhotos ? photoLayouts[photos.length]?.[photoLayoutIndex] : null
  const narrativeTop = hasPhotos ? 626 : 235

  return (
    <div ref={ref} className="page" data-theme={theme}>
      {/* Structural decoration layers */}
      <div className="page-header-band" />
      <div className="page-left-stripe" />
      <div className="page-top-rule" />

      {/* Logo — locked to PRS logo */}
      <div className="page-logo-area">
        <img src="./logo.png" alt="PRS Logo" className="page-logo-img" />
      </div>

      {/* Title + divider */}
      <div className="page-title">Good Neighbor Program Success Story</div>
      <div className="page-divider" />

      {/* Meta row */}
      <div className="page-meta">
        <div className="page-meta-field">
          <div className="page-label">COMMUNITY</div>
          <div className="page-value">{community || 'Community Name'}</div>
        </div>
        <div className="page-meta-field">
          <div className="page-label">COORDINATOR</div>
          <div className="page-value">{coordinator || 'Coordinator Name'}</div>
        </div>
        <div className="page-meta-field">
          <div className="page-label">DATE</div>
          <div className="page-value">{formatDate(date)}</div>
        </div>
      </div>

      {/* Photo zone */}
      {hasPhotos && layout && (
        <div className="page-photo-zone">
          {layout.cells.map((cell, i) =>
            photos[i] ? (
              <div
                key={i}
                className="page-photo-cell"
                style={{ left: cell.x, top: cell.y, width: cell.w, height: cell.h, cursor: onPhotoClick ? 'pointer' : 'default' }}
                onClick={onPhotoClick ? () => onPhotoClick(i, cell.w, cell.h) : undefined}
              >
                <img
                  src={photos[i].src}
                  alt=""
                  data-zoom={photos[i].zoom ?? 1}
                  data-pan-x={photos[i].panX ?? 0}
                  data-pan-y={photos[i].panY ?? 0}
                  style={{
                    transform: `translate(${photos[i].panX ?? 0}px, ${photos[i].panY ?? 0}px) scale(${photos[i].zoom ?? 1})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            ) : null
          )}
          {/* Theme border overlay on top of photos */}
          <div className="page-photo-frame" />
        </div>
      )}

      {/* Narrative */}
      <div className="page-narrative" style={{ top: narrativeTop }}>
        <div className="page-narrative-rule" />
        <div className="page-label">NARRATIVE</div>
        <div className="page-narrative-text">
          {narrative || 'Describe the event or activity here. What happened? Who was involved? What was the impact on the community? Share the story of how this Good Neighbor Program activity made a difference.'}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="page-bottom-bar" />
    </div>
  )
})

PreviewCanvas.displayName = 'PreviewCanvas'
