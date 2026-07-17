import { useState, useEffect, useCallback } from 'react'
import { loadSavedForm, saveForm, clearSavedForm } from '@/services/storage'
import { thisMonth } from '@/domain/storyDate'
import type { StoryForm, Photo, FormFieldUpdater } from '@/types'

export function makeDefaultForm(): StoryForm {
  return {
    community: '',
    coordinator: '',
    date: thisMonth(),
    narrative: '',
    narrativeFontSize: null, // null = auto-fit to available space
    photos: [],
    photoLayoutIndex: 0,
    theme: 'classic',
    aiAnswers: { situation: '', highlights: '', impact: '', partners: '' },
  }
}

export function useStoryForm(): {
  form: StoryForm
  update: FormFieldUpdater
  updatePhoto: (index: number, patch: Partial<Photo>) => void
  reset: () => void
} {
  const [form, setForm] = useState<StoryForm>(() => ({ ...makeDefaultForm(), ...loadSavedForm() }))

  const update = useCallback<FormFieldUpdater>((field, value) => {
    setForm(prev => {
      const next: StoryForm = { ...prev, [field]: value }
      if (field === 'photos' && Array.isArray(value) && value.length !== prev.photos.length) {
        next.photoLayoutIndex = 0
      }
      return next
    })
  }, [])

  const updatePhoto = useCallback((index: number, patch: Partial<Photo>) => {
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
