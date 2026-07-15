const STORAGE_KEY = 'prs-success-story-form'

export function loadSavedForm() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveForm(form) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  } catch {
    // Likely quota exceeded from base64 photo data — retry without photos
    // so the text fields (which are what people actually lose typing) survive.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form, photos: [] }))
    } catch {
      // Persistence is a nice-to-have, not critical — give up silently.
    }
  }
}

export function clearSavedForm() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
