import { useState, useEffect, useCallback } from 'react'
import { loadSavedForm, saveForm, clearSavedForm } from '@/services/storage'
import { thisMonth } from '@/domain/storyDate'

export function makeDefaultForm() {
  return {
    community: '',
    coordinator: '',
    date: thisMonth(),
    narrative: '',
    narrativeFontSize: null, // null = auto-fit to available space
    photos: [],
    photoLayoutIndex: 0,
    theme: 'classic',
    aiAnswers: { situation: '', response: '', results: '' },
  }
}

export function useStoryForm() {
  const [form, setForm] = useState(() => ({ ...makeDefaultForm(), ...loadSavedForm() }))

  const update = useCallback((field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'photos' && value.length !== prev.photos.length) {
        next.photoLayoutIndex = 0
      }
      return next
    })
  }, [])

  const updatePhoto = useCallback((index, patch) => {
    setForm(prev => {
      const photos = [...prev.photos]
      photos[index] = { ...photos[index], ...patch }
      return { ...prev, photos }
    })
  }, [])

  // Persist everything typed so a trip out to a browser/app (e.g. the AI
  // prompt links) and back doesn't wipe the form if the PWA gets reloaded.
  useEffect(() => {
    const timer = setTimeout(() => saveForm(form), 400)
    return () => clearTimeout(timer)
  }, [form])

  const reset = useCallback(() => {
    clearSavedForm()
    setForm(makeDefaultForm())
  }, [])

  return { form, update, updatePhoto, reset }
}
