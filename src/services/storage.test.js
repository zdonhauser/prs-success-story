// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadSavedForm, saveForm, clearSavedForm } from './storage'

const KEY = 'prs-success-story-form'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('round-trips a form object', () => {
    saveForm({ community: 'Oak Ridge', narrative: 'A story', photos: [] })
    expect(loadSavedForm()).toEqual({ community: 'Oak Ridge', narrative: 'A story', photos: [] })
  })

  it('returns null when nothing is saved', () => {
    expect(loadSavedForm()).toBeNull()
  })

  it('returns null on corrupt JSON instead of throwing', () => {
    localStorage.setItem(KEY, '{not json')
    expect(loadSavedForm()).toBeNull()
  })

  it('drops photos (keeps text) when the first write throws quota errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    saveForm({ community: 'Oak Ridge', photos: [{ id: 'p1', src: 'data:image/jpeg;base64,xxxx' }] })
    expect(loadSavedForm()).toEqual({ community: 'Oak Ridge', photos: [] })
  })

  it('gives up silently when every write throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(() => saveForm({ community: 'X', photos: [] })).not.toThrow()
  })

  it('clearSavedForm removes the entry', () => {
    saveForm({ community: 'X', photos: [] })
    clearSavedForm()
    expect(loadSavedForm()).toBeNull()
  })
})
