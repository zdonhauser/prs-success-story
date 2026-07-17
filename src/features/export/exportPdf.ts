import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { coverRect, clampPan } from '@/domain/photoGeometry'
import { PAGE_W } from '@/config/page'
import type { Photo } from '@/types'

// ─────────────────────────────────────────────────────────────────────────
// Layered PDF export.
//
// The old approach rasterized the entire page — including photos and text
// — into one flat JPEG. That made every exported PDF a single opaque
// image: no selectable text, no separately movable photos, nothing an
// editor in Acrobat could touch without going back to this app.
//
// This version builds the PDF from four stacked layers instead:
//   1. Background raster — theme bands/stripes/logo/rules/divider, i.e.
//      everything that's genuinely just pixels with no editing value.
//   2. Photos — one addImage per cell, so each photo is its own object.
//   3. Photo frame border — redrawn as a vector rect on top of the photos.
//   4. Text — real vector text (selectable, searchable, small file size)
//      instead of baked-in pixels.
//
// Order matters: each layer paints over the ones before it, same as the
// CSS z-index stack it's replacing.
// ─────────────────────────────────────────────────────────────────────────

// Converts a live DOM rect into page-space inches. The preview may be
// wrapped in a CSS transform: scale(...) for on-screen zoom controls —
// getBoundingClientRect reflects that scaling, so every measurement has to
// be divided by domScale first to get back to the page's native 816×1056
// px space before converting to the inches jsPDF's `unit: 'in'` expects.
function rectToPageInches(rect: DOMRect, pageRect: DOMRect, domScale: number) {
  return {
    xIn: (rect.left - pageRect.left) / domScale / 96,
    yIn: (rect.top - pageRect.top) / domScale / 96,
    wIn: rect.width / domScale / 96,
    hIn: rect.height / domScale / 96,
  }
}

// getComputedStyle colors come back as "rgb(r, g, b)" or "rgba(r, g, b, a)".
// jsPDF's color setters want separate numeric channels, so pull them out
// by hand rather than pulling in a color-parsing dependency for this alone.
function parseRgb(color: string): { r: number; g: number; b: number } {
  const match = color.match(/rgba?\(([^)]+)\)/)
  const parts = (match?.[1] ?? '').split(',').map(n => parseFloat(n.trim()))
  return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 }
}

// Draws one photo exactly as the preview shows it — cover-fit, then the
// clamped pan/zoom — into an offscreen canvas at 4x the cell's native
// size, matching the resolution the old full-page html2canvas capture
// used to produce. Draws straight from the live <img> (never swapped or
// mutated — see the note in exportToPDF), which is already decoded because
// it's the same element the browser has been painting on screen all along.
function preRenderPhoto(img: HTMLImageElement, photo: Partial<Photo>, cellW: number, cellH: number): HTMLCanvasElement {
  const offscreen = document.createElement('canvas')
  offscreen.width = cellW * 4
  offscreen.height = cellH * 4
  const ctx = offscreen.getContext('2d')!
  // Scale up front so every coordinate below can stay in the same cell-px
  // space the geometry math (coverRect/clampPan) already uses, instead of
  // multiplying each one by 4 by hand.
  ctx.scale(4, 4)

  // Prefer the dimensions captured at upload (what the preview's own
  // geometry used); fall back to the live element for legacy photos.
  const naturalW = photo.naturalW ?? img.naturalWidth
  const naturalH = photo.naturalH ?? img.naturalHeight
  const rect = coverRect(naturalW, naturalH, cellW, cellH)
  const zoom = photo.zoom ?? 1
  const { x: panX, y: panY } = clampPan(naturalW, naturalH, cellW, cellH, photo.panX ?? 0, photo.panY ?? 0, zoom)

  // Replicate CSS: translate(panX,panY) scale(zoom) with transform-origin: center center
  ctx.translate(cellW / 2, cellH / 2)
  ctx.translate(panX, panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-cellW / 2, -cellH / 2)
  ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height)

  return offscreen
}

