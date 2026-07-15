// Finds the largest font size in [min, max] at which `text` still fits
// within `width` x `availableHeight`, using an offscreen probe element so
// the real DOM never flickers through intermediate sizes.
export function computeAutoFitFontSize({ text, width, availableHeight, lineHeight = 1.65, min = 11, max = 26 }) {
  if (typeof document === 'undefined' || !width || !availableHeight) return min

  const probe = document.createElement('div')
  probe.style.position = 'fixed'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.left = '-9999px'
  probe.style.top = '0'
  probe.style.width = `${width}px`
  probe.style.whiteSpace = 'pre-wrap'
  probe.style.lineHeight = String(lineHeight)
  probe.style.fontFamily = "'Helvetica Neue', Arial, sans-serif"
  probe.textContent = text || ''
  document.body.appendChild(probe)

  const fits = (size) => {
    probe.style.fontSize = `${size}px`
    return probe.scrollHeight <= availableHeight
  }

  let best = min
  if (fits(min)) {
    let lo = min
    let hi = max
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (fits(mid)) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
  }

  document.body.removeChild(probe)
  return best
}
