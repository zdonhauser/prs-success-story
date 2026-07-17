import { describe, it, expect } from 'vitest'
import { AI_SURVEY_QUESTIONS, buildAiPrompt, buildAiLinks } from './prompt'

describe('AI_SURVEY_QUESTIONS', () => {
  it('covers the Situation / Response / Results framework in order', () => {
    expect(AI_SURVEY_QUESTIONS.map(q => q.key)).toEqual(['situation', 'response', 'results'])
  })
})

describe('buildAiPrompt', () => {
  it('embeds trimmed answers verbatim', () => {
    const prompt = buildAiPrompt({
      situation: '  Courtyard in disrepair ',
      response: 'Residents replanted it',
      results: 'Attendance doubled',
    })
    expect(prompt).toContain('Situation: Courtyard in disrepair')
    expect(prompt).toContain('Response — who was involved and what happened: Residents replanted it')
    expect(prompt).toContain('Results — outcome, numbers, or quotes: Attendance doubled')
  })

  it('marks missing answers as (not specified)', () => {
    const prompt = buildAiPrompt({})
    expect(prompt).toContain('Situation: (not specified)')
    expect(prompt).toContain('Response — who was involved and what happened: (not specified)')
  })

  it('keeps the hard length cap in the instructions', () => {
    const prompt = buildAiPrompt({})
    expect(prompt).toContain('Exactly 2 paragraphs')
    expect(prompt).toContain('no more than 195 words')
  })

  it('instructs the model to never ask clarifying questions', () => {
    const prompt = buildAiPrompt({})
    expect(prompt).toContain('Never ask a clarifying question')
  })

  it('instructs the model to output only the narrative', () => {
    const prompt = buildAiPrompt({})
    expect(prompt).toContain('Output ONLY the finished narrative')
  })
})

describe('buildAiLinks', () => {
  it('URL-encodes the prompt for ChatGPT and Claude', () => {
    const links = buildAiLinks('hello world & more')
    expect(links.chatgpt).toBe(`https://chat.openai.com/?q=${encodeURIComponent('hello world & more')}`)
    expect(links.claude).toBe(`https://claude.ai/new?q=${encodeURIComponent('hello world & more')}`)
  })

  it('links Copilot plain — it strips ?q= so there is no working prefill', () => {
    expect(buildAiLinks('x').copilot).toBe('https://copilot.microsoft.com/')
  })

  it('links Gemini plain — it has no native prefill mechanism', () => {
    expect(buildAiLinks('x').gemini).toBe('https://gemini.google.com/app')
  })
})
