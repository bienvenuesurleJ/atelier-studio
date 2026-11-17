import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MUSIC_TRACKS } from '@/domain/music'
import type { Project } from '@/domain/types'
import { loadState } from '@/storage/db'
import { frameSize } from '@/domain/video'
import { queueSync, subscribeSync } from '@/sync/controller'
import { recordFilms } from '@/sync/store'
import { loadFilms, saveFilms, touchFilm } from '@/video/db'
import { drawFilm } from '@/video/draw'
import { deleteClip, filmDuration, moveClip, splitClip, trimClip, type Clip, type Film, type FilmLibrary } from '@/video/model'
import { MEDIA_ACCEPT, mediaKindFromFile, mediaTooLarge, placeMedia, readFileAsDataUrl } from '@/video/mediaFile'
import { createFilm, FILM_TEMPLATES } from '@/video/templates'
import { recordCanvas, type AudioCue } from '@/studio/recordVideo'
import { exportH264 } from '@/studio/exportMp4'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'

export function FilmApp({ onSites }: { onSites: () => void }) {
  const [library, setLibrary] = useState<FilmLibrary | null>(null)
  const [filmId, setFilmId] = useState<string | null>(null)
  const film = library?.films.find((item) => item.id === filmId) ?? null

  useEffect(() => {
    loadFilms().then(setLibrary).catch(() => setLibrary({ version: 1, films: [] }))
  }, [])

  const applied = useRef<FilmLibrary | null>(null)
  useEffect(() => subscribeSync((event) => {
    if (event.type !== 'films') return
    setLibrary((current) => {
      if (current && JSON.stringify(current) === JSON.stringify(event.films)) return current
      applied.current = event.films
      return event.films
    })
  }), [])

  useEffect(() => {
    if (!library) return
    const fromRemote = applied.current === library
    applied.current = null
    const timer = window.setTimeout(() => {
      saveFilms(library)
        .then(() => recordFilms(library))
        .then(() => { if (!fromRemote) queueSync() })
        .catch(() => toast.error('La sauvegarde vidéo a échoué.'))
    }, 400)
    return () => window.clearTimeout(timer)
  }, [library])

  if (!library) return <div className="grid h-full place-items-center text-muted">Ouverture de Studio Vidéo…</div>
  if (!film) {
    return <FilmHome library={library} onSites={onSites} onOpen={setFilmId} onCreate={(film) => { setLibrary({ ...library, films: [film, ...library.films] }); setFilmId(film.id) }} onDelete={(id) => setLibrary({ ...library, films: library.films.filter((item) => item.id !== id) })} />
  }
  return (
    <FilmEditor
      film={film}
      onBack={() => setFilmId(null)}
      onChange={(next) => setLibrary({ ...library, films: library.films.map((item) => (item.id === next.id ? touchFilm(next) : item)) })}
    />
  )
}

