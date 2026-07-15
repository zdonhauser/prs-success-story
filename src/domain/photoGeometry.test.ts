import { describe, it, expect } from 'vitest'
import { coverRect, clampPan } from './photoGeometry'

describe('coverRect', () => {
  it('scales a wide image to cover a square box, centered horizontally', () => {
    // scale = max(400/2000, 400/1000) = 0.4 → 800x400
    expect(coverRect(2000, 1000, 400, 400)).toEqual({ left: -200, top: 0, width: 800, height: 400 })
  })

  it('scales a tall image to cover a wide box, centered vertically', () => {
    // scale = max(400/1000, 200/2000) = 0.4 → 400x800
    expect(coverRect(1000, 2000, 400, 200)).toEqual({ left: 0, top: -300, width: 400, height: 800 })
  })

  it('is an exact fit when aspect ratios match', () => {
    expect(coverRect(800, 800, 400, 400)).toEqual({ left: 0, top: 0, width: 400, height: 400 })
  })

  it('falls back to the box itself when natural dimensions are missing', () => {
    expect(coverRect(undefined, undefined, 400, 300)).toEqual({ left: 0, top: 0, width: 400, height: 300 })
  })
})

describe('clampPan', () => {
  // 2000x1000 into 400x400 → coverRect is 800x400:
  // at zoom 1, x can overflow ±200, y has zero slack.
  it('clamps pan to the cover overflow at zoom 1', () => {
    expect(clampPan(2000, 1000, 400, 400, 500, 50, 1)).toEqual({ x: 200, y: 0 })
    expect(clampPan(2000, 1000, 400, 400, -500, -50, 1)).toEqual({ x: -200, y: 0 })
  })

  it('allows more pan at higher zoom', () => {
    // zoom 2 → 1600x800: maxX = 600, maxY = 200
    expect(clampPan(2000, 1000, 400, 400, 100, -150, 2)).toEqual({ x: 100, y: -150 })
    expect(clampPan(2000, 1000, 400, 400, 999, -999, 2)).toEqual({ x: 600, y: -200 })
  })

  it('pins pan to zero when the image cannot overflow', () => {
    expect(clampPan(800, 800, 400, 400, 30, -30, 1)).toEqual({ x: 0, y: 0 })
  })

  it('pins pan to zero for missing natural dimensions at zoom 1', () => {
    expect(clampPan(undefined, undefined, 400, 300, 10, 10, 1)).toEqual({ x: 0, y: 0 })
  })
})
