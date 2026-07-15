import React, { forwardRef, useRef } from 'react'
import { photoLayouts } from '@/config/photoLayouts'
import { coverRect, clampPan } from '@/domain/photoGeometry'
import { themeLogo, logoSrc, type ThemeId } from '@/config/themes'
import { formatDisplayDate } from '@/domain/storyDate'
import { useAutoFitText } from './useAutoFitText'
import type { StoryForm } from '@/types'

interface PreviewCanvasProps {
  form: StoryForm
  onPhotoClick?: (index: number, cellW: number, cellH: number) => void
  onAutoFontSize?: (size: number) => void
}

export const PreviewCanvas = forwardRef<HTMLDivElement, PreviewCanvasProps>(({ form, onPhotoClick, onAutoFontSize }, forwardedRef) => {
  const { community, coordinator, date, narrative, photos, photoLayoutIndex, theme = 'classic', narrativeFontSize } = form
  const hasPhotos = photos.length > 0
  const layout = hasPhotos ? photoLayouts[photos.length]?.[photoLayoutIndex] : null
  const narrativeTop = hasPhotos ? 626 : 235

  const rootRef = useRef<HTMLDivElement | null>(null)
  const narrativeTextRef = useRef<HTMLDivElement | null>(null)

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  const autoSize = useAutoFitText({
    rootRef,
    textRef: narrativeTextRef,
    narrative,
    narrativeTop,
    hasPhotos,
    photoLayoutIndex,
    theme,
    onSize: onAutoFontSize,
  })
  const effectiveSize = narrativeFontSize ?? autoSize

  return (
    <div ref={setRefs} className="page" data-theme={theme}>
      {/* Structural decoration layers */}
      <div className="page-header-band" />
      <div className="page-left-stripe" />
      <div className="page-right-stripe" />
      <div className="page-top-rule" />

      {/* Logo — variant picked per theme for contrast against the header */}
      <div className="page-logo-area">
        <img src={logoSrc[themeLogo[theme as ThemeId] ?? 'color']} alt="PRS Logo" className="page-logo-img" />
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
          <div className="page-value">{formatDisplayDate(date)}</div>
        </div>
      </div>

      {/* Photo zone */}
      {hasPhotos && layout && (
        <div className="page-photo-zone">
          {layout.cells.map((cell, i) => {
            const photo = photos[i]
            if (!photo) return null
            const rect = coverRect(photo.naturalW, photo.naturalH, cell.w, cell.h)
            const zoom = photo.zoom ?? 1
            // Clamped defensively at render time too (not just while
            // dragging in the crop modal) so a stale/out-of-range stored
            // pan — e.g. saved before this clamp existed — can't leave a
            // gap in the preview or exported PDF.
            const { x: panX, y: panY } = clampPan(photo.naturalW, photo.naturalH, cell.w, cell.h, photo.panX ?? 0, photo.panY ?? 0, zoom)
            return (
              <div
                key={i}
                className="page-photo-cell"
                style={{ left: cell.x, top: cell.y, width: cell.w, height: cell.h, cursor: onPhotoClick ? 'pointer' : 'default' }}
                onClick={onPhotoClick ? () => onPhotoClick(i, cell.w, cell.h) : undefined}
              >
                <img
                  src={photo.src}
                  alt=""
                  style={{
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            )
          })}
          {/* Theme border overlay on top of photos */}
          <div className="page-photo-frame" />
        </div>
      )}

      {/* Narrative */}
      <div className="page-narrative" style={{ top: narrativeTop }}>
        <div className="page-narrative-rule" />
        <div className="page-label">NARRATIVE</div>
        <div className="page-narrative-text" ref={narrativeTextRef} style={{ fontSize: effectiveSize }}>
          {narrative || 'Describe the event or activity here. What happened? Who was involved? What was the impact on the community? Share the story of how this Good Neighbor Program activity made a difference.'}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="page-bottom-bar" />
    </div>
  )
})

PreviewCanvas.displayName = 'PreviewCanvas'