export async function exportToPDF(canvasElement: HTMLElement | null, { community = 'Success_Story', photos = [] }: { community?: string; photos?: Photo[] } = {}): Promise<void> {
  if (!canvasElement) throw new Error('No canvas element')

  // Measured once and reused for every layer below — see rectToPageInches.
  const pageRect = canvasElement.getBoundingClientRect()
  const domScale = pageRect.width / PAGE_W

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  })

  // ── Layer 1: background raster ──────────────────────────────────────
  // html2canvas the whole page, but hide the text, photo cells, and photo
  // frame first so this capture only contains the theme bands/stripes/
  // logo/rules/divider — the stuff that's genuinely just pixels. Text and
  // photos are drawn separately below as real vector text and individually
  // selectable images.
  //
  // The hiding happens inside html2canvas's `onclone` callback, which
  // operates on an offscreen clone of the document — never the live page.
  // Mutating the real DOM (the old code's approach for photos) causes a
  // visible flash while the browser repaints the hidden/swapped elements,
  // and requires waiting for that repaint to finish before capturing
  // (decode races). Hiding only the clone avoids both problems entirely:
  // nothing the user is looking at ever changes.
  const backgroundCanvas = await html2canvas(canvasElement, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      clonedDoc
        .querySelectorAll<HTMLElement>('.page-title, .page-label, .page-value, .page-narrative-text, .page-photo-cell, .page-photo-frame')
        .forEach(el => {
          el.style.visibility = 'hidden'
        })
    },
  })
  pdf.addImage(backgroundCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 8.5, 11)

  // ── Layer 2: photos ──────────────────────────────────────────────────
  // Each cell becomes its own addImage call instead of one baked-in pixel
  // region, so a viewer in Acrobat can select and move an individual photo
  // without touching the rest of the page.
  //
  // DOM order of .page-photo-cell img matches photos[] order — the
  // preview renders one cell per photo, in photo order.
  const photoCells = Array.from(canvasElement.querySelectorAll<HTMLElement>('.page-photo-cell'))
  photoCells.forEach((cell, i) => {
    const img = cell.querySelector('img')
    if (!img) return
    const photo = photos[i] ?? {}

    // The cell's rendered rect is the source of truth for both the offscreen
    // canvas's pixel size (page-space px, undoing any on-screen zoom scale)
    // and its placement on the PDF page (inches) — measuring once here keeps
    // both numbers consistent with what's actually on screen.
    const { xIn, yIn, wIn, hIn } = rectToPageInches(cell.getBoundingClientRect(), pageRect, domScale)
    const cellW = wIn * 96
    const cellH = hIn * 96

    const canvas = preRenderPhoto(img, photo, cellW, cellH)
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', xIn, yIn, wIn, hIn)
  })

  // ── Layer 3: photo frame border ──────────────────────────────────────
  // Drawn after the photos so it sits on top, same as its CSS z-index does
  // over the photo cells. Redrawn as a vector rect rather than rasterized
  // with the background because it has to stay above photos that are
  // added afterward as their own objects.
  const frame = canvasElement.querySelector<HTMLElement>('.page-photo-frame')
  if (frame) {
    const frameStyle = getComputedStyle(frame)
    const borderWidthPx = parseFloat(frameStyle.borderTopWidth)
    if (borderWidthPx > 0) {
      const { r, g, b } = parseRgb(frameStyle.borderTopColor)
      const { xIn, yIn, wIn, hIn } = rectToPageInches(frame.getBoundingClientRect(), pageRect, domScale)
      const bwIn = borderWidthPx / 96
      pdf.setDrawColor(r, g, b)
      pdf.setLineWidth(bwIn)
      // CSS border-box sizing draws the border inside the box's own edge;
      // a jsPDF stroke is centered on the path it's given. Insetting by
      // half the line width on every side lines the two up instead of the
      // vector rect bleeding half a border-width outside the CSS one.
      pdf.rect(xIn + bwIn / 2, yIn + bwIn / 2, wIn - bwIn, hIn - bwIn, 'S')
    }
  }

  // ── Layer 4: text ────────────────────────────────────────────────────
  // Real vector text instead of rasterized pixels — selectable, searchable,
  // and far smaller in the resulting file than another 4x-scaled raster
  // pass over the same area would be.
  const textEls = Array.from(canvasElement.querySelectorAll<HTMLElement>('.page-title, .page-label, .page-value, .page-narrative-text'))
  textEls.forEach(el => {
    const style = getComputedStyle(el)
    const { xIn, yIn, wIn } = rectToPageInches(el.getBoundingClientRect(), pageRect, domScale)

    const fontSizePx = parseFloat(style.fontSize)
    const fontWeight = parseInt(style.fontWeight, 10) || 400
    const { r, g, b } = parseRgb(style.color)
    const letterSpacingPx = parseFloat(style.letterSpacing) || 0 // "normal" -> NaN -> 0

    // Browsers resolve an unset `line-height: normal` to a used px value
    // that varies by font metrics, but jsdom/older engines can report the
    // literal string "normal" — fall back to the CSS spec's rough rule of
    // thumb (1.2x font size) in that case.
    const lineHeightRaw = parseFloat(style.lineHeight)
    const lineHeightPx = Number.isNaN(lineHeightRaw) ? fontSizePx * 1.2 : lineHeightRaw

    // CSS positions a line box's glyphs a half-leading below the box's own
    // top edge (the leading is split evenly above and below the glyphs).
    // jsPDF's {baseline:'top'} instead puts the glyph top exactly at the
    // given y, so without this offset every string renders too high.
    const halfLeadingIn = (lineHeightPx - fontSizePx) / 2 / 96

    pdf.setFont('helvetica', fontWeight >= 600 ? 'bold' : 'normal')
    pdf.setFontSize(fontSizePx * 0.75) // CSS px -> PDF pt
    pdf.setTextColor(r, g, b)

    const isCenter = style.textAlign === 'center'
    const xText = isCenter ? xIn + wIn / 2 : xIn
    const yText = yIn + halfLeadingIn

    if (el.classList.contains('page-narrative-text')) {
      // Multiline: splitTextToSize wraps to the box width (honoring the
      // CSS white-space: pre-wrap element's embedded newlines too), then
      // lineHeightFactor reproduces the CSS line-height between lines.
      const widthIn = (wIn * 96 - 2) / 96 // 2px safety margin against clipping the last char of a line
      const lines: string[] = pdf.splitTextToSize(el.textContent ?? '', widthIn)
      // charSpace is in the DOCUMENT's unit (inches here), not points —
      // px * 0.75 (px→pt) renders each label stretched across half the
      // page, one letter every half-inch. px/96 is the correct conversion.
      pdf.text(lines, xText, yText, {
        baseline: 'top',
        lineHeightFactor: lineHeightPx / fontSizePx,
        ...(letterSpacingPx !== 0 ? { charSpace: letterSpacingPx / 96 } : {}),
      })
    } else {
      pdf.text(el.textContent ?? '', xText, yText, {
        baseline: 'top',
        ...(isCenter ? { align: 'center' as const } : {}),
        ...(letterSpacingPx !== 0 ? { charSpace: letterSpacingPx / 96 } : {}),
      })
    }
  })

  const slug = community.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_')
  const dateStr = new Date().toISOString().slice(0, 7)
  const filename = `Success_Story_${slug}_${dateStr}.pdf`

  // iOS Safari (incl. installed PWAs) ignores the anchor `download`
  // attribute, so jsPDF's default save() just opens the PDF in a new tab —
  // user then has to tap Share > Save to Files themselves. The Web Share
  // API opens that same share sheet directly, in one tap.
  //
  // navigator.canShare({ files }) also returns true on desktop Chrome and
  // desktop Safari, but the macOS/Windows share sheet it opens there has no
  // "save to disk" option at all (AirDrop, Mail, Messages, Notes — no Save)
  // — so on a laptop this trapped the user in a menu with no way to
  // actually get the file. Every non-iOS platform's plain `download`
  // attribute works fine, so only take the Share API path on iOS/iPadOS,
  // where it's the one place the plain download is actually broken.
  // iPadOS 13+ reports a desktop Mac user agent, so the common fix is to
  // also check "MacIntel" + touch support — but that alone false-positived
  // on a real MacBook in testing here (some Mac trackpads report nonzero
  // maxTouchPoints for multi-touch gesture recognition, even though
  // there's no touchscreen). Also requiring a coarse pointer closes that
  // gap: a real trackpad/mouse always reports "fine" pointer precision,
  // while an actual touchscreen (iPad) reports "coarse" — so this only
  // fires for a device that both claims touch support AND is actually
  // touch-operated.
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1 &&
      window.matchMedia('(pointer: coarse)').matches)

  if (isIOS && navigator.canShare) {
    const file = new File([pdf.output('blob')], filename, { type: 'application/pdf' })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename })
        return
      } catch (err) {
        if (err && (err as { name?: string }).name === 'AbortError') return // user cancelled the share sheet
        // fall through to the plain download below
      }
    }
  }

  pdf.save(filename)
}
