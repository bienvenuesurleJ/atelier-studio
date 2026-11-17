import type { DesignTokens, MotionSettings, StyleId } from './types'

export interface StyleDefinition {
  id: StyleId
  name: string
  tagline: string
  tokens: DesignTokens
  motion: MotionSettings
}

export interface Palette {
  id: string
  name: string
  bg: string
  surface: string
  text: string
  muted: string
  primary: string
  accent: string
  border: string
}

export interface FontPair {
  id: string
  name: string
  heading: string
  body: string
  headingCss: string
  bodyCss: string
  googleQuery: string
}

const q = (query: string) => query

export const STYLES: StyleDefinition[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Beaucoup d’air, une typographie nette, presque rien d’autre.',
    tokens: {
      bg: '#ffffff',
      surface: '#f5f5f2',
      text: '#161616',
      muted: '#5c5c58',
      primary: '#161616',
      accent: '#8a8a84',
      border: '#e4e4e0',
      radius: '0px',
      shadow: 'none',
      fontHeading: 'Newsreader',
      fontBody: 'Outfit',
      fontHeadingCss: '"Newsreader", Georgia, serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Newsreader:opsz,wght@6..72,500;6..72,650&family=Outfit:wght@400;500;600'),
      spacing: 'airy',
      buttonRadius: '0px',
      headingWeight: 500,
      tracking: '-0.03em',
    },
    motion: baseMotion({ reveal: 'fade', hover: 'none', buttonMicro: true }),
  },
  {
    id: 'luxe',
    name: 'Luxe',
    tagline: 'Crème, sérif et filets dorés. Pour une maison qui prend son temps.',
    tokens: {
      bg: '#f6f1e7',
      surface: '#fffaf3',
      text: '#1c1612',
      muted: '#6d5c4c',
      primary: '#8a6232',
      accent: '#b08958',
      border: '#e4d5c0',
      radius: '2px',
      shadow: '0 18px 40px rgba(70, 46, 20, 0.06)',
      fontHeading: 'Playfair Display',
      fontBody: 'Outfit',
      fontHeadingCss: '"Playfair Display", Georgia, serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Outfit:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,650;1,500'),
      spacing: 'airy',
      buttonRadius: '0px',
      headingWeight: 500,
      tracking: '-0.02em',
    },
    motion: baseMotion({ reveal: 'slide', parallax: true, hover: 'lift' }),
  },
  {
    id: 'moderne',
    name: 'Moderne',
    tagline: 'Grotesk, coins doux, rythme de startup sans le bruit.',
    tokens: {
      bg: '#f7f8fb',
      surface: '#ffffff',
      text: '#101828',
      muted: '#526077',
      primary: '#2454d6',
      accent: '#12a594',
      border: '#e4e8f0',
      radius: '18px',
      shadow: '0 16px 40px rgba(16, 24, 40, 0.08)',
      fontHeading: 'Space Grotesk',
      fontBody: 'Outfit',
      fontHeadingCss: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Outfit:wght@400;500;600&family=Space+Grotesk:wght@500;600;700'),
      spacing: 'regular',
      buttonRadius: '999px',
      headingWeight: 600,
      tracking: '-0.04em',
    },
    motion: baseMotion({ reveal: 'slide', hover: 'lift', buttonMicro: true }),
  },
  {
    id: 'glass',
    name: 'Verre',
    tagline: 'Panneaux translucides, flou et lumière colorée.',
    tokens: {
      bg: '#eef2ff',
      surface: '#ffffff',
      text: '#1a1b3a',
      muted: '#55577a',
      primary: '#5b4dff',
      accent: '#ff6b9a',
      border: '#dddff5',
      radius: '24px',
      shadow: '0 20px 50px rgba(70, 60, 160, 0.12)',
      fontHeading: 'Manrope',
      fontBody: 'Manrope',
      fontHeadingCss: '"Manrope", ui-sans-serif, system-ui, sans-serif',
      fontBodyCss: '"Manrope", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Manrope:wght@400;500;600;700'),
      spacing: 'regular',
      buttonRadius: '18px',
      headingWeight: 650,
      tracking: '-0.04em',
    },
    motion: baseMotion({ reveal: 'fade', parallax: true, hover: 'glow', gradient: true }),
  },
  {
    id: 'brutal',
    name: 'Néobrutalisme',
    tagline: 'Traits noirs, ombre décalée, jaune franc.',
    tokens: {
      bg: '#fffdf6',
      surface: '#ffffff',
      text: '#111111',
      muted: '#3f3f3f',
      primary: '#ffd000',
      accent: '#ff4d4d',
      border: '#111111',
      radius: '0px',
      shadow: '6px 6px 0 #111111',
      fontHeading: 'Space Grotesk',
      fontBody: 'Outfit',
      fontHeadingCss: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Outfit:wght@400;500;600&family=Space+Grotesk:wght@500;700'),
      spacing: 'compact',
      buttonRadius: '0px',
      headingWeight: 700,
      tracking: '-0.04em',
    },
    motion: baseMotion({ reveal: 'zoom', hover: 'none', buttonMicro: true, pageTransition: false }),
  },
  {
    id: 'neon',
    name: 'Nuit néon',
    tagline: 'Fond sombre, lueurs cyan et magenta.',
    tokens: {
      bg: '#070712',
      surface: '#12121f',
      text: '#f4f4ff',
      muted: '#a7a7c7',
      primary: '#2de2c5',
      accent: '#ff3d8a',
      border: '#2a2a44',
      radius: '14px',
      shadow: '0 0 32px rgba(45, 226, 197, 0.18)',
      fontHeading: 'Syne',
      fontBody: 'Outfit',
      fontHeadingCss: '"Syne", ui-sans-serif, system-ui, sans-serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Outfit:wght@400;500;600&family=Syne:wght@500;700;800'),
      spacing: 'regular',
      buttonRadius: '12px',
      headingWeight: 750,
      tracking: '-0.04em',
    },
    motion: baseMotion({ reveal: 'fade', hover: 'glow', gradient: true, typing: true }),
  },
  {
    id: 'retro',
    name: 'Rétro',
    tagline: 'Papier chaud, terracotta, caractère d’imprimerie.',
    tokens: {
      bg: '#f3e2c7',
      surface: '#fff6ea',
      text: '#3b2416',
      muted: '#7a5340',
      primary: '#c4491d',
      accent: '#2f5d50',
      border: '#e2c7a8',
      radius: '10px',
      shadow: '0 10px 0 rgba(59, 36, 22, 0.06)',
      fontHeading: 'Fraunces',
      fontBody: 'Outfit',
      fontHeadingCss: '"Fraunces", Georgia, serif',
      fontBodyCss: '"Outfit", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600'),
      spacing: 'regular',
      buttonRadius: '999px',
      headingWeight: 560,
      tracking: '-0.03em',
    },
    motion: baseMotion({ reveal: 'slide', hover: 'lift' }),
  },
  {
    id: 'nature',
    name: 'Nature',
    tagline: 'Sauge, crème et formes souples.',
    tokens: {
      bg: '#f3f6ef',
      surface: '#ffffff',
      text: '#1e2b22',
      muted: '#55685a',
      primary: '#3d6b4a',
      accent: '#c0844a',
      border: '#d7e3d4',
      radius: '22px',
      shadow: '0 16px 36px rgba(40, 70, 48, 0.08)',
      fontHeading: 'Fraunces',
      fontBody: 'Nunito Sans',
      fontHeadingCss: '"Fraunces", Georgia, serif',
      fontBodyCss: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Nunito+Sans:wght@400;600;700'),
      spacing: 'regular',
      buttonRadius: '999px',
      headingWeight: 560,
      tracking: '-0.03em',
    },
    motion: baseMotion({ reveal: 'fade', parallax: true, hover: 'lift' }),
  },
  {
    id: 'corporate',
    name: 'Corporate',
    tagline: 'Marine, grille stricte, confiance immédiate.',
    tokens: {
      bg: '#f4f6f8',
      surface: '#ffffff',
      text: '#0f2744',
      muted: '#52657c',
      primary: '#0b3a82',
      accent: '#b45309',
      border: '#d9e1ea',
      radius: '6px',
      shadow: '0 10px 24px rgba(15, 39, 68, 0.06)',
      fontHeading: 'Source Serif 4',
      fontBody: 'Source Sans 3',
      fontHeadingCss: '"Source Serif 4", Georgia, serif',
      fontBodyCss: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,560;8..60,680'),
      spacing: 'compact',
      buttonRadius: '6px',
      headingWeight: 640,
      tracking: '-0.02em',
    },
    motion: baseMotion({ reveal: 'fade', hover: 'none', scrollProgress: true, pageTransition: false }),
  },
  {
    id: 'playful',
    name: 'Joueur',
    tagline: 'Couleurs franches, rondeurs, énergie de boutique.',
    tokens: {
      bg: '#fff6f1',
      surface: '#ffffff',
      text: '#2a1940',
      muted: '#6b5678',
      primary: '#ff4f8b',
      accent: '#6d5efc',
      border: '#ffd7e6',
      radius: '28px',
      shadow: '0 16px 30px rgba(255, 79, 139, 0.12)',
      fontHeading: 'Nunito',
      fontBody: 'Nunito',
      fontHeadingCss: '"Nunito", ui-sans-serif, system-ui, sans-serif',
      fontBodyCss: '"Nunito", ui-sans-serif, system-ui, sans-serif',
      googleQuery: q('family=Nunito:wght@500;700;800'),
      spacing: 'regular',
      buttonRadius: '999px',
      headingWeight: 800,
      tracking: '-0.03em',
    },
    motion: baseMotion({ reveal: 'zoom', hover: 'lift', buttonMicro: true, gradient: true }),
  },
]

