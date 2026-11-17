import { useState } from 'react'
import { askGemini, readGeminiKey, writeGeminiKey } from './gemini'
import { understand, type AssistantCommand } from './intents'
import { imageProblem, readImageFile } from '@/studio/readImage'
import { LOGO_ACCEPT } from '@/studio/IdentityPanel'

interface Message {
  role: 'user' | 'guide' | 'gemini'
  text: string
  confirm?: string
  command?: AssistantCommand
}

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [key, setKey] = useState(() => readGeminiKey())
  const [logoPreview, setLogoPreview] = useState('')
  const [notice, setNotice] = useState('')
  const [messages, setMessages] = useState<Message[]>([{
    role: 'guide',
    text: 'Je réponds sans réseau. Dites « ajoute un hero », « mets un logo », « style nature » ou « exporte ». Une clé Gemini, si vous en collez une, est facultative.',
  }])

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    const local = understand(text)
    const next: Message[] = [...messages, { role: 'user', text }]
    if (!key) {
      setMessages([...next, { role: 'guide', text: local.text, confirm: local.confirm, command: local.command }])
      return
    }
    setMessages([...next, { role: 'guide', text: 'J’interroge Gemini avec votre clé…' }])
    try {
      const answer = await askGemini(text, key)
      setMessages([...next, { role: 'gemini', text: answer.text, confirm: answer.command ? 'Faire cette action' : undefined, command: answer.command }])
    } catch (error) {
      setMessages([...next, { role: 'guide', text: `${error instanceof Error ? error.message : 'Gemini indisponible.'}\n\n${local.text}`, confirm: local.confirm, command: local.command }])
    }
  }

  const importBrand = async (file: File, kind: 'logo' | 'favicon' | 'backdrop') => {
    const problem = imageProblem(file)
    if (problem) {
      setNotice(problem)
      return
    }
    try {
      const dataUrl = await readImageFile(file)
      if (!location.hash.includes('/projet/')) {
        setNotice('Ouvrez d’abord un projet. Le fichier est prêt, il s’appliquera à l’ouverture.')
        window.dispatchEvent(new CustomEvent('atelier-brand', { detail: { kind, dataUrl } }))
      } else {
        window.dispatchEvent(new CustomEvent('atelier-brand', { detail: { kind, dataUrl } }))
        setNotice(kind === 'logo' ? 'Logo ajouté ✅' : kind === 'favicon' ? 'Favicon ajoutée ✅' : 'Fond ajouté ✅')
      }
      if (kind === 'logo') setLogoPreview(dataUrl)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Import impossible.')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open ? (
        <section
          className="flex max-h-[70vh] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const file = event.dataTransfer.files?.[0]
            if (file) void importBrand(file, 'logo')
          }}
        >
          <header className="border-b border-line px-3 py-2">
            <p className="font-serif text-xl">Assistant</p>
            <p className="text-xs text-muted">{key ? 'Gemini est branché. Les actions demandent encore votre accord.' : 'Mode intégré, sans IA et sans clé.'}</p>
          </header>
          <div className="grid min-h-0 flex-1 gap-2 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <article key={index} className={message.role === 'user' ? 'ml-6 rounded-xl bg-paper-2 px-3 py-2 text-sm' : 'mr-4 text-sm'}>
                <p className="text-[11px] uppercase tracking-wider text-muted">{message.role === 'gemini' ? 'Gemini' : message.role === 'user' ? 'Vous' : 'Guide intégré'}</p>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.confirm && message.command ? (
                  <button type="button" className="mt-2 rounded-lg bg-brass px-3 py-1 text-sm text-sand" onClick={() => window.dispatchEvent(new CustomEvent('atelier-assistant', { detail: message.command }))}>
                    {message.confirm}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
          <div className="grid gap-2 border-t border-line p-3">
            <BrandButton label="Importer mon logo" kind="logo" onFile={importBrand} />
            <BrandButton label="Importer le favicon" kind="favicon" onFile={importBrand} />
            <BrandButton label="Importer le fond" kind="backdrop" onFile={importBrand} />
            {logoPreview ? <img src={logoPreview} alt="Aperçu du logo" className="h-14 w-14 rounded-md border border-line object-contain" /> : null}
            {notice ? <p className="text-sm text-brass">{notice}</p> : null}
          </div>
          <form className="grid gap-2 border-t border-line p-3" onSubmit={(event) => { event.preventDefault(); void send() }}>
            <input className="h-10 rounded-lg border border-line bg-sand px-3 text-sm" value={draft} placeholder="Que voulez-vous faire ?" onChange={(event) => setDraft(event.target.value)} />
            <button type="submit" className="h-10 rounded-lg bg-brass text-sm text-sand">Envoyer</button>
            <label className="grid gap-1 text-[11px] text-muted">Clé Gemini facultative
              <input className="h-9 rounded-lg border border-line bg-sand px-2 text-sm" type="password" autoComplete="off" value={key} placeholder="Coller la clé, rien n’est envoyé à Atelier" onChange={(event) => { setKey(event.target.value); writeGeminiKey(event.target.value) }} />
            </label>
            <p className="text-[11px] text-muted">Clé gratuite : aistudio.google.com/apikey, compte Google, bouton Create API key. Elle reste dans ce navigateur.</p>
          </form>
        </section>
      ) : null}
      <button type="button" className="rounded-full bg-brass px-4 py-2 text-sm text-sand shadow-lg" onClick={() => setOpen((value) => !value)}>
        {open ? 'Fermer' : 'Assistant'}
      </button>
    </div>
  )
}

function BrandButton({ label, kind, onFile }: { label: string; kind: 'logo' | 'favicon' | 'backdrop'; onFile: (file: File, kind: 'logo' | 'favicon' | 'backdrop') => void }) {
  return (
    <label className="relative flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-brass text-sm text-sand">
      {label}
      <input
        className="absolute inset-0 cursor-pointer opacity-0"
        type="file"
        accept={LOGO_ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onFile(file, kind)
        }}
      />
    </label>
  )
}
