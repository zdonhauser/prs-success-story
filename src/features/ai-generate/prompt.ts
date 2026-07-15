import type { AiAnswers } from '@/types'

// Survey + prompt template for the "Generate with AI" flow, distilled from
// PRS's "How to Create Short Stories with Big Impact!" guide. The three
// questions map to the guide's Situation / Response / Results+Evidence
// framework; Relevance is handled as a prompt instruction rather than a
// fourth question, to keep the survey quick.
export const AI_SURVEY_QUESTIONS: { key: keyof AiAnswers; label: string; placeholder: string }[] = [
  {
    key: 'situation',
    label: 'What was the situation or goal?',
    placeholder: 'e.g. Many residents felt isolated and the courtyard had fallen into disrepair.',
  },
  {
    key: 'response',
    label: 'Who was involved, and what did they do?',
    placeholder: 'e.g. 40 residents, the leasing team, and two local nonprofit partners spent a Saturday planting, painting, and setting up a lending library.',
  },
  {
    key: 'results',
    label: 'What was the result? Include a number or quote if you have one.',
    placeholder: 'e.g. Attendance doubled from last year; one resident said "I finally know my neighbors\' names."',
  },
]

export function buildAiPrompt(answers: Partial<AiAnswers>): string {
  const get = (key: keyof AiAnswers) => (answers[key] || '').trim() || '(not specified)'
  return `You are writing a "Good Neighbor Program Success Story" for Portfolio Resident Services (PRS), a non-profit that provides supportive services to affordable housing communities.

A success story is a professionally written narrative proving the Good Neighbor Program is accomplishing its mission. It's read by stakeholders — residents, property owners, management companies, PRS staff, the Board, and community partners — who may know nothing about this specific program, and it gets reused for quality assurance, business development, newsletters, training, and social media, so it needs to stand on its own.

Write EXACTLY 2 short paragraphs, totaling no more than 195 words (roughly 1200 characters). This is a hard limit, not a suggestion — the narrative has to fit in a fixed box on a printed one-page template alongside a header and photos, so when in doubt, cut a sentence rather than run long. Cover, briefly:
- Situation: the purpose, problem, or goal behind this activity.
- Response: who participated, and what PRS/the Good Neighbor Program actually did.
- Relevance: why this matters to a stakeholder reading it — connect it to an outcome they'd care about (retention, engagement, resident wellbeing, community reputation, etc.), even if that connection isn't spelled out below.
- Results: the outcome, using active, specific verbs (increased, strengthened, adopted, improved, decreased, expanded, recognized) rather than vague ones.
- Evidence: work in any numbers or quotes provided below, only if they fit within the word limit. If a resident is named or quoted, use only their first name to protect confidentiality.

Write in professional but warm third-person prose, in complete sentences, assuming the reader is unfamiliar with this program. Do not include a title, headers, a word count, or any commentary — output only the 2-paragraph narrative text.

Situation: ${get('situation')}
Response — who was involved and what happened: ${get('response')}
Results — outcome, numbers, or quotes: ${get('results')}`
}

export function buildAiLinks(prompt: string): { chatgpt: string; claude: string; copilot: string } {
  const q = encodeURIComponent(prompt)
  return {
    chatgpt: `https://chat.openai.com/?q=${q}`,
    claude: `https://claude.ai/new?q=${q}`,
    // Copilot strips ?q= before it reaches the composer (confirmed: it's
    // gone from sessionStorage's pre-login redirect target too), so there's
    // no working prefill URL for it right now — link in plain and copy the
    // prompt to the clipboard instead so the user can paste it themselves.
    copilot: 'https://copilot.microsoft.com/',
  }
}