export const PALETTES: Palette[] = [
  { id: 'encre-cuivre', name: 'Encre & cuivre', bg: '#f7f3ec', surface: '#fffdf8', text: '#1c1712', muted: '#6d6256', primary: '#b85a2a', accent: '#234237', border: '#e4d8c8' },
  { id: 'sauge', name: 'Sauge & crème', bg: '#f4f7f2', surface: '#ffffff', text: '#1c2a22', muted: '#5d6e63', primary: '#3e6b4e', accent: '#c4a36a', border: '#d5e2d6' },
  { id: 'nuit-or', name: 'Nuit & or', bg: '#100e0c', surface: '#1b1814', text: '#f6f0e6', muted: '#cbbfae', primary: '#d4b483', accent: '#efe6d6', border: '#3a332b' },
  { id: 'ocean', name: 'Océan', bg: '#f3f7fb', surface: '#ffffff', text: '#102033', muted: '#53657a', primary: '#0e6e8a', accent: '#e07a3d', border: '#d5e2ee' },
  { id: 'terracotta', name: 'Terracotta', bg: '#fbf4ef', surface: '#fffaf7', text: '#3a241c', muted: '#7d5b4d', primary: '#c25b3a', accent: '#2f4f46', border: '#efd9cc' },
  { id: 'noir-blanc', name: 'Noir & blanc', bg: '#ffffff', surface: '#f4f4f4', text: '#111111', muted: '#5a5a5a', primary: '#111111', accent: '#6b6b6b', border: '#e5e5e5' },
  { id: 'rose', name: 'Rose poudré', bg: '#fdf6f7', surface: '#ffffff', text: '#2c1c24', muted: '#7a6270', primary: '#b55274', accent: '#d4a373', border: '#f0dbe2' },
  { id: 'bleu-roi', name: 'Bleu roi', bg: '#f5f7fb', surface: '#ffffff', text: '#0e1c38', muted: '#54627d', primary: '#1d3f8f', accent: '#e2b15a', border: '#dbe2f0' },
  { id: 'foret', name: 'Forêt', bg: '#f2f5f1', surface: '#fbfcf9', text: '#17241b', muted: '#5a6b5e', primary: '#1f4d34', accent: '#c47b3a', border: '#d5e0d6' },
  { id: 'soleil', name: 'Soleil', bg: '#fffaf0', surface: '#ffffff', text: '#2b2112', muted: '#75664d', primary: '#e39b12', accent: '#1f6f6a', border: '#f0e2c4' },
]

