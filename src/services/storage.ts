import type { StoryForm } from '@/types'

const STORAGE_KEY = 'prs-success-story-form'
const SCHEMA_VERSION = 1

export function loadSavedForm(): Partial<StoryForm> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.v === SCHEMA_VERSION) return parsed.form
    // Legacy (pre-versioning) payloads were the bare form object. Accept
    // them so nobody loses an in-flight draft; the next save rewrites in
    // the current envelope.
    if (parsed && typeof parsed === 'object' && parsed.v === undefined && 'community' in parsed) return parsed as Partial<StoryForm>
    return null
  } catch {
    return null
  }
}

export function saveForm(form: StoryForm): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SCHEMA_VERSION, form }))
  } catch {
    // Likely quota exceeded from base64 photo data — retry without photos
    // so the text fields (which are what people actually lose typing) survive.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SCHEMA_VERSION, form: { ...form, photos: [] } }))
    } catch {
      // Persistence is a nice-to-have, not critical — give up silently.
    }
  }
}

export function clearSavedForm(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
