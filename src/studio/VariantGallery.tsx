import { useMemo, useState } from 'react'
import { BLOCKS, createBlock } from '@/domain/blocks'
import type { BlockType, Project } from '@/domain/types'
import { buildCss } from '@/export/css'
import { renderStandaloneBlock } from '@/export/render'
import { createSampleProject } from '@/domain/createProject'

const sampleContext = {
  kind: 'vitrine' as const,
  businessType: 'generic' as const,
  name: 'Atelier',
  city: 'Lyon',
  phone: '',
  email: '',
  address: '',
  postalCode: '',
}

export function VariantGallery({ project, onAdd }: { project: Project; onAdd: (type: BlockType, variant: string) => void }) {
  const [open, setOpen] = useState<BlockType | null>('hero')
  const css = useMemo(() => buildCss(createSampleProject()), [])
  const groups = new Map<string, typeof BLOCKS>()
  for (const definition of BLOCKS) {
    const list = groups.get(definition.category) ?? []
    list.push(definition)
    groups.set(definition.category, list)
  }
  return (
    <div className="grid gap-4">
      {[...groups.entries()].map(([category, definitions]) => (
        <section key={category}>
          <h3 className="text-xs uppercase tracking-[0.14em] text-brass">{category}</h3>
          <ul className="mt-2 grid gap-2">
            {definitions.map((definition) => {
              const expanded = open === definition.type
              return (
                <li key={definition.type} className="rounded-xl border border-line">
                  <button type="button" className="flex w-full items-center justify-between px-2 py-2 text-left" onClick={() => setOpen(expanded ? null : definition.type)}>
                    <span className="text-sm">{definition.name}</span>
                    <span className="text-[11px] text-muted">{definition.variants.length} variantes</span>
                  </button>
                  {expanded ? (
                    <div className="grid gap-2 px-2 pb-2">
                      {definition.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          className="overflow-hidden rounded-lg border border-line text-left hover:border-brass"
                          onClick={() => onAdd(definition.type, variant.id)}
                        >
                          <Thumb css={css} project={project} type={definition.type} variant={variant.id} />
                          <span className="block px-2 py-1 text-xs">{variant.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Thumb({ css, project, type, variant }: { css: string; project: Project; type: BlockType; variant: string }) {
  const html = useMemo(() => {
    const block = createBlock(type, { ...sampleContext, name: project.business.name || 'Atelier', city: project.business.city || 'Lyon' }, variant)
    const body = renderStandaloneBlock(project, block)
    return `<!doctype html><html><head><meta charset="utf-8"><style>${css}body{margin:0;background:#fff}</style></head><body>${body}</body></html>`
  }, [css, project, type, variant])
  return (
    <span className="relative block h-24 overflow-hidden bg-white">
      <iframe title={`${type} ${variant}`} className="pointer-events-none absolute left-0 top-0 h-[520px] w-[760px] origin-top-left scale-[0.28]" srcDoc={html} tabIndex={-1} />
    </span>
  )
}
