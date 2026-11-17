import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Eye, EyeOff, Monitor, Redo2, Smartphone, Tablet, Trash2, Undo2 } from 'lucide-react'
import { getBlockDefinition } from '@/domain/blocks'
import { emptyBackdrop } from '@/domain/backdrop'
import { PALETTES, STYLES } from '@/domain/styles'
import { applyCommittedBoxes } from '@/domain/freeform'
import { IdentityPanel, SectionBackdrop } from '@/studio/IdentityPanel'
import { VariantGallery } from '@/studio/VariantGallery'
import { ShopPanel } from '@/studio/ShopPanel'
import { FreePanel } from '@/studio/FreePanel'
import { MotionPanel } from '@/studio/MotionPanel'
import {
  addBlock,
  addPage,
  duplicateBlock,
  removeBlock,
  removePage,
  reorderBlocks,
  setElementStyle,
  setField,
  setFontPair,
  setPalette,
  setStyle,
  setTokenColor,
  touch,
  updateBlock,
} from '@/domain/projectOps'
import { FONT_PAIRS } from '@/domain/styles'
import type { Block, ElementStyle, Project, SiteBackdrop, StyleId, Viewport } from '@/domain/types'
import { emptyProduct } from '@/domain/shop'
import type { AssistantCommand } from '@/assistant/intents'
import { exportIssues, previewDocument } from '@/export/generateSite'
import { zipProject } from '@/export/zip'
import { CONNECTORS, connectorStatusLabel } from '@/domain/connectors'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import { Toggle } from '@/components/ui/switch'
import { Modal } from '@/components/ui/dialog'
import { fileToDataUrl } from '@/studio/images'
import { LOGO_ACCEPT } from '@/studio/IdentityPanel'
import { ThemeSwitch } from '@/studio/ThemeSwitch'
import { ImageFrameButton } from '@/studio/ImageFrameDialog'
import { fontFormat, safeFamily } from '@/domain/fonts'
import { cn } from '@/lib/utils'

