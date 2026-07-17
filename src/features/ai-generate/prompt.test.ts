import { describe, it, expect } from 'vitest'
import { AI_SURVEY_QUESTIONS, buildAiPrompt, buildAiLinks } from './prompt'

describe('AI_SURVEY_QUESTIONS', () => {
  it('matches PRS\'s success-story submission form fields, in order', () => {
    expect(AI_SURVEY_QUESTIONS.map(q => q.key)).toEqual(['situation', 'highlights', 'impact', 'partners'])
  })
})

describe('buildAiPrompt', () => {
  it('embeds trimmed answers verbatim', () => {
    const prompt = buildAiPrompt({
      situation: '  Courtyard in disrepair ',
      highlights: '40 residents replanted it',
      impact: 'Attendance doubled',
      partners: 'A local nursery donated plants',
    })
    expect(prompt).toContain('Situation — resident need or challenge: Courtyard in disrepair')
    expect(prompt).toContain('Highlights — what made it a success or notable: 40 residents replanted it')
    expect(prompt).toContain('Impact — outcome for residents: Attendance doubled')
    expect(prompt).toContain('Partners, resources, or donations, and their value: A local nursery donated plants')
  })

  it('marks missing answers as (not specified)', () => {
    const prompt = buildAiPrompt({})
    expect(prompt).toContain('Situation — resident need or challenge: (not specified)')
    expect(prompt).toContain('Highlights — what made it a success or notable: (not specified)')
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
