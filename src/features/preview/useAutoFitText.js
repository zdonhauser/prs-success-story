import { useEffect, useState } from 'react'
import { computeAutoFitFontSize } from '@/services/textMeasure'
import { PAGE_H } from '@/config/page'

export const DEFAULT_NARRATIVE_SIZE = 13
const BOTTOM_BUFFER = 16

// Auto-fit the narrative font to the space actually available below it,
// so a short story fills the page and a long one shrinks instead of
// overflowing. Debounced so it doesn't jitter while typing.
export function useAutoFitText({ rootRef, textRef, narrative, narrativeTop, hasPhotos, photoLayoutIndex, theme, onSize }) {
  const [autoSize, setAutoSize] = useState(DEFAULT_NARRATIVE_SIZE)

  useEffect(() => {
    const hasRealText = narrative && narrative.trim()
    if (!hasRealText) {
      setAutoSize(DEFAULT_NARRATIVE_SIZE)
      onSize?.(DEFAULT_NARRATIVE_SIZE)
      return
    }
    const timer = setTimeout(() => {
      const root = rootRef.current
      const textEl = textRef.current
      if (!root || !textEl) return
      const bottomH = parseFloat(getComputedStyle(root).getPropertyValue('--t-bottom-h')) || 16
      const availableHeight = (PAGE_H - bottomH - BOTTOM_BUFFER) - narrativeTop - textEl.offsetTop
      const size = computeAutoFitFontSize({
        text: narrative,
        width: textEl.clientWidth,
        availableHeight,
      })
      setAutoSize(size)
      onSize?.(size)
    }, 250)
    return () => clearTimeout(timer)
    // Layout-affecting inputs only; refs and onSize are intentionally
    // not dependencies (same behavior as the original inline effect).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrative, hasPhotos, photoLayoutIndex, theme, narrativeTop])

  return autoSize
}