export function Editor({ project, onChange, onBack, onVideo }: { project: Project; onChange: (project: Project) => void; onBack: () => void; onVideo?: () => void }) {
  const [pageId, setPageId] = useState(project.pages[0]?.id ?? '')
  const [selectedId, setSelectedId] = useState('')
  const [elementKey, setElementKey] = useState('')
  const [nodeIds, setNodeIds] = useState<string[]>([])
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [tab, setTab] = useState<'add' | 'layers' | 'pages' | 'media' | 'shop'>('layers')
  const [preview, setPreview] = useState(false)
  const [inspectorWidth, setInspectorWidth] = useState(360)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [rightMode, setRightMode] = useState<'block' | 'identity'>('block')
  const scrollRequest = useRef('')
  const [issuesOpen, setIssuesOpen] = useState(false)
  const past = useRef<Project[]>([])
  const future = useRef<Project[]>([])
  const frame = useRef<HTMLIFrameElement>(null)
  const logoInput = useRef<HTMLInputElement>(null)
  const page = project.pages.find((item) => item.id === pageId) ?? project.pages[0]
  const block = page?.blocks.find((item) => item.id === selectedId)
  const html = useMemo(() => (page ? previewDocument(project, page.slug) : ''), [project, page])

  const commit = (next: Project, record = true) => {
    if (record) {
      past.current = [...past.current.slice(-39), project]
      future.current = []
    }
    onChange(next)
  }
  const undo = () => {
    const previous = past.current.pop()
    if (!previous) return
    future.current.push(project)
    onChange(previous)
  }
  const redo = () => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(project)
    onChange(next)
  }

  useEffect(() => {
    const onAssist = (event: Event) => {
      const command = (event as CustomEvent<AssistantCommand>).detail
      if (!command) return
      if (command.type === 'focus-logo') {
        setRightMode('identity')
        setInspectorOpen(true)
        logoInput.current?.click()
      }
      if (command.type === 'export') setIssuesOpen(true)
      if (command.type === 'set-style') commit(setStyle(project, command.styleId as StyleId))
      if (command.type === 'add-product') commit(touch({ ...project, products: [emptyProduct({ price: 12, stock: 5 }), ...(project.products ?? [])], shop: 'mini' }))
      if (command.type === 'add-block' && page) {
        const before = new Set(page.blocks.map((item) => item.id))
        const next = addBlock(project, page.id, command.blockType as Block['type'])
        const added = next.pages.find((item) => item.id === page.id)?.blocks.find((item) => !before.has(item.id))
        commit(next)
        if (!added) return
        scrollRequest.current = added.id
        setSelectedId(added.id)
        setRightMode('block')
        setInspectorOpen(true)
      }
    }
    const onBrand = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: string; dataUrl?: string }>).detail
      if (!detail?.dataUrl) return
      if (detail.kind === 'logo') commit(touch({ ...project, logo: detail.dataUrl }))
      if (detail.kind === 'favicon') commit(touch({ ...project, favicon: detail.dataUrl }))
      if (detail.kind === 'backdrop') commit(touch({ ...project, backdrop: { ...(project.backdrop ?? emptyBackdrop()), src: detail.dataUrl } }))
      setRightMode('identity')
      setInspectorOpen(true)
    }
    window.addEventListener('atelier-assistant', onAssist)
    window.addEventListener('atelier-brand', onBrand)
    return () => {
      window.removeEventListener('atelier-assistant', onAssist)
      window.removeEventListener('atelier-brand', onBrand)
    }
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const data = event.data as { type?: string; id?: string; element?: string; slug?: string; value?: string; ids?: string[]; blockId?: string; boxes?: { id: string; x: number; y: number; w: number; h: number; r: number; z: number }[] }
      if (data?.type === 'atelier-logo') logoInput.current?.click()
      if (data?.type === 'atelier-select' && data.id) {
        setSelectedId(data.id)
        setElementKey(data.element?.split(':')[1] ?? '')
        setTab('layers')
      }
      if (data?.type === 'atelier-nav' && data.slug) {
        const target = project.pages.find((item) => item.slug === data.slug)
        if (target) setPageId(target.id)
      }
      if (data?.type === 'atelier-edit' && data.element) {
        const [id, key] = data.element.split(':')
        if (id && key && page) commit(setField(project, page.id, id, key, data.value ?? ''))
      }
      if (data?.type === 'atelier-nodes') {
        if (data.blockId) setSelectedId(data.blockId)
        const next = data.ids ?? []
        setNodeIds((current) => (current.length === next.length && current.every((id, index) => id === next[index]) ? current : next))
        if (next.length) setElementKey('')
      }
      if (data?.type === 'atelier-free-commit' && data.blockId && data.boxes && page) {
        commit(updateBlock(project, page.id, data.blockId, (current) => ({
          ...current,
          freeNodes: applyCommittedBoxes(current.freeNodes ?? [], viewport, data.boxes ?? []),
        })))
      }
      if (data?.type === 'atelier-node-text' && data.id && page) {
        const host = page.blocks.find((item) => (item.freeNodes ?? []).some((node) => node.id === data.id))
        if (host) {
          commit(updateBlock(project, page.id, host.id, (current) => ({
            ...current,
            freeNodes: current.freeNodes.map((node) => node.id === data.id ? { ...node, text: data.value ?? '' } : node),
          })))
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  })

  useEffect(() => {
    const win = frame.current?.contentWindow
    if (!win) return
    const scroll = scrollRequest.current !== '' && scrollRequest.current === selectedId
    win.postMessage({ type: 'atelier-highlight', id: selectedId, element: elementKey ? `${selectedId}:${elementKey}` : '', scroll }, '*')
    win.postMessage({ type: 'atelier-reselect', ids: nodeIds }, '*')
  }, [selectedId, elementKey, html, nodeIds])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const onDragEnd = (event: DragEndEvent) => {
    if (!page || !event.over) return
    const from = page.blocks.findIndex((item) => item.id === event.active.id)
    const to = page.blocks.findIndex((item) => item.id === event.over?.id)
    if (from < 0 || to < 0) return
    commit(reorderBlocks(project, page.id, from, to))
  }

  const width = viewport === 'mobile' ? 390 : viewport === 'tablet' ? 820 : 1180
  const issues = exportIssues(project)
  const errors = issues.filter((issue) => issue.level === 'error')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-line px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={16} /> Projets</Button>
        <input
          className="min-w-40 flex-1 bg-transparent font-serif text-xl outline-none"
          value={project.name}
          aria-label="Nom du projet"
          onChange={(event) => commit(touch({ ...project, name: event.target.value }))}
        />
        <span className="text-xs text-muted">Enregistré dans ce navigateur</span>
        <Button variant="ghost" size="icon" aria-label="Annuler" onClick={undo}><Undo2 size={16} /></Button>
        <Button variant="ghost" size="icon" aria-label="Rétablir" onClick={redo}><Redo2 size={16} /></Button>
        <div className="flex rounded-lg border border-line">
          <Device icon={<Monitor size={15} />} label="Ordinateur" active={viewport === 'desktop'} onClick={() => setViewport('desktop')} />
          <Device icon={<Tablet size={15} />} label="Tablette" active={viewport === 'tablet'} onClick={() => setViewport('tablet')} />
          <Device icon={<Smartphone size={15} />} label="Mobile" active={viewport === 'mobile'} onClick={() => setViewport('mobile')} />
        </div>
        <ThemeSwitch />
        <Button size="sm" onClick={() => { setRightMode('identity'); setInspectorOpen(true); logoInput.current?.click() }}>Logo</Button>
        <input
          ref={logoInput}
          className="sr-only"
          type="file"
          accept={LOGO_ACCEPT}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            void fileToDataUrl(file)
              .then((logo) => {
                commit(touch({ ...project, logo }))
                toast.success('Logo visible dans l’aperçu')
              })
              .catch((error) => toast.error(error instanceof Error ? error.message : 'Le logo n’a pas pu être lu.'))
          }}
        />
        <Button variant="quiet" size="sm" onClick={() => setPreview((value) => !value)}>{preview ? 'Éditer' : 'Aperçu'}</Button>
        {onVideo ? <Button variant="quiet" size="sm" onClick={onVideo}>Vidéo</Button> : null}
        <Button size="sm" onClick={() => setIssuesOpen(true)}>Exporter</Button>
      </header>
      <div
        className="grid min-h-0 min-w-0 flex-1 overflow-hidden"
        style={{ gridTemplateColumns: preview ? 'minmax(0,1fr)' : inspectorOpen ? `${tab === 'shop' ? 360 : 248}px minmax(0,1fr) ${inspectorWidth}px` : `${tab === 'shop' ? 360 : 248}px minmax(0,1fr) 44px` }}
      >
        {!preview ? (
          <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-line">
            <div className="flex border-b border-line text-xs">
              {(['add', 'layers', 'pages', 'media', 'shop'] as const).map((id) => (
                <button key={id} type="button" className={cn('flex-1 py-2', tab === id && 'text-brass')} onClick={() => setTab(id)}>
                  {id === 'add' ? 'Ajouter' : id === 'layers' ? 'Calques' : id === 'pages' ? 'Pages' : id === 'media' ? 'Médias' : 'Boutique'}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
              {tab === 'add' && page ? (
                <VariantGallery
                  project={project}
                  onAdd={(type, variant) => {
                    const before = new Set(page.blocks.map((item) => item.id))
                    const next = addBlock(project, page.id, type, variant)
                    const added = next.pages.find((item) => item.id === page.id)?.blocks.find((item) => !before.has(item.id))
                    commit(next)
                    if (!added) return
                    scrollRequest.current = added.id
                    setSelectedId(added.id)
                    setElementKey('')
                    setRightMode('block')
                    setInspectorOpen(true)
                  }}
                />
              ) : null}
              {tab === 'layers' && page ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={page.blocks.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <ul className="grid gap-1">
                      {page.blocks.map((item) => (
                        <Layer
                          key={item.id}
                          block={item}
                          active={item.id === selectedId}
                          onSelect={() => { setSelectedId(item.id); setElementKey(''); setRightMode('block'); setInspectorOpen(true) }}
                          onHide={() => commit(updateBlock(project, page.id, item.id, (current) => ({ ...current, visible: !current.visible })))}
                          onDuplicate={() => commit(duplicateBlock(project, page.id, item.id))}
                          onDelete={() => commit(removeBlock(project, page.id, item.id))}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              ) : null}
              {tab === 'pages' ? (
                <Pages project={project} pageId={page?.id ?? ''} commit={commit} setPageId={setPageId} />
              ) : null}
              {tab === 'media' ? <Media project={project} commit={commit} pageId={page?.id} blockId={block?.id} elementKey={elementKey} /> : null}
              {tab === 'shop' ? <ShopPanel project={project} commit={(next) => commit(touch(next))} /> : null}
            </div>
          </aside>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#090807]">
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mx-auto h-full overflow-hidden rounded-xl border border-line bg-white shadow-2xl" style={{ width: `min(100%, ${width}px)` }}>
              <iframe
                ref={frame}
                title="Aperçu du site"
                className="h-full min-h-[420px] w-full bg-white"
                srcDoc={html}
                onLoad={() => {
                  const scroll = scrollRequest.current !== '' && scrollRequest.current === selectedId
                  scrollRequest.current = ''
                  frame.current?.contentWindow?.postMessage({ type: 'atelier-highlight', id: selectedId, element: elementKey ? `${selectedId}:${elementKey}` : '', scroll }, '*')
                }}
              />
            </div>
          </div>
          <p className="shrink-0 px-4 pb-2 text-center text-xs text-muted">Cliquez un texte pour le sélectionner. Double-cliquez pour l’écrire. Le rendu est celui de l’export.</p>
        </div>
        {!preview ? (
          <aside className="relative flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-line">
            {inspectorOpen ? (
              <div
                className="absolute bottom-0 left-0 top-0 z-10 w-1.5 cursor-col-resize"
                onPointerDown={(event) => {
                  const startX = event.clientX
                  const startW = inspectorWidth
                  const move = (next: PointerEvent) => setInspectorWidth(Math.min(520, Math.max(280, startW + startX - next.clientX)))
                  const up = () => {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                  }
                  window.addEventListener('pointermove', move)
                  window.addEventListener('pointerup', up)
                }}
              />
            ) : null}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-2 py-1">
              {inspectorOpen ? <span className="text-xs text-muted">Réglages</span> : null}
              <button type="button" className="text-xs text-brass" onClick={() => setInspectorOpen((value) => !value)}>{inspectorOpen ? 'Replier' : 'Ouvrir'}</button>
            </div>
            {inspectorOpen ? (
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
            <div className="mb-3 flex gap-2 text-xs">
              <button type="button" className={rightMode === 'block' ? 'text-brass' : 'text-muted'} onClick={() => setRightMode('block')}>Section</button>
              <button type="button" className={rightMode === 'identity' ? 'text-brass' : 'text-muted'} onClick={() => setRightMode('identity')}>Identité</button>
            </div>
            {rightMode === 'identity' ? <IdentityPanel project={project} onChange={(next) => commit(touch(next))} /> : page && block ? (
              <Inspector
                project={project}
                pageId={page.id}
                block={block}
                elementKey={elementKey}
                viewport={viewport}
                nodeIds={nodeIds}
                commit={commit}
                onElement={setElementKey}
                onNodes={setNodeIds}
                onReplay={(id) => frame.current?.contentWindow?.postMessage({ type: 'atelier-replay', id }, '*')}
              />
            ) : (
              <div className="grid gap-3">
                <p className="text-sm text-muted">Sélectionnez une section dans l’aperçu ou dans les calques. Le logo, le favicon et le fond du site sont dans Identité.</p>
                <IdentityPanel project={project} onChange={(next) => commit(touch(next))} />
              </div>
            )}
            </div>
            ) : null}
          </aside>
        ) : null}
      </div>
      <div className="flex gap-2 border-t border-line p-2 lg:hidden">
        <Button size="sm" variant="quiet" onClick={() => setTab('layers')}>Calques</Button>
        <Button size="sm" variant="quiet" onClick={() => setPreview((value) => !value)}>{preview ? 'Éditer' : 'Aperçu'}</Button>
      </div>
      <Modal open={issuesOpen} onOpenChange={setIssuesOpen} title="Exporter le site">
        <ul className="grid gap-2 text-sm">
          {issues.length === 0 ? <li>Aucun avertissement. Le ZIP contient le site statique, le SEO et le mode d’emploi.</li> : null}
          {issues.map((issue) => (
            <li key={issue.message} className={issue.level === 'error' ? 'text-danger' : 'text-brass'}>
              {issue.level === 'error' ? 'Bloquant. ' : 'À savoir. '}
              {issue.message}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Déposez le dossier décompressé sur Netlify Drop, Cloudflare Pages ou GitHub Pages. L’adresse obtenue est la démo à envoyer. Ce n’est pas une URL de cet ordinateur.</p>
        <div className="mt-4 flex gap-2">
          <Button
            disabled={errors.length > 0}
            onClick={async () => {
              const bytes = await zipProject(project)
              const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/zip' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${project.business.name || 'site'}.zip`
              link.click()
              URL.revokeObjectURL(url)
              setIssuesOpen(false)
              toast.success('ZIP téléchargé')
            }}
          >
            Télécharger le ZIP
          </Button>
          <Button variant="quiet" onClick={() => setIssuesOpen(false)}>Fermer</Button>
        </div>
      </Modal>
    </div>
  )
}

function Device({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cn('px-2 py-1', active && 'text-brass')}>
      {icon}
    </button>
  )
}

function Layer({
  block,
  active,
  onSelect,
  onHide,
  onDuplicate,
  onDelete,
}: {
  block: Block
  active: boolean
  onSelect: () => void
  onHide: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const sortable = useSortable({ id: block.id })
  const name = getBlockDefinition(block.type).name
  return (
    <li
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      className={cn('rounded-lg border px-2 py-1', active ? 'border-brass' : 'border-line', !block.visible && 'opacity-40')}
    >
      <div className="flex items-center gap-1">
        <button type="button" className="cursor-grab px-1 text-muted" aria-label="Déplacer" {...sortable.attributes} {...sortable.listeners}>⋮⋮</button>
        <button type="button" className="flex-1 truncate text-left text-sm" onClick={onSelect}>{name}</button>
        <button type="button" className="text-muted" aria-label={block.visible ? 'Masquer' : 'Afficher'} onClick={onHide}>{block.visible ? <EyeOff size={14} /> : <Eye size={14} />}</button>
        <button type="button" className="text-muted" aria-label="Dupliquer" onClick={onDuplicate}><Copy size={14} /></button>
        <button type="button" className="text-danger" aria-label="Supprimer" onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </li>
  )
}

function Pages({
  project,
  pageId,
  commit,
  setPageId,
}: {
  project: Project
  pageId: string
  commit: (project: Project) => void
  setPageId: (id: string) => void
}) {
  const [title, setTitle] = useState('Nouvelle page')
  return (
    <div className="grid gap-2">
      {project.pages.map((page) => (
        <div key={page.id} className={cn('rounded-lg border p-2', page.id === pageId ? 'border-brass' : 'border-line')}>
          <button type="button" className="text-sm" onClick={() => setPageId(page.id)}>{page.navLabel || page.title}</button>
          <p className="text-xs text-muted">/{page.slug === 'index' ? '' : page.slug}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => commit(makeHome(project, page.id))}>Accueil</button>
            <button type="button" onClick={() => commit(removePage(project, page.id))}>Supprimer</button>
          </div>
        </div>
      ))}
      <Input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Titre de la nouvelle page" />
      <Button
        size="sm"
        onClick={() => {
          const next = addPage(project, title)
          commit(next)
          setPageId(next.pages.at(-1)?.id ?? pageId)
        }}
      >
        Ajouter une page
      </Button>
    </div>
  )
}

function makeHome(project: Project, pageId: string): Project {
  const home = project.pages.find((page) => page.slug === 'index')
  const page = project.pages.find((item) => item.id === pageId)
  if (!home || !page || home.id === page.id) return project
  const previous = home.slug
  const nextSlug = page.slug
  return touch({
    ...project,
    pages: project.pages.map((item) => {
      if (item.id === home.id) return { ...item, slug: nextSlug }
      if (item.id === page.id) return { ...item, slug: previous }
      return item
    }),
  })
}

function Media({
  project,
  commit,
  pageId,
  blockId,
  elementKey,
}: {
  project: Project
  commit: (project: Project) => void
  pageId?: string
  blockId?: string
  elementKey: string
}) {
  return (
    <div className="grid gap-2">
      <label className="text-xs text-muted">
        Importer dans la bibliothèque
        <input
          className="mt-1 block w-full text-xs"
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const src = await fileToDataUrl(file)
            commit(touch({ ...project, library: [src, ...(project.library ?? [])].slice(0, 24) }))
          }}
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(project.library ?? []).map((src) => (
          <button
            key={src.slice(0, 48)}
            type="button"
            className="overflow-hidden rounded-md border border-line"
            onClick={() => {
              if (!pageId || !blockId) return
              const key = elementKey || 'image'
              commit(setField(project, pageId, blockId, key, src))
            }}
          >
            <img src={src} alt="" className="h-16 w-full object-cover" />
          </button>
        ))}
      </div>
      {(project.library ?? []).length === 0 ? <p className="text-xs text-muted">Aucune image importée.</p> : null}
    </div>
  )
}

function Inspector({
  project,
  pageId,
  block,
  elementKey,
  viewport,
  nodeIds,
  commit,
  onElement,
  onNodes,
  onReplay,
}: {
  project: Project
  pageId: string
  block: Block
  elementKey: string
  viewport: Viewport
  nodeIds: string[]
  commit: (project: Project) => void
  onElement: (key: string) => void
  onNodes: (ids: string[]) => void
  onReplay: (id: string) => void
}) {
  const definition = getBlockDefinition(block.type)
  const style = block.elements?.[elementKey]?.[viewport] ?? {}
  const patchStyle = (patch: ElementStyle) => commit(setElementStyle(project, pageId, block.id, elementKey, viewport, patch))
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-brass">{definition.name}</p>
        <p className="text-xs text-muted">{definition.description}</p>
      </div>
      <label className="grid gap-1 text-xs text-muted">
        Variante
        <Select
          value={block.variant}
          onChange={(event) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, variant: event.target.value })))}
        >
          {definition.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>{variant.label}</option>
          ))}
        </Select>
      </label>
      <Toggle checked={block.visible} onCheckedChange={(visible) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, visible })))} label="Section visible" />
      <SectionBackdrop
        backdrop={block.backdrop}
        onChange={(backdrop: SiteBackdrop) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, backdrop: backdrop.src ? backdrop : emptyBackdrop() })))}
      />
      <label className="grid gap-1 text-xs text-muted">
        Animation
        <Select value={block.reveal} onChange={(event) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, reveal: event.target.value as Block['reveal'] })))}>
          <option value="inherit">Style du site</option>
          <option value="none">Aucune</option>
          <option value="fade">Fondu</option>
          <option value="slide">Glissement</option>
          <option value="zoom">Zoom</option>
        </Select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs text-muted">Durée
          <Input value={block.anim?.duration ?? '0.7s'} onChange={(event) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, anim: { ...current.anim, duration: event.target.value } })))} />
        </label>
        <label className="grid gap-1 text-xs text-muted">Délai
          <Input value={block.anim?.delay ?? '0s'} onChange={(event) => commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, anim: { ...current.anim, delay: event.target.value } })))} />
        </label>
      </div>
      {elementKey ? (
        <div className="grid gap-2 rounded-xl border border-line p-2">
          <p className="text-xs text-brass">Élément « {elementKey} » · {viewport === 'desktop' ? 'ordinateur' : viewport === 'tablet' ? 'tablette' : 'mobile'}</p>
          {elementKey in block.data.fields ? (
            <Textarea value={block.data.fields[elementKey] ?? ''} onChange={(event) => commit(setField(project, pageId, block.id, elementKey, event.target.value))} />
          ) : null}
          <StyleInputs style={style} onChange={patchStyle} />
          <p className="text-[11px] text-muted">Les réglages tablette et mobile ne modifient pas l’ordinateur. Ils s’appliquent sous 1024 px et 760 px.</p>
        </div>
      ) : (
        <p className="text-xs text-muted">Cliquez un titre, un bouton ou une image dans l’aperçu pour régler sa typographie, sa couleur et sa taille.</p>
      )}
      {definition.fields.map((field) => (
        <label key={field.key} className="grid gap-1 text-xs text-muted">
          <button type="button" className="text-left" onClick={() => onElement(field.key)}>{field.label}</button>
          {field.control === 'textarea' ? (
            <Textarea value={block.data.fields[field.key] ?? ''} onChange={(event) => commit(setField(project, pageId, block.id, field.key, event.target.value))} />
          ) : field.control === 'image' ? (
            <span className="grid gap-2">
              <input type="file" accept="image/*" onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const url = await fileToDataUrl(file)
                commit(updateBlock(project, pageId, block.id, (current) => ({
                  ...current,
                  data: { ...current.data, fields: { ...current.data.fields, [field.key]: url } },
                  imageFrames: { ...current.imageFrames, [field.key]: { original: url, crop: null, focal: { x: 50, y: 50 } } },
                })))
              }} />
              {(block.data.fields[field.key] || block.imageFrames?.[field.key]) ? (
                <ImageFrameButton
                  src={block.imageFrames?.[field.key]?.original || block.data.fields[field.key] || ''}
                  adjust={block.imageFrames?.[field.key]}
                  viewport={viewport}
                  onChange={(adjust) => commit(updateBlock(project, pageId, block.id, (current) => ({
                    ...current,
                    imageFrames: { ...current.imageFrames, [field.key]: adjust },
                  })))}
                />
              ) : (
                <Button size="sm" variant="quiet" type="button" onClick={() => {
                  const url = trialImage()
                  commit(updateBlock(project, pageId, block.id, (current) => ({
                    ...current,
                    data: { ...current.data, fields: { ...current.data.fields, [field.key]: url } },
                    imageFrames: { ...current.imageFrames, [field.key]: { original: url, crop: null, focal: { x: 50, y: 50 } } },
                  })))
                }}>Image d’essai</Button>
              )}
            </span>
          ) : (
            <Input value={block.data.fields[field.key] ?? ''} onChange={(event) => commit(setField(project, pageId, block.id, field.key, event.target.value))} />
          )}
        </label>
      ))}
      <FreePanel
        project={project}
        pageId={pageId}
        blockId={block.id}
        nodes={block.freeNodes ?? []}
        layoutMode={block.layoutMode ?? 'flow'}
        hideFlow={Boolean(block.hideFlow)}
        viewport={viewport}
        selectedIds={nodeIds}
        commit={commit}
        onSelect={onNodes}
      />
      <MotionPanel
        spec={nodeIds.length === 1 ? (block.freeNodes ?? []).find((node) => node.id === nodeIds[0])?.motion ?? null : elementKey ? block.motions?.[elementKey] ?? null : block.motionSpec}
        onChange={(spec) => {
          if (nodeIds.length) {
            commit(updateBlock(project, pageId, block.id, (current) => ({
              ...current,
              freeNodes: current.freeNodes.map((node) => nodeIds.includes(node.id) ? { ...node, motion: spec } : node),
            })))
            return
          }
          if (elementKey) {
            commit(updateBlock(project, pageId, block.id, (current) => {
              const motions = { ...current.motions }
              if (spec) motions[elementKey] = spec
              else delete motions[elementKey]
              return { ...current, motions }
            }))
            return
          }
          commit(updateBlock(project, pageId, block.id, (current) => ({ ...current, motionSpec: spec })))
        }}
        onReplay={() => onReplay(nodeIds[0] || (elementKey ? `${block.id}:${elementKey}` : block.id))}
      />
      <SiteStyle project={project} commit={commit} />
      <details>
        <summary className="cursor-pointer text-sm">Connexions</summary>
        <ul className="mt-2 grid gap-2">
          {CONNECTORS.map((item) => (
            <li key={item.id} className="text-xs">
              <span className="text-brass">{connectorStatusLabel(item.status)}. </span>
              {item.name} — {item.summary}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function FontUpload({ project, commit }: { project: Project; commit: (project: Project) => void }) {
  const [family, setFamily] = useState('')
  const [allowed, setAllowed] = useState(false)
  return (
    <div className="grid gap-2 rounded-xl border border-line p-2">
      <p className="text-xs text-muted">Importez un fichier woff2, woff, ttf ou otf. Il est enregistré dans ce navigateur et embarqué dans le ZIP.</p>
      <Input value={family} placeholder="Nom de la police" aria-label="Nom de la police" onChange={(event) => setFamily(event.target.value)} />
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" checked={allowed} onChange={(event) => setAllowed(event.target.checked)} />
        Je confirme avoir le droit d’utiliser cette police sur le site du client.
      </label>
      <input
        type="file"
        accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
        disabled={!allowed || !family.trim()}
        aria-label="Fichier de police"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const format = fontFormat(file.name)
          if (!format) return
          const dataUrl = await readFont(file, format)
          commit(touch({
            ...project,
            fonts: [...(project.fonts ?? []), { id: `font-${Math.random().toString(36).slice(2, 8)}`, family: family.trim(), fileName: file.name, format, dataUrl }],
          }))
          setFamily('')
          setAllowed(false)
        }}
      />
    </div>
  )
}

async function readFont(file: File, format: 'woff2' | 'woff' | 'truetype' | 'opentype'): Promise<string> {
  const mime = format === 'woff2' ? 'font/woff2' : format === 'woff' ? 'font/woff' : format === 'opentype' ? 'font/otf' : 'font/ttf'
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return `data:${mime};base64,${btoa(binary)}`
}

function trialImage(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const gradient = ctx.createLinearGradient(0, 0, 640, 800)
  gradient.addColorStop(0, '#d7b07a')
  gradient.addColorStop(0.5, '#8fbfa8')
  gradient.addColorStop(1, '#1c3830')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 640, 800)
  ctx.fillStyle = '#fffaf3'
  ctx.font = '64px serif'
  ctx.fillText('Atelier', 48, 180)
  return canvas.toDataURL('image/jpeg', 0.85)
}

