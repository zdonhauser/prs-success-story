// Computes the position/size of an image rendered at "object-fit: cover"
// scale, but as real box geometry (not CSS object-fit) so the full image
// stays available for pan/zoom instead of being clipped away up front.
export function coverRect(naturalW, naturalH, boxW, boxH) {
  if (!naturalW || !naturalH) {
    return { left: 0, top: 0, width: boxW, height: boxH }
  }
  const scale = Math.max(boxW / naturalW, boxH / naturalH)
  const width = naturalW * scale
  const height = naturalH * scale
  return { left: (boxW - width) / 2, top: (boxH - height) / 2, width, height }
}
