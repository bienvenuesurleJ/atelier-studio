import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MUSIC_TRACKS } from '@/domain/music'
import type { Project, PromoVideo, VideoFormat, VideoTemplate } from '@/domain/types'
import { VIDEO_TEMPLATES, collectImages, createVideo, frameSize, totalDuration } from '@/domain/video'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import { drawFrame } from '@/studio/videoDraw'
import { recordCanvas } from '@/studio/recordVideo'

export function VideoStudio({
  project,
  onChange,
  onBack,
}: {
  project: Project
  onChange: (project: Project) => void
  onBack: () => void
}) {
  const videos = project.videos ?? []
  const [currentId, setCurrentId] = useState(videos[0]?.id ?? '')
  const video = videos.find((item) => item.id === currentId) ?? null
  const [sceneId, setSceneId] = useState(video?.scenes[0]?.id ?? '')
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [exporting, setExporting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const images = useRef(new Map<string, HTMLImageElement>())
  const scene = video?.scenes.find((item) => item.id === sceneId) ?? video?.scenes[0]
  const size = frameSize(video?.format ?? '9:16')
  const duration = video ? totalDuration(video.scenes) : 0

  useEffect(() => {
    const urls = new Set<string>()
    video?.scenes.forEach((item) => item.image && urls.add(item.image))
    urls.forEach((url) => {
      if (images.current.has(url)) return
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = url
      images.current.set(url, image)
    })
  }, [video])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawFrame(ctx, project, video, time, { images: images.current })
  }, [project, video, time, size.width, size.height])

  useEffect(() => {
    if (!playing || !video) return
    let frame = 0
    const started = performance.now() - time * 1000
    const tick = (now: number) => {
      const next = Math.min(duration, (now - started) / 1000)
      setTime(next)
      if (next < duration) frame = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, video, duration])

  const library = useMemo(() => collectImages(project), [project])

  const save = (next: PromoVideo) => {
    onChange({
      ...project,
      videos: (project.videos ?? []).map((item) => (item.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : item)),
    })
  }

  const make = (template: VideoTemplate) => {
    const created = createVideo(project, template, video?.format ?? '9:16')
    onChange({ ...project, videos: [created, ...(project.videos ?? [])] })
    setCurrentId(created.id)
    setSceneId(created.scenes[0]?.id ?? '')
    setTime(0)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Projet</Button>
        <h1 className="font-serif text-2xl">Vidéo</h1>
        <span className="text-xs text-muted">{project.business.name}</span>
        <div className="ml-auto flex gap-2">
          <Button variant="quiet" size="sm" onClick={() => { setPlaying((value) => !value) }} disabled={!video}>{playing ? 'Pause' : 'Lire'}</Button>
          <Button size="sm" disabled={!video || exporting} onClick={() => video && void exportVideo(canvasRef.current, project, video, setExporting)}>
            {exporting ? 'Export…' : 'Exporter'}
          </Button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="min-h-0 overflow-auto border-r border-line p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-brass">Modèles</p>
          <div className="mt-2 grid gap-2">
            {VIDEO_TEMPLATES.map((item) => (
              <button key={item.id} type="button" className="rounded-xl border border-line px-3 py-2 text-left hover:border-brass" onClick={() => make(item.id)}>
                <span className="block text-sm">{item.name}</span>
                <span className="block text-xs text-muted">{item.detail}</span>
              </button>
            ))}
          </div>
          {video ? (
            <label className="mt-4 grid gap-1 text-xs text-muted">
              Format
              <Select value={video.format} onChange={(event) => save({ ...video, format: event.target.value as VideoFormat })}>
                <option value="9:16">9:16 · TikTok, Reels, Shorts</option>
                <option value="1:1">1:1 · fil d’actualité</option>
                <option value="16:9">16:9 · YouTube, site</option>
              </Select>
            </label>
          ) : null}
          <ul className="mt-4 grid gap-1">
            {video?.scenes.map((item, index) => (
              <li key={item.id}>
                <button type="button" className={`w-full rounded-lg px-2 py-1 text-left text-sm ${item.id === scene?.id ? 'bg-paper-2 text-brass' : ''}`} onClick={() => { setSceneId(item.id); setTime(startOf(video, index)) }}>
                  {index + 1}. {item.title || 'Scène'} · {item.duration.toFixed(1)}s
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="grid min-h-0 place-items-center overflow-auto bg-[#090807] p-4">
          <canvas ref={canvasRef} width={size.width} height={size.height} className="max-h-[78vh] max-w-full rounded-xl shadow-2xl" style={{ aspectRatio: `${size.width} / ${size.height}` }} />
          <input className="mt-3 w-full max-w-md" type="range" min={0} max={duration || 1} step={0.05} value={Math.min(time, duration)} aria-label="Tête de lecture" onChange={(event) => { setPlaying(false); setTime(Number(event.target.value)) }} />
        </div>
        <aside className="min-h-0 overflow-auto border-l border-line p-3">
          {!video || !scene ? <p className="text-sm text-muted">Choisissez un modèle. Les textes, photos et couleurs viennent du projet.</p> : (
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs text-muted">Titre
                <Input value={scene.title} onChange={(event) => patchScene(video, scene.id, { title: event.target.value }, save)} />
              </label>
              <label className="grid gap-1 text-xs text-muted">Texte
                <Textarea value={scene.text} onChange={(event) => patchScene(video, scene.id, { text: event.target.value }, save)} />
              </label>
              <label className="grid gap-1 text-xs text-muted">Durée (secondes)
                <Input type="number" min={0.8} max={12} step={0.1} value={scene.duration} onChange={(event) => patchScene(video, scene.id, { duration: Number(event.target.value) || 1 }, save)} />
              </label>
              <label className="grid gap-1 text-xs text-muted">Transition
                <Select value={scene.transition} onChange={(event) => patchScene(video, scene.id, { transition: event.target.value as PromoVideo['scenes'][number]['transition'] }, save)}>
                  <option value="fade">Fondu</option>
                  <option value="slide">Glissement</option>
                  <option value="zoom">Zoom</option>
                  <option value="kenburns">Ken Burns</option>
                  <option value="mask">Masque</option>
                </Select>
              </label>
              <label className="grid gap-1 text-xs text-muted">Texte animé
                <Select value={scene.textAnim} onChange={(event) => patchScene(video, scene.id, { textAnim: event.target.value as PromoVideo['scenes'][number]['textAnim'] }, save)}>
                  <option value="rise">Montée</option>
                  <option value="fade">Fondu</option>
                  <option value="type">Frappe</option>
                  <option value="none">Fixe</option>
                </Select>
              </label>
              <label className="grid gap-1 text-xs text-muted">Image de la scène
                <Select value={scene.image} onChange={(event) => patchScene(video, scene.id, { image: event.target.value }, save)}>
                  <option value="">Sans photo</option>
                  {library.map((url) => <option key={url.slice(0, 48)} value={url}>Photo du projet</option>)}
                </Select>
              </label>
              <label className="grid gap-1 text-xs text-muted">Appel final
                <Input value={video.cta} onChange={(event) => save({ ...video, cta: event.target.value })} />
              </label>
              <label className="grid gap-1 text-xs text-muted">Musique
                <Select value={video.musicId} onChange={(event) => {
                  const track = MUSIC_TRACKS.find((item) => item.id === event.target.value)
                  save({ ...video, musicId: event.target.value, musicName: track?.name ?? 'Fichier', musicDataUrl: event.target.value === 'upload' ? video.musicDataUrl : '' })
                }}>
                  {MUSIC_TRACKS.map((track) => <option key={track.id} value={track.id}>{track.name} · CC0</option>)}
                  <option value="upload">Fichier personnel</option>
                  <option value="none">Silence</option>
                </Select>
              </label>
              <p className="text-[11px] text-muted">{MUSIC_TRACKS.find((track) => track.id === video.musicId)?.credit ?? 'Le fichier reste dans ce navigateur et dans la vidéo exportée.'}</p>
              {video.musicId === 'upload' ? (
                <input type="file" accept="audio/*" aria-label="Importer une musique" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => save({ ...video, musicDataUrl: String(reader.result), musicName: file.name })
                  reader.readAsDataURL(file)
                }} />
              ) : null}
              <label className="grid gap-1 text-xs text-muted">Volume {Math.round(video.musicVolume * 100)} %
                <input type="range" min={0} max={1} step={0.05} value={video.musicVolume} onChange={(event) => save({ ...video, musicVolume: Number(event.target.value) })} />
              </label>
              <label className="grid gap-1 text-xs text-muted">Fondu (secondes)
                <Input type="number" min={0} max={3} step={0.1} value={video.musicFade} onChange={(event) => save({ ...video, musicFade: Number(event.target.value) || 0 })} />
              </label>
              <p className="text-[11px] text-muted">L’export utilise l’enregistreur du navigateur : MP4 s’il est proposé, sinon WebM. Aucun service d’IA, aucun logiciel externe.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function patchScene(video: PromoVideo, id: string, patch: Partial<PromoVideo['scenes'][number]>, save: (video: PromoVideo) => void) {
  save({ ...video, scenes: video.scenes.map((scene) => scene.id === id ? { ...scene, ...patch } : scene) })
}

function startOf(video: PromoVideo, index: number): number {
  return video.scenes.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0)
}

async function exportVideo(
  canvas: HTMLCanvasElement | null,
  project: Project,
  video: PromoVideo,
  setExporting: (value: boolean) => void,
) {
  if (!canvas) return
  setExporting(true)
  try {
    const images = new Map<string, HTMLImageElement>()
    await Promise.all(video.scenes.map(async (scene) => {
      if (!scene.image || images.has(scene.image)) return
      const image = await loadImage(scene.image)
      images.set(scene.image, image)
    }))
    const duration = totalDuration(video.scenes)
    const result = await recordCanvas({
      canvas,
      duration,
      draw: (time) => {
        const ctx = canvas.getContext('2d')
        if (ctx) drawFrame(ctx, project, video, time, { images })
      },
      musicId: video.musicId,
      musicDataUrl: video.musicDataUrl,
      volume: video.musicVolume,
      fade: video.musicFade,
    })
    const url = URL.createObjectURL(result.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.business.name || 'video'}-${video.format.replace(':', 'x')}.${result.extension}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(result.extension === 'mp4' ? 'MP4 téléchargé' : 'WebM téléchargé (MP4 non proposé par ce navigateur)')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Export impossible')
  } finally {
    setExporting(false)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Une image de la vidéo n’a pas pu être lue.'))
    image.src = src
  })
}
