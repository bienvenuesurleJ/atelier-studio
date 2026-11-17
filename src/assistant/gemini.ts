import type { AssistantCommand } from './intents'

const KEY = 'atelier-gemini-key'

export function readGeminiKey(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function writeGeminiKey(value: string): void {
  localStorage.setItem(KEY, value.trim())
}

export async function askGemini(prompt: string, key: string): Promise<{ text: string; command?: AssistantCommand }> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Tu aides dans Atelier Local, un studio de sites statiques. Réponds en français, en deux ou trois phrases. Utilise une fonction seulement si l’utilisateur demande une action. Ne dis jamais qu’un paiement a réussi.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ functionDeclarations: declarations }],
    }),
  })
  if (!response.ok) throw new Error('Gemini n’a pas répondu. Vérifiez la clé créée sur aistudio.google.com/apikey.')
  const data = await response.json() as { candidates?: { content?: { parts?: { text?: string; functionCall?: { name?: string; args?: Record<string, string> } }[] } }[] }
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const call = parts.find((part) => part.functionCall)?.functionCall
  const text = parts.map((part) => part.text).filter(Boolean).join('\n') || 'Gemini n’a rien répondu de plus.'
  return { text, command: call ? mapCall(call.name, call.args) : undefined }
}

const declarations = [
  { name: 'add_section', description: 'Ajoute une section au site.', parameters: { type: 'OBJECT', properties: { blockType: { type: 'STRING', description: 'hero, gallery, testimonials, contact, pricing, faq, menu, hours, team' } }, required: ['blockType'] } },
  { name: 'set_style', description: 'Change l’univers graphique.', parameters: { type: 'OBJECT', properties: { styleId: { type: 'STRING' } }, required: ['styleId'] } },
  { name: 'focus_logo', description: 'Ouvre le choix du logo.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'add_product', description: 'Ajoute un produit à la boutique.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'export_site', description: 'Ouvre l’export ZIP.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'open_video', description: 'Ouvre Studio Vidéo.', parameters: { type: 'OBJECT', properties: {} } },
]

function mapCall(name: string | undefined, args: Record<string, string> | undefined): AssistantCommand | undefined {
  if (name === 'add_section' && args?.blockType) return { type: 'add-block', blockType: args.blockType }
  if (name === 'set_style' && args?.styleId) return { type: 'set-style', styleId: args.styleId }
  if (name === 'focus_logo') return { type: 'focus-logo' }
  if (name === 'add_product') return { type: 'add-product' }
  if (name === 'export_site') return { type: 'export' }
  if (name === 'open_video') return { type: 'open-video' }
  return undefined
}