export const FONT_PAIRS: FontPair[] = [
  { id: 'classique', name: 'Classique', heading: 'Playfair Display', body: 'Source Sans 3', headingCss: '"Playfair Display", Georgia, serif', bodyCss: '"Source Sans 3", ui-sans-serif, sans-serif', googleQuery: 'family=Playfair+Display:ital,wght@0,500;0,650;1,500&family=Source+Sans+3:wght@400;600;700' },
  { id: 'moderne', name: 'Moderne', heading: 'Space Grotesk', body: 'Outfit', headingCss: '"Space Grotesk", ui-sans-serif, sans-serif', bodyCss: '"Outfit", ui-sans-serif, sans-serif', googleQuery: 'family=Outfit:wght@400;500;600&family=Space+Grotesk:wght@500;700' },
  { id: 'editorial', name: 'Éditorial', heading: 'Fraunces', body: 'Outfit', headingCss: '"Fraunces", Georgia, serif', bodyCss: '"Outfit", ui-sans-serif, sans-serif', googleQuery: 'family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600' },
  { id: 'neutre', name: 'Neutre', heading: 'Outfit', body: 'Outfit', headingCss: '"Outfit", ui-sans-serif, sans-serif', bodyCss: '"Outfit", ui-sans-serif, sans-serif', googleQuery: 'family=Outfit:wght@400;500;600;700' },
  { id: 'rond', name: 'Arrondi', heading: 'Nunito', body: 'Nunito', headingCss: '"Nunito", ui-sans-serif, sans-serif', bodyCss: '"Nunito", ui-sans-serif, sans-serif', googleQuery: 'family=Nunito:wght@500;700;800' },
]

