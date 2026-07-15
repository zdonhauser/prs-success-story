import { useState, useEffect } from 'react'
import type React from 'react'
import { PAGE_W, PAGE_H } from '@/config/page'

// Fits the fixed-size page into whatever space the preview area actually
// has. Reads actual padding instead of a hardcoded desktop value so it
// also fits correctly at the mobile/tablet breakpoint, which uses much
// smaller padding. Re-measures on resize and sidebar collapse/expand.
export function usePreviewScale(previewAreaRef: React.RefObject<HTMLDivElement | null>, sidebarCollapsed: boolean): number {
  const [scale, setScale] = useState(0.6)

  useEffect(() => {
    const measure = () => {
      const area = previewAreaRef.current
      if (!area) return
      const cs = getComputedStyle(area)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const label = area.querySelector<HTMLElement>('.preview-label')
      const labelH = label ? label.offsetHeight + parseFloat(getComputedStyle(label).marginBottom || '0') : 0
      const availW = area.clientWidth - padX
      const availH = area.clientHeight - padY - labelH
      const s = Math.min(availW / PAGE_W, availH / PAGE_H, 1)
      setScale(Math.max(0.2, s))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [previewAreaRef, sidebarCollapsed])

  return scale
}
