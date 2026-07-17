import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { coverRect, clampPan } from '@/domain/photoGeometry'
import type { Photo } from '@/types'

// Draws one photo exactly as the preview shows it — cover-fit, then the
// clamped pan/zoom — into an offscreen canvas at the cell's native size,
// so html2canvas gets plain pixel data instead of CSS transforms it
// handles badly at high scale.
function preRenderPhoto(img: HTMLImageElement, photo: Partial<Photo>, cellW: number, cellH: number): string {
  const offscreen = document.createElement('canvas')
  offscreen.width = cellW
  offscreen.height = cellH
  const ctx = offscreen.getContext('2d')!

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

  return offscreen.toDataURL('image/jpeg', 0.95)
}

export async function exportToPDF(canvasElement: HTMLElement | null, { community = 'Success_Story', photos = [] }: { community?: string; photos?: Photo[] } = {}): Promise<void> {
  if (!canvasElement) throw new Error('No canvas element')

  // Pre-render each photo cell to an offscreen canvas so html2canvas
  // gets the correctly cropped/zoomed pixel data instead of relying on
  // object-fit:cover which it doesn't handle well at high scale.
  // DOM order of .page-photo-cell img matches photos[] order — the
  // preview renders one cell per photo, in photo order.
  const photoImgs = Array.from(canvasElement.querySelectorAll<HTMLImageElement>('.page-photo-cell img'))
  const saved = photoImgs.map(img => ({
    src: img.src,
    objectFit: img.style.objectFit,
    transform: img.style.transform,
    left: img.style.left,
    top: img.style.top,
    width: img.style.width,
    height: img.style.height,
  }))

  photoImgs.forEach((img, i) => {
    const photo = photos[i] ?? {}
    const cell = img.closest<HTMLElement>('.page-photo-cell')!
    const cellW = parseInt(cell.style.width)
    const cellH = parseInt(cell.style.height)
    img.src = preRenderPhoto(img, photo, cellW, cellH)
    img.style.objectFit = 'fill'
    img.style.transform = 'none'
    // The pre-rendered image above is already exactly cellW x cellH with
    // the crop/pan/zoom baked in — but the element's own left/top/width/
    // height are still the (much larger, offset) values used for the
    // live pan/zoom view. Without resetting them, the browser stretches
    // this new small image to fill that old large box — a brief visible
    // warp right before html2canvas captures this exact (warped) state.
    img.style.left = '0px'
    img.style.top = '0px'
    img.style.width = `${cellW}px`
    img.style.height = `${cellH}px`
  })

  // Wait for the browser to actually finish decoding each swapped-in
  // image before capturing. A flat timeout isn't reliable — decode time
  // scales with photo size/count/device speed, and capturing mid-decode
  // leaves that cell painted as a blank/black box (the old bitmap is
  // already gone, the new one isn't ready yet). img.decode() resolves
  // exactly when it's safe to paint; fall back to a short delay if the
  // browser lacks it or the decode call itself errors.
  await Promise.all(photoImgs.map(img =>
    typeof img.decode === 'function'
      ? img.decode().catch(() => new Promise(r => setTimeout(r, 60)))
      : new Promise(r => setTimeout(r, 60))
  ))

  const canvas = await html2canvas(canvasElement, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  // Restore original image states
  photoImgs.forEach((img, i) => {
    img.src = saved[i].src
    img.style.objectFit = saved[i].objectFit
    img.style.transform = saved[i].transform
    img.style.left = saved[i].left
    img.style.top = saved[i].top
    img.style.width = saved[i].width
    img.style.height = saved[i].height
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11)

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