function FilmHome({
  library,
  onSites,
  onOpen,
  onCreate,
  onDelete,
}: {
  library: FilmLibrary
  onSites: () => void
  onOpen: (id: string) => void
  onCreate: (film: Film) => void
  onDelete: (id: string) => void
}) {
  const [format, setFormat] = useState<'9:16' | '1:1' | '16:9'>('9:16')
  const [sites, setSites] = useState<Project[] | null>(null)
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-brass">Application séparée</p>
          <h1 className="font-serif text-4xl">Studio Vidéo</h1>
          <p className="max-w-xl text-sm text-muted">Des films publicitaires, avec leur propre liste et leur propre enregistrement. Les sites restent à côté.</p>
        </div>
        <Button variant="quiet" onClick={onSites}>Retour aux sites</Button>
      </header>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Format des nouveaux films</span>
        {(['9:16', '1:1', '16:9'] as const).map((item) => (
          <button key={item} type="button" className={`rounded-full border px-3 py-1 ${format === item ? 'border-brass text-brass' : 'border-line'}`} onClick={() => setFormat(item)}>{item}</button>
        ))}
        <Button size="sm" variant="quiet" onClick={() => loadState().then((state) => setSites(state.projects)).catch(() => setSites([]))}>Importer une marque de site</Button>
      </div>
      {sites ? (
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {sites.length === 0 ? <li className="text-sm text-muted">Aucun site dans ce navigateur.</li> : null}
          {sites.map((project) => (
            <li key={project.id}>
              <button type="button" className="w-full rounded-xl border border-line px-3 py-2 text-left hover:border-brass" onClick={() => {
                const film = createFilm('boutique', format)
                film.brand = { name: project.business.name, city: project.business.city, primary: project.tokens.primary, accent: project.tokens.accent, bg: project.tokens.bg, text: project.tokens.text, font: project.tokens.fontHeadingCss }
                film.name = `Film — ${project.business.name}`
                const photo = project.logo
                if (photo) film.tracks = film.tracks.map((track) => track.kind === 'image' ? { ...track, clips: track.clips.map((clip) => ({ ...clip, media: photo, mediaKind: 'image' as const })) } : track)
                onCreate(film)
              }}>
                {project.business.name} · {project.business.city}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <h2 className="mt-8 font-serif text-2xl">Modèles</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FILM_TEMPLATES.map((item) => (
          <li key={item.id}>
            <button type="button" className="h-full w-full rounded-2xl border border-line bg-paper p-4 text-left hover:border-brass" onClick={() => onCreate(createFilm(item.id, format))}>
              <span className="text-xs text-brass">{item.format}</span>
              <span className="mt-1 block font-serif text-2xl">{item.name}</span>
              <span className="mt-1 block text-sm text-muted">{item.detail}</span>
            </button>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Films enregistrés</h2>
      {library.films.length === 0 ? <p className="mt-2 text-sm text-muted">Aucun film pour l’instant. Un modèle suffit pour commencer.</p> : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {library.films.map((film) => (
            <li key={film.id} className="rounded-2xl border border-line p-4">
              <button type="button" className="text-left" onClick={() => onOpen(film.id)}>
                <span className="font-serif text-2xl">{film.name}</span>
                <span className="mt-1 block text-xs text-muted">{film.format} · {film.brand.name}</span>
              </button>
              <div className="mt-3">
        <Button size="sm" variant="danger" onClick={() => onDelete(film.id)}>Supprimer</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FilmEditor({ film, onChange, onBack }: { film: Film; onChange: (film: Film) => void; onBack: () => void }) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState<string | null>(film.tracks.find((track) => track.kind === 'text')?.clips[0]?.id ?? null)
  const [past, setPast] = useState<Film[]>([])
  const [future, setFuture] = useState<Film[]>([])
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mediaError, setMediaError] = useState('')
  const [dropOver, setDropOver] = useState(false)
  const [assetTick, setAssetTick] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const images = useRef(new Map<string, CanvasImageSource>())
  const size = frameSize(film.format)
  const duration = filmDuration(film)
  const clip = film.tracks.flatMap((track) => track.clips).find((item) => item.id === selected) ?? null

  const commit = (next: Film) => {
    setPast((stack) => [...stack.slice(-30), film])
    setFuture([])
    onChange(next)
  }

  const importFile = async (file: File) => {
    const kind = mediaKindFromFile(file)
    if (!kind) {
      setMediaError('Ce fichier n’est pas une photo ni une vidéo. Utilisez JPG, PNG, WebP, MP4, WebM ou MOV.')
      return
    }
    if (mediaTooLarge(file.size)) {
      setMediaError('Fichier trop lourd : 40 Mo maximum.')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const placed = placeMedia(film, selected, dataUrl, kind, time)
      setMediaError('')
      setSelected(placed.clipId)
      commit(placed.film)
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Import impossible.')
    }
  }

  useEffect(() => {
    const urls = [...film.tracks.flatMap((track) => track.clips.map((item) => item.media).filter(Boolean)), film.brand.logo].filter((url): url is string => Boolean(url))
    let pending = false
    for (const url of urls) {
      if (images.current.has(url)) continue
      pending = true
      const videoLike = url.startsWith('data:video') || url.startsWith('blob:')
      if (videoLike) {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.src = url
        video.onloadeddata = () => setAssetTick((value) => value + 1)
        video.onerror = () => setMediaError('Cette vidéo n’est pas lisible ici. Préférez un MP4 ou un WebM.')
        images.current.set(url, video)
      } else {
        const image = new Image()
        image.onload = () => setAssetTick((value) => value + 1)
        image.onerror = () => setMediaError('Cette image n’a pas pu s’afficher.')
        image.src = url
        images.current.set(url, image)
      }
    }
    if (!pending) setAssetTick((value) => value + 1)
  }, [film])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    for (const track of film.tracks) {
      for (const item of track.clips) {
        const source = item.media ? images.current.get(item.media) : undefined
        if (source instanceof HTMLVideoElement && source.readyState >= 2) {
          const target = Math.max(0, item.trimIn + time - item.start)
          if (Math.abs(source.currentTime - target) > 0.25) {
            try { source.currentTime = target } catch { /* navigateur occupé */ }
          }
        }
      }
    }
    drawFilm(ctx, film, time, { images: images.current })
  }, [film, time, size.width, size.height, assetTick])

  useEffect(() => {
    if (!playing) return
    const started = performance.now() - time * 1000
    let frame = 0
    const tick = (now: number) => {
      const next = (now - started) / 1000
      if (next >= duration) { setTime(duration); setPlaying(false); return }
      setTime(next)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, duration])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-line px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Films</Button>
        <input className="min-w-40 bg-transparent font-serif text-xl outline-none" aria-label="Nom du film" value={film.name} onChange={(event) => onChange({ ...film, name: event.target.value })} />
        <Button variant="ghost" size="sm" onClick={() => { const prev = past.at(-1); if (!prev) return; setPast(past.slice(0, -1)); setFuture([film, ...future]); onChange(prev) }}>Annuler</Button>
        <Button variant="ghost" size="sm" onClick={() => { const next = future[0]; if (!next) return; setFuture(future.slice(1)); setPast([...past, film]); onChange(next) }}>Rétablir</Button>
        <Button variant="quiet" size="sm" onClick={() => fileRef.current?.click()}>Importer</Button>
        <input ref={fileRef} className="sr-only" type="file" accept={MEDIA_ACCEPT} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = '' }} />
        <Button variant="quiet" size="sm" onClick={() => setPlaying((value) => !value)}>{playing ? 'Pause' : 'Lire'}</Button>
        <Button size="sm" disabled={exporting} onClick={() => void exportFilm(canvasRef.current, film, setExporting, setProgress)}>Exporter</Button>
      </header>
      {exporting ? <div className="h-1 bg-line"><div className="h-full bg-brass" style={{ width: `${Math.round(progress * 100)}%` }} /></div> : null}
      {mediaError ? <p className="shrink-0 bg-danger/15 px-3 py-2 text-sm text-danger">{mediaError}</p> : null}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.15fr)_minmax(200px,0.85fr)] overflow-hidden lg:grid-rows-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#090807]">
          <div
            className={`relative min-h-0 flex-1 overflow-hidden p-4 ${dropOver ? 'outline outline-2 outline-brass' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDropOver(true) }}
            onDragLeave={() => setDropOver(false)}
            onDrop={(event) => { event.preventDefault(); setDropOver(false); const file = event.dataTransfer.files?.[0]; if (file) void importFile(file) }}
          >
            <canvas ref={canvasRef} width={size.width} height={size.height} className="absolute inset-4 m-auto h-auto max-h-[calc(100%-2rem)] w-auto max-w-[calc(100%-2rem)] rounded-xl shadow-2xl" />
            {dropOver ? <p className="pointer-events-none absolute bottom-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">Déposez pour importer</p> : null}
          </div>
          <Timeline film={film} time={time} selected={selected} onSelect={setSelected} onTime={setTime} onBegin={() => setPast((stack) => [...stack.slice(-30), film])} onChange={onChange} onImport={() => fileRef.current?.click()} />
        </div>
        <aside className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto border-t border-line p-3 lg:border-l lg:border-t-0">
          <label className="grid gap-1 text-xs text-muted">Format
            <Select value={film.format} onChange={(event) => commit({ ...film, format: event.target.value as Film['format'] })}>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
            </Select>
          </label>
          <p className="mt-3 text-xs text-muted">Glissez une photo ou une vidéo sur l’aperçu. Si un plan image ou vidéo est sélectionné, le fichier le remplace.</p>
          {clip ? <ClipForm film={film} clip={clip} commit={commit} onImport={(file) => void importFile(file)} /> : <p className="mt-3 text-sm text-muted">Sélectionnez un plan, ou importez un média pour en créer un.</p>}
          <MusicForm film={film} commit={commit} />
          <SubtitleForm film={film} commit={commit} />
        </aside>
      </div>
    </div>
  )
}

function Timeline({ film, time, selected, onSelect, onTime, onBegin, onChange, onImport }: { film: Film; time: number; selected: string | null; onSelect: (id: string) => void; onTime: (time: number) => void; onBegin: () => void; onChange: (film: Film) => void; onImport: () => void }) {
  const duration = Math.max(filmDuration(film) + 2, 8)
  const px = 78
  const drag = useRef<{ id: string; origin: number; x: number; edge: 'move' | 'start' | 'end' } | null>(null)
  return (
    <div className="border-t border-line bg-paper">
      <div className="flex items-center gap-2 px-3 py-2 text-xs">
        <span className="text-muted">{time.toFixed(1)} s</span>
        <Button size="sm" variant="quiet" onClick={() => selected && onChange(splitClip(film, selected, time))}>Couper</Button>
        <Button size="sm" variant="quiet" onClick={() => selected && onChange(deleteClip(film, selected))}>Retirer</Button>
        <Button size="sm" variant="quiet" onClick={onImport}>Ajouter un média</Button>
      </div>
      <div className="relative max-h-64 overflow-auto" onPointerDown={(event) => { if (event.target === event.currentTarget) onTime(event.nativeEvent.offsetX / px) }}>
        <div style={{ width: duration * px }} className="relative">
          <div className="absolute bottom-0 top-0 w-px bg-brass" style={{ left: time * px }} />
          {film.tracks.map((track) => (
            <div key={track.id} className="relative h-12 border-t border-line">
              <span className="absolute left-1 top-0 text-[10px] uppercase tracking-wider text-muted">{track.name}</span>
              {track.clips.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  className={`absolute top-4 h-7 overflow-hidden rounded-md border px-2 text-left text-[11px] ${selected === clip.id ? 'border-brass bg-brass/20' : 'border-line bg-paper-2'}`}
                  style={{ left: clip.start * px, width: Math.max(28, clip.duration * px) }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    onSelect(clip.id)
                    onBegin()
                    const rect = event.currentTarget.getBoundingClientRect()
                    const edge = event.clientX - rect.left < 8 ? 'start' : rect.right - event.clientX < 8 ? 'end' : 'move'
                    drag.current = { id: clip.id, origin: edge === 'end' ? clip.start + clip.duration : clip.start, x: event.clientX, edge }
                    event.currentTarget.setPointerCapture(event.pointerId)
                  }}
                  onPointerMove={(event) => {
                    if (!drag.current || drag.current.id !== clip.id) return
                    const delta = (event.clientX - drag.current.x) / px
                    if (drag.current.edge === 'move') onChange(moveClip(film, clip.id, drag.current.origin + delta))
                    else onChange(trimClip(film, clip.id, drag.current.edge, drag.current.origin + delta))
                  }}
                  onPointerUp={() => { drag.current = null }}
                >
                  {clip.text || clip.mediaKind || track.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClipForm({ film, clip, commit, onImport }: { film: Film; clip: Clip; commit: (film: Film) => void; onImport: (file: File) => void }) {
  const patch = (partial: Partial<Clip>) => commit({
    ...film,
    tracks: film.tracks.map((track) => ({ ...track, clips: track.clips.map((item) => item.id === clip.id ? { ...item, ...partial } : item) })),
  })
  return (
    <div className="mt-3 grid gap-2">
      <label className="grid gap-1 text-xs text-muted">Texte
        <Input value={clip.text} onChange={(event) => patch({ text: event.target.value })} />
      </label>
      <label className="grid gap-1 text-xs text-muted">Sous-texte
        <Textarea value={clip.subtext} onChange={(event) => patch({ subtext: event.target.value })} />
      </label>
      <label className="grid gap-1 text-xs text-muted">Remplacer la photo ou la vidéo
        <input type="file" accept={MEDIA_ACCEPT} onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onImport(file)
          event.target.value = ''
        }} />
      </label>
      {clip.media.startsWith('data:image') ? <img src={clip.media} alt="" className="h-16 w-full rounded-md object-cover" /> : null}
      {clip.media.startsWith('data:video') ? <p className="text-xs text-forest">Vidéo prête dans ce plan.</p> : null}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={clip.muted} onChange={(event) => patch({ muted: event.target.checked })} /> Couper le son du clip</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={clip.kenBurns} onChange={(event) => patch({ kenBurns: event.target.checked })} /> Ken Burns</label>
      <label className="grid gap-1 text-xs text-muted">Transition
        <Select value={clip.transition} onChange={(event) => patch({ transition: event.target.value as Clip['transition'] })}>
          <option value="fade">Fondu</option>
          <option value="slide">Glissement</option>
          <option value="zoom">Zoom</option>
          <option value="kenburns">Ken Burns</option>
          <option value="mask">Masque</option>
        </Select>
      </label>
      <label className="grid gap-1 text-xs text-muted">Animation du texte
        <Select value={clip.textAnim} onChange={(event) => patch({ textAnim: event.target.value as Clip['textAnim'] })}>
          <option value="rise">Montée</option>
          <option value="fade">Fondu</option>
          <option value="type">Frappe</option>
          <option value="pop">Apparition</option>
          <option value="glisse">Glissé</option>
          <option value="none">Fixe</option>
        </Select>
      </label>
    </div>
  )
}

function MusicForm({ film, commit }: { film: Film; commit: (film: Film) => void }) {
  return (
    <div className="mt-4 grid gap-2 border-t border-line pt-3">
      <label className="grid gap-1 text-xs text-muted">Musique
        <Select value={film.musicId} onChange={(event) => commit({ ...film, musicId: event.target.value })}>
          {MUSIC_TRACKS.map((track) => <option key={track.id} value={track.id}>{track.name} · CC0</option>)}
          <option value="upload">Fichier</option>
          <option value="none">Silence</option>
        </Select>
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={film.musicMuted} onChange={(event) => commit({ ...film, musicMuted: event.target.checked })} /> Couper la musique</label>
      <label className="grid gap-1 text-xs text-muted">Volume
        <input type="range" min={0} max={1} step={0.05} value={film.musicVolume} onChange={(event) => commit({ ...film, musicVolume: Number(event.target.value) })} />
      </label>
      <label className="grid gap-1 text-xs text-muted">Fondu
        <Input type="number" min={0} max={3} step={0.1} value={film.musicFade} onChange={(event) => commit({ ...film, musicFade: Number(event.target.value) || 0 })} />
      </label>
      {film.musicId === 'upload' ? <input type="file" accept="audio/*" onChange={(event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => commit({ ...film, musicDataUrl: String(reader.result) })
        reader.readAsDataURL(file)
      }} /> : <p className="text-[11px] text-muted">{MUSIC_TRACKS.find((track) => track.id === film.musicId)?.credit}</p>}
    </div>
  )
}

function cuesOf(film: Film): AudioCue[] {
  return film.tracks.flatMap((track) => track.clips.filter((clip) => clip.media && (clip.mediaKind === 'video' || clip.media.startsWith('data:audio'))).map((clip) => ({
    media: clip.media,
    start: clip.start,
    duration: clip.duration,
    trimIn: clip.trimIn,
    volume: clip.volume,
    muted: clip.muted,
  })))
}

async function exportFilm(canvas: HTMLCanvasElement | null, film: Film, setExporting: (value: boolean) => void, setProgress: (value: number) => void) {
  if (!canvas) return
  setExporting(true)
  setProgress(0)
  try {
    const images = new Map<string, CanvasImageSource>()
    for (const track of film.tracks) {
      for (const clip of track.clips) {
        if (!clip.media || images.has(clip.media)) continue
        images.set(clip.media, await loadSource(clip.media, clip.mediaKind === 'video'))
      }
    }
    if (film.brand.logo && !images.has(film.brand.logo)) images.set(film.brand.logo, await loadSource(film.brand.logo, false))
    const draw = (time: number) => {
      const ctx = canvas.getContext('2d')
      if (ctx) drawFilm(ctx, film, time, { images })
    }
    const shared = {
      canvas,
      duration: filmDuration(film),
      draw,
      musicId: film.musicMuted ? 'none' : film.musicId,
      musicDataUrl: film.musicMuted ? '' : film.musicDataUrl,
      volume: film.musicVolume,
      fade: film.musicFade,
      cues: cuesOf(film),
      onProgress: setProgress,
    }
    const h264 = await exportH264(shared)
    if (h264) {
      downloadBlob(h264, `${film.name}.mp4`)
      toast.success('MP4 H.264 téléchargé')
      return
    }
    const result = await recordCanvas(shared)
    const url = URL.createObjectURL(result.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${film.name}.${result.extension}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(result.extension === 'mp4' ? 'MP4 téléchargé' : 'Ce navigateur n’encode pas le H.264. Fichier WebM téléchargé.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Export impossible')
  } finally {
    setExporting(false)
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function SubtitleForm({ film, commit }: { film: Film; commit: (film: Film) => void }) {
  const cues = film.subtitles ?? []
  return (
    <div className="mt-4 grid gap-2 border-t border-line pt-3">
      <p className="text-xs text-brass">Sous-titres</p>
      {cues.length === 0 ? <p className="text-xs text-muted">Aucun sous-titre. Ajoutez une ligne, elle apparaît sur l’image.</p> : null}
      {cues.map((cue) => (
        <label key={cue.id} className="grid gap-1 text-xs text-muted">
          <Input value={cue.text} onChange={(event) => commit({ ...film, subtitles: cues.map((item) => item.id === cue.id ? { ...item, text: event.target.value } : item) })} />
          <select className="h-8 rounded-lg border border-line bg-sand px-2" value={cue.style} onChange={(event) => commit({ ...film, subtitles: cues.map((item) => item.id === cue.id ? { ...item, style: event.target.value as 'bas' | 'cinema' | 'bandeau' } : item) })}>
            <option value="bas">Bas</option>
            <option value="cinema">Cinéma</option>
            <option value="bandeau">Bandeau</option>
          </select>
        </label>
      ))}
      <Button size="sm" variant="quiet" onClick={() => commit({ ...film, subtitles: [...cues, { id: `sub-${Math.random().toString(36).slice(2, 6)}`, start: 0.4, duration: 2.4, text: 'Sous-titre', style: 'bas' }] })}>Ajouter un sous-titre</Button>
    </div>
  )
}

function loadSource(src: string, video: boolean): Promise<CanvasImageSource> {
  return new Promise((resolve, reject) => {
    if (video) {
      const element = document.createElement('video')
      element.muted = true
      element.playsInline = true
      element.onloadeddata = () => {
        const done = () => resolve(element)
        element.onseeked = done
        try { element.currentTime = 0.05 } catch { done() }
      }
      element.onerror = () => reject(new Error('Cette vidéo n’est pas lisible. Utilisez un MP4 ou un WebM.'))
      element.src = src
      return
    }
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image illisible'))
    image.src = src
  })
}
