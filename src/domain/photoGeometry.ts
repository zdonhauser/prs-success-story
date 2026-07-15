import type { CoverRect } from '@/types'

// Computes the position/size of an image rendered at "object-fit: cover"
// scale, but as real box geometry (not CSS object-fit) so the full image
// stays available for pan/zoom instead of being clipped away up front.
export function coverRect(naturalW: number | undefined, naturalH: number | undefined, boxW: number, boxH: number): CoverRect {
  if (!naturalW || !naturalH) {
    return { left: 0, top: 0, width: boxW, height: boxH }
  }
  const scale = Math.max(boxW / naturalW, boxH / naturalH)
  const width = naturalW * scale
  const height = naturalH * scale
  return { left: (boxW - width) / 2, top: (boxH - height) / 2, width, height }
}

// Clamps pan so the (cover-fit, scaled by zoom) image can never move far
// enough to expose blank space around it inside the cell — the image must
// always fully cover the box. Used both while dragging in the crop modal
// and when rendering, so a stale/out-of-range stored pan (e.g. from before
// this clamp existed) can't leave a gap in the preview or exported PDF.
export function clampPan(naturalW: number | undefined, naturalH: number | undefined, boxW: number, boxH: number, panX: number, panY: number, zoom: number): { x: number; y: number } {
  const rect = coverRect(naturalW, naturalH, boxW, boxH)
  const maxX = Math.max(0, (rect.width * zoom - boxW) / 2)
  const maxY = Math.max(0, (rect.height * zoom - boxH) / 2)
  // `+ 0` normalizes IEEE negative zero (e.g. clamping a negative pan
  // against maxY = 0 yields -0), so callers and tests see plain 0.
  return {
    x: Math.min(maxX, Math.max(-maxX, panX)) + 0,
    y: Math.min(maxY, Math.max(-maxY, panY)) + 0,
  }
}