function StyleInputs({ style, onChange }: { style: ElementStyle; onChange: (patch: ElementStyle) => void }) {
  const row = (key: keyof ElementStyle, label: string, placeholder: string) => (
    <label key={key} className="grid gap-1 text-xs text-muted">
      {label}
      <Input value={style[key] ?? ''} placeholder={placeholder} onChange={(event) => onChange({ [key]: event.target.value })} />
    </label>
  )
  return (
    <div className="grid gap-2">
      {row('fontSize', 'Taille', '2.4rem')}
      {row('color', 'Couleur', '#1c1712')}
      {row('fontWeight', 'Graisse', '600')}
      {row('textAlign', 'Alignement', 'center')}
      {row('letterSpacing', 'Approche', '0.04em')}
      {row('lineHeight', 'Interligne', '1.1')}
      {row('width', 'Largeur', '80%')}
      {row('background', 'Fond', '#ffffff')}
      {row('radius', 'Rayon', '16px')}
    </div>
  )
}

function SiteStyle({ project, commit }: { project: Project; commit: (project: Project) => void }) {
  return (
    <div className="grid gap-2 border-t border-line pt-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">Style du site</p>
      <Select value={project.styleId} onChange={(event) => commit(setStyle(project, event.target.value as Project['styleId']))} aria-label="Univers">
        {STYLES.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}
      </Select>
      <Select value={project.paletteId ?? ''} onChange={(event) => commit(setPalette(project, event.target.value || null))} aria-label="Palette">
        <option value="">Couleurs de l’univers</option>
        {PALETTES.map((palette) => <option key={palette.id} value={palette.id}>{palette.name}</option>)}
      </Select>
      <Select value={project.fontPairId ?? ''} onChange={(event) => commit(setFontPair(project, event.target.value || null))} aria-label="Polices">
        <option value="">Polices de l’univers</option>
        {FONT_PAIRS.map((pair) => <option key={pair.id} value={pair.id}>{pair.name}</option>)}
      </Select>
      <label className="grid gap-1 text-xs text-muted">
        Police du site
        <Select
          aria-label="Police importée"
          value=""
          onChange={(event) => {
            const font = (project.fonts ?? []).find((item) => item.id === event.target.value)
            if (!font) return
            const family = `"${safeFamily(font.family)}", sans-serif`
            commit(touch({ ...project, fontPairId: null, tokens: { ...project.tokens, fontHeading: font.family, fontHeadingCss: family, fontBody: font.family, fontBodyCss: family } }))
          }}
        >
          <option value="">Choisir une police importée</option>
          {(project.fonts ?? []).map((font) => <option key={font.id} value={font.id}>{font.family}</option>)}
        </Select>
      </label>
      <FontUpload project={project} commit={commit} />
      <label className="grid gap-1 text-xs text-muted">
        Couleur principale
        <Input value={project.tokens.primary} onChange={(event) => commit(setTokenColor(project, 'primary', event.target.value))} />
      </label>
      <label className="flex items-center justify-between text-sm">
        Installable (PWA)
        <input type="checkbox" checked={project.pwa} onChange={(event) => commit(touch({ ...project, pwa: event.target.checked }))} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        E-mail du formulaire
        <Input value={project.business.email} onChange={(event) => commit(touch({ ...project, business: { ...project.business, email: event.target.value } }))} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Boutique
        <Select value={project.shop} onChange={(event) => commit(touch({ ...project, shop: event.target.value as Project['shop'] }))}>
          <option value="none">Pas de boutique</option>
          <option value="mini">Mini-boutique (WhatsApp, e-mail, lien)</option>
          <option value="full">Panier chiffré, paiement externe seulement</option>
        </Select>
      </label>
      {project.shop !== 'none' ? (
        <p className="text-xs text-muted">Le site calcule un total. Il n’affiche jamais un paiement réussi. Le règlement se fait par le lien ou le message que vous avez choisi.</p>
      ) : null}
    </div>
  )
}
