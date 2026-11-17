import { applyFade, renderMusic } from '../domain/music'

export interface RecordingResult {
  blob: Blob
  mime: string
  extension: 'mp4' | 'webm'
}

export interface AudioCue {
  media: string
  start: number
  duration: number
  trimIn: number
  volume: number
  muted: boolean
}

export async function recordCanvas(options: {
  canvas: HTMLCanvasElement
  duration: number
  draw: (time: number) => void
  musicId: string
  musicDataUrl: string
  volume: number
  fade: number
  cues?: AudioCue[]
  onProgress?: (ratio: number) => void
}): Promise<RecordingResult> {
  const { canvas, duration, draw } = options
  const stream = canvas.captureStream(30)
  const audioContext = new AudioContext()
  const destination = audioContext.createMediaStreamDestination()
  const gain = audioContext.createGain()
  gain.connect(destination)
  await attachMusic(audioContext, gain, options.musicId, options.musicDataUrl, duration, options.volume, options.fade)
  await attachCues(audioContext, destination, options.cues ?? [], audioContext.currentTime)
  destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track))
  const mime = pickMime()
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data)
  }
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve()
  })
  draw(0)
  recorder.start(200)
  const started = performance.now()
  await new Promise<void>((resolve) => {
    const tick = () => {
      const time = (performance.now() - started) / 1000
      draw(Math.min(duration, time))
      options.onProgress?.(Math.min(1, time / duration))
      if (time < duration) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
  recorder.stop()
  await stopped
  stream.getTracks().forEach((track) => track.stop())
  await audioContext.close()
  const blob = new Blob(chunks, { type: mime })
  const extension = mime.includes('mp4') ? 'mp4' : 'webm'
  return { blob, mime, extension }
}

function pickMime(): string {
  const candidates = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'video/webm'
}

async function attachMusic(
  context: AudioContext,
  gain: GainNode,
  musicId: string,
  musicDataUrl: string,
  duration: number,
  volume: number,
  fade: number,
): Promise<void> {
  let buffer: AudioBuffer
  if (musicDataUrl) {
    const response = await fetch(musicDataUrl)
    const decoded = await context.decodeAudioData(await response.arrayBuffer())
    buffer = decoded
  } else if (musicId === 'none') {
    buffer = context.createBuffer(1, Math.max(1, Math.floor(duration * context.sampleRate)), context.sampleRate)
  } else {
    const pcm = applyFade(renderMusic(musicId, duration), 22050, fade, 1)
    buffer = context.createBuffer(1, pcm.length, 22050)
    buffer.getChannelData(0).set(pcm)
  }
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const fadeNode = context.createGain()
  const now = context.currentTime
  fadeNode.gain.setValueAtTime(0, now)
  fadeNode.gain.linearRampToValueAtTime(volume, now + Math.max(0.05, fade))
  fadeNode.gain.setValueAtTime(volume, now + Math.max(fade, duration - fade))
  fadeNode.gain.linearRampToValueAtTime(0, now + duration)
  source.connect(fadeNode)
  fadeNode.connect(gain)
  source.start()
}

export async function attachCues(context: BaseAudioContext, destination: AudioNode, cues: AudioCue[], when = 0): Promise<void> {
  for (const cue of cues) {
    if (cue.muted || !cue.media || cue.duration <= 0) continue
    try {
      const response = await fetch(cue.media)
      const decoded = await context.decodeAudioData(await response.arrayBuffer())
      const source = context.createBufferSource()
      source.buffer = decoded
      const gain = context.createGain()
      gain.gain.value = Math.max(0, cue.volume)
      source.connect(gain)
      gain.connect(destination)
      source.start(when + cue.start, Math.max(0, cue.trimIn), cue.duration)
    } catch {
      /* piste sans son décodable */
    }
  }
}
