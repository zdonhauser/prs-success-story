import type { AiAnswers } from '@/types'

// Survey questions match PRS's actual "Good Neighbor Program" success-story
// submission form verbatim (situation/highlights/impact/partners), so
// coordinators are answering questions they already recognize rather than a
// different framework invented for this tool. The prompt below still maps
// these onto the guide's fuller Situation/Response/Relevance/Results/
// Evidence framework — Relevance in particular isn't its own form field, so
// it's handled as a prompt instruction instead.
export const AI_SURVEY_QUESTIONS: { key: keyof AiAnswers; label: string; placeholder: string }[] = [
  {
    key: 'situation',
    label: 'What resident need or challenge did this event or activity address?',
    placeholder: 'e.g. Residents wanted a low-cost way to gather with neighbors and celebrate as a community before the holidays.',
  },
  {
    key: 'highlights',
    label: 'What made this event a success or notable?',
    placeholder: 'e.g. 30 residents came out for our Fall Festival — pumpkin decorating, a chili cook-off, and a costume contest for the kids.',
  },
  {
    key: 'impact',
    label: 'What was the impact or outcome for residents as a result of this event?',
    placeholder: 'e.g. Several families said it was the first time they\'d met their neighbors; kids left with pumpkins and prizes.',
  },
  {
    key: 'partners',
    label: 'Were there any community partners, resources, or donations, and at what value?',
    placeholder: 'e.g. Property management donated $150 for supplies, and a local grocery store donated pumpkins and cider.',
  },
]

export function buildAiPrompt(answers: Partial<AiAnswers>): string {
  const get = (key: keyof AiAnswers) => (answers[key] || '').trim() || '(not specified)'
  return `Write a "Good Neighbor Program" success story for Portfolio Resident Services (PRS), a non-profit that provides supportive services in affordable housing communities. Success stories are read by residents, property owners, management companies, PRS staff, and community partners who know nothing about this specific activity, and get reused in newsletters, training materials, and social media — so it must stand on its own.

Weave these elements into flowing prose, in this order, without labeling or listing them:
- Situation: the resident need or challenge this addressed.
- Response: what happened, and who was involved — residents, PRS/the program, and any partners.
- Relevance: why a stakeholder should care — tie it to something they value (retention, engagement, resident wellbeing, community reputation).
- Results: the impact on residents, described with active verbs (increased, strengthened, adopted, improved, decreased, expanded, recognized).
- Evidence: any numbers, donation values, or quotes given below, if they fit the length limit. Use residents' first names only, to protect confidentiality.

Tone: professional but warm, third person, complete sentences. Match this length and voice (do not reuse these facts):
"The Good Neighbor Program's annual We Are Blood community blood drive was a tremendous success, showcasing the generosity of our neighborhood. Residents, friends, and families came together with one shared purpose — to help save lives through blood donation. In just a few hours, more than 25 community members donated blood to support We Are Blood, an organization serving hospitals across a 10-county region in Central Texas. Events like this don't just provide life-saving resources for local hospitals — they strengthen neighborhood connections and show what residents can accomplish together."

Output rules — follow exactly:
1. Exactly 2 paragraphs, no more than 195 words / ~1200 characters total. Hard limit — cut a sentence rather than run long.
2. Output ONLY the finished narrative: no title, no headers, no bullets, no word count, no notes, no quotation marks around the whole thing, nothing before or after it.
3. Never ask a clarifying question or request more information — if a detail below is missing, write around it using only what's given. Produce the finished narrative as your very first response.

Situation — resident need or challenge: ${get('situation')}
Highlights — what made it a success or notable: ${get('highlights')}
Impact — outcome for residents: ${get('impact')}
Partners, resources, or donations, and their value: ${get('partners')}`
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