export function findStyle(id: StyleId): StyleDefinition {
  return STYLES.find((style) => style.id === id) ?? STYLES[0]
}

export function findPalette(id: string | null): Palette | undefined {
  return PALETTES.find((palette) => palette.id === id)
}

export function findFontPair(id: string | null): FontPair | undefined {
  return FONT_PAIRS.find((pair) => pair.id === id)
}

export function applyPalette(tokens: DesignTokens, palette: Palette): DesignTokens {
  return {
    ...tokens,
    bg: palette.bg,
    surface: palette.surface,
    text: palette.text,
    muted: palette.muted,
    primary: palette.primary,
    accent: palette.accent,
    border: palette.border,
  }
}

export function applyFontPair(tokens: DesignTokens, pair: FontPair): DesignTokens {
  return {
    ...tokens,
    fontHeading: pair.heading,
    fontBody: pair.body,
    fontHeadingCss: pair.headingCss,
    fontBodyCss: pair.bodyCss,
    googleQuery: pair.googleQuery,
  }
}

export function tokensFor(styleId: StyleId, paletteId: string | null, fontPairId: string | null): DesignTokens {
  let tokens = { ...findStyle(styleId).tokens }
  const palette = findPalette(paletteId)
  const pair = findFontPair(fontPairId)
  if (palette) tokens = applyPalette(tokens, palette)
  if (pair) tokens = applyFontPair(tokens, pair)
  return tokens
}

function baseMotion(patch: Partial<MotionSettings>): MotionSettings {
  return {
    reveal: 'slide',
    parallax: false,
    hover: 'lift',
    gradient: false,
    typing: false,
    pageTransition: true,
    counters: true,
    scrollProgress: true,
    buttonMicro: true,
    carouselAutoplay: false,
    ...patch,
  }
}
