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
    placeholder: 'e.g. Many families lacked school supplies and structured activities heading into the new school year.',
  },
  {
    key: 'response',
    label: 'Who was involved, and what did they do?',
    placeholder: 'e.g. 35 residents attended our Operation Back to School drive; the leasing office and two local churches donated backpacks and supplies.',
  },
  {
    key: 'results',
    label: 'What was the result? Include a number or quote if you have one.',
    placeholder: 'e.g. Every child who attended left with a fully stocked backpack; one parent said it was "one less thing to worry about this year."',
  },
]

export function buildAiPrompt(answers: Partial<AiAnswers>): string {
  const get = (key: keyof AiAnswers) => (answers[key] || '').trim() || '(not specified)'
  return `Write a "Good Neighbor Program" success story for Portfolio Resident Services (PRS), a non-profit that provides supportive services in affordable housing communities. Success stories are read by residents, property owners, management companies, PRS staff, and community partners who know nothing about this specific activity, and get reused in newsletters, training materials, and social media — so it must stand on its own.

Weave these elements into flowing prose, in this order, without labeling or listing them:
- Situation: the purpose, problem, or goal behind the activity.
- Response: who participated, and what PRS/the program actually did.
- Relevance: why a stakeholder should care — tie it to something they value (retention, engagement, resident wellbeing, community reputation).
- Results: the outcome, described with active verbs (increased, strengthened, adopted, improved, decreased, expanded, recognized).
- Evidence: any numbers or quotes given below, if they fit the length limit. Use residents' first names only, to protect confidentiality.

Tone: professional but warm, third person, complete sentences. Match this length and voice (do not reuse these facts):
"In the month of September, we hosted a mobile clinic in partnership with CVS Project Health. About 20 residents received blood pressure, cholesterol, and glucose checks, plus one-on-one time with a registered nurse — a great way to introduce new residents to the programs available at their activity center. Each visit is valued at $200, a meaningful contribution to the community."

Output rules — follow exactly:
1. Exactly 2 paragraphs, no more than 195 words / ~1200 characters total. Hard limit — cut a sentence rather than run long.
2. Output ONLY the finished narrative: no title, no headers, no bullets, no word count, no notes, no quotation marks around the whole thing, nothing before or after it.
3. Never ask a clarifying question or request more information — if a detail below is missing, write around it using only what's given. Produce the finished narrative as your very first response.

Situation: ${get('situation')}
Response — who was involved and what happened: ${get('response')}
Results — outcome, numbers, or quotes: ${get('results')}`
}

export function buildAiLinks(prompt: string): { chatgpt: string; claude: string; copilot: string; gemini: string } {
  const q = encodeURIComponent(prompt)
  return {
    chatgpt: `https://chat.openai.com/?q=${q}`,
    claude: `https://claude.ai/new?q=${q}`,
    // Copilot and Gemini both lack a working prefill URL: Copilot strips
    // ?q= before it reaches the composer (confirmed via sessionStorage
    // inspection), and Gemini has never supported one natively — the only
    // things that inject a query param into its composer are third-party
    // browser extensions, not the site itself. Link in plain and copy the
    // prompt to the clipboard instead so the user can paste it themselves.
    copilot: 'https://copilot.microsoft.com/',
    gemini: 'https://gemini.google.com/app',
  }
}
