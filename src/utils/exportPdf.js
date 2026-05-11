import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

async function preRenderPhoto(img, cellW, cellH, zoom, panX, panY) {
  const offscreen = document.createElement('canvas')
  offscreen.width = cellW
  offscreen.height = cellH
  const ctx = offscreen.getContext('2d')

  // Replicate object-fit:cover
  const coverScale = Math.max(cellW / img.naturalWidth, cellH / img.naturalHeight)
  const drawnW = img.naturalWidth * coverScale
  const drawnH = img.naturalHeight * coverScale
  const drawX = (cellW - drawnW) / 2
  const drawY = (cellH - drawnH) / 2

  // Replicate CSS: translate(panX,panY) scale(zoom) with transform-origin: center center
  ctx.translate(cellW / 2, cellH / 2)
  ctx.translate(panX, panY)
  ctx.scale(zoom, zoom)
  ctx.translate(-cellW / 2, -cellH / 2)
  ctx.drawImage(img, drawX, drawY, drawnW, drawnH)

  return offscreen.toDataURL('image/jpeg', 0.95)
}

export async function exportToPDF(canvasElement, community = 'Success_Story') {
  if (!canvasElement) throw new Error('No canvas element')

  // Pre-render each photo cell to an offscreen canvas so html2canvas
  // gets the correctly cropped/zoomed pixel data instead of relying on
  // object-fit:cover which it doesn't handle well at high scale.
  const photoImgs = Array.from(canvasElement.querySelectorAll('.page-photo-cell img'))
  const saved = photoImgs.map(img => ({
    src: img.src,
    objectFit: img.style.objectFit,
    transform: img.style.transform,
  }))

  for (const img of photoImgs) {
    const cell = img.closest('.page-photo-cell')
    const cellW = parseInt(cell.style.width)
    const cellH = parseInt(cell.style.height)
    const zoom = parseFloat(img.dataset.zoom || '1')
    const panX = parseFloat(img.dataset.panX || '0')
    const panY = parseFloat(img.dataset.panY || '0')
    img.src = await preRenderPhoto(img, cellW, cellH, zoom, panX, panY)
    img.style.objectFit = 'fill'
    img.style.transform = 'none'
  }

  await new Promise(r => setTimeout(r, 60))

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
  pdf.save(`Success_Story_${slug}_${dateStr}.pdf`)
}
