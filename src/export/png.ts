const FONT: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 14],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [31, 4, 4, 4, 4, 4, 31],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14],
  '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 6, 8, 16, 31],
  '3': [30, 1, 1, 14, 1, 1, 30],
  '4': [2, 6, 10, 18, 31, 2, 2],
  '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [6, 8, 16, 30, 17, 17, 14],
  '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 2, 12],
}

export function monogramPng(size: number, background: string, foreground: string, letter: string): Uint8Array {
  const bg = rgb(background, [20, 20, 20])
  const fg = rgb(foreground, [255, 255, 255])
  const pixels = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      pixels[i] = bg[0]
      pixels[i + 1] = bg[1]
      pixels[i + 2] = bg[2]
      pixels[i + 3] = 255
    }
  }
  const glyph = FONT[letter.toUpperCase()] ?? FONT.A
  const scale = Math.max(1, Math.floor(size / 14))
  const glyphW = 5 * scale
  const glyphH = 7 * scale
  const ox = Math.floor((size - glyphW) / 2)
  const oy = Math.floor((size - glyphH) / 2)
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if (((glyph[row] >> (4 - col)) & 1) === 0) continue
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const x = ox + col * scale + dx
          const y = oy + row * scale + dy
          if (x < 0 || y < 0 || x >= size || y >= size) continue
          const i = (y * size + x) * 4
          pixels[i] = fg[0]
          pixels[i + 1] = fg[1]
          pixels[i + 2] = fg[2]
          pixels[i + 3] = 255
        }
      }
    }
  }
  return encodePng(size, size, pixels)
}

function rgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!match) return fallback
  const value = match[1]
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function encodePng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const raw = new Uint8Array(height * (1 + width * 4))
  for (let y = 0; y < height; y += 1) {
    const row = y * (1 + width * 4)
    raw[row] = 0
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), row + 1)
  }
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8
  ihdr[9] = 6
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const idat = chunk('IDAT', zlibStore(raw))
  const parts = [signature, chunk('IHDR', ihdr), idat, chunk('IEND', new Uint8Array())]
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function zlibStore(data: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = []
  let offset = 0
  while (offset < data.length) {
    const take = Math.min(65535, data.length - offset)
    const final = offset + take >= data.length
    const block = new Uint8Array(5 + take)
    block[0] = final ? 1 : 0
    block[1] = take & 255
    block[2] = (take >> 8) & 255
    const nlen = take ^ 65535
    block[3] = nlen & 255
    block[4] = (nlen >> 8) & 255
    block.set(data.subarray(offset, offset + take), 5)
    chunks.push(block)
    offset += take
  }
  const adler = adler32(data)
  const bodyLen = chunks.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(2 + bodyLen + 4)
  out[0] = 0x78
  out[1] = 0x01
  let cursor = 2
  for (const part of chunks) {
    out.set(part, cursor)
    cursor += part.length
  }
  const tail = new DataView(out.buffer)
  tail.setUint32(cursor, adler)
  return out
}

function adler32(data: Uint8Array): number {
  let a = 1
  let b = 0
  for (let i = 0; i < data.length; i += 1) {
    a = (a + data[i]) % 65521
    b = (b + a) % 65521
  }
  return ((b << 16) | a) >>> 0
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  out[4] = type.charCodeAt(0)
  out[5] = type.charCodeAt(1)
  out[6] = type.charCodeAt(2)
  out[7] = type.charCodeAt(3)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

function crc32(data: Uint8Array): number {
  let c = ~0
  for (let i = 0; i < data.length; i += 1) {
    c ^= data[i]
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return ~c >>> 0
}
