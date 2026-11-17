import { ArrayBufferTarget, Muxer } from 'mp4-muxer'
import { attachCues, type AudioCue } from './recordVideo'
import { applyFade, renderMusic } from '../domain/music'

export async function exportH264(options: {
  canvas: HTMLCanvasElement
  duration: number
  draw: (time: number) => void
  musicId: string
  musicDataUrl: string
  volume: number
  fade: number
  cues: AudioCue[]
  onProgress?: (ratio: number) => void
}): Promise<Blob | null> {
  if (typeof VideoEncoder === 'undefined' || typeof AudioEncoder === 'undefined') return null
  const width = options.canvas.width - (options.canvas.width % 2)
  const height = options.canvas.height - (options.canvas.height % 2)
  const videoOk = await VideoEncoder.isConfigSupported({ codec: 'avc1.42001f', width, height, bitrate: 2_500_000, framerate: 30 })
  const audioOk = await AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 96000 })
  if (!videoOk.supported || !audioOk.supported) return null
  const fps = 30
  const frames = Math.max(1, Math.round(options.duration * fps))
  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
    video: { codec: 'avc', width, height, frameRate: fps },
    audio: { codec: 'opus', numberOfChannels: 2, sampleRate: 48000 },
  })
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: () => undefined,
  })
  videoEncoder.configure({ codec: 'avc1.42001f', width, height, bitrate: 2_500_000, framerate: 30, avc: { format: 'avc' } })
  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: () => undefined,
  })
  audioEncoder.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 96000 })
  for (let index = 0; index < frames; index += 1) {
    options.draw(index / fps)
    const frame = new VideoFrame(options.canvas, { timestamp: Math.round((index / fps) * 1_000_000) })
    videoEncoder.encode(frame, { keyFrame: index % 30 === 0 })
    frame.close()
    options.onProgress?.(index / frames)
  }
  const audio = await mixOffline(options)
  if (audio) await encodeAudio(audioEncoder, audio)
  await videoEncoder.flush()
  await audioEncoder.flush()
  muxer.finalize()
  return new Blob([target.buffer], { type: 'video/mp4' })
}

async function mixOffline(options: { duration: number; musicId: string; musicDataUrl: string; volume: number; fade: number; cues: AudioCue[] }): Promise<AudioBuffer | null> {
  if (typeof OfflineAudioContext === 'undefined') return null
  const sampleRate = 48000
  const context = new OfflineAudioContext(2, Math.max(1, Math.ceil(options.duration * sampleRate)), sampleRate)
  const music = context.createGain()
  music.connect(context.destination)
  if (options.musicDataUrl) {
    try {
      const decoded = await context.decodeAudioData(await (await fetch(options.musicDataUrl)).arrayBuffer())
      const source = context.createBufferSource()
      source.buffer = decoded
      source.loop = true
      source.connect(music)
      source.start(0)
    } catch { /* musique illisible */ }
  } else if (options.musicId !== 'none') {
    const pcm = applyFade(renderMusic(options.musicId, options.duration), 22050, options.fade, 1)
    const buffer = context.createBuffer(1, pcm.length, 22050)
    buffer.getChannelData(0).set(pcm)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(music)
    source.start(0)
  }
  music.gain.setValueAtTime(0, 0)
  music.gain.linearRampToValueAtTime(options.volume, Math.max(0.05, options.fade))
  music.gain.setValueAtTime(options.volume, Math.max(options.fade, options.duration - options.fade))
  music.gain.linearRampToValueAtTime(0, options.duration)
  await attachCues(context, context.destination, options.cues, 0)
  return context.startRendering()
}

async function encodeAudio(encoder: AudioEncoder, audio: AudioBuffer): Promise<void> {
  const rate = 48000
  const channels = 2
  const frame = 960
  const left = audio.getChannelData(0)
  const right = audio.numberOfChannels > 1 ? audio.getChannelData(1) : left
  for (let offset = 0; offset < left.length; offset += frame) {
    const count = Math.min(frame, left.length - offset)
    const planar = new Float32Array(count * channels)
    for (let index = 0; index < count; index += 1) {
      planar[index] = left[offset + index] || 0
      planar[count + index] = right[offset + index] || 0
    }
    const data = new AudioData({
      format: 'f32-planar',
      sampleRate: rate,
      numberOfFrames: count,
      numberOfChannels: channels,
      timestamp: Math.round((offset / audio.sampleRate) * 1_000_000),
      data: planar,
    })
    encoder.encode(data)
    data.close()
  }
}
