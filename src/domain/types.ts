export const DATA_VERSION = 1 as const

export type ProjectKind =
  | 'vitrine'
  | 'landing'
  | 'multipage'
  | 'portfolio'
  | 'restaurant'
  | 'booking'
  | 'eshop'
  | 'blog'
  | 'agence'
  | 'pwa-loyalty'
  | 'pwa-menu'
  | 'pwa-booking'
  | 'pwa-linkinbio'
  | 'pwa-catalog'
  | 'pwa-event'

export type BusinessType =
  | 'restaurant'
  | 'coiffeur'
  | 'artisan'
  | 'coach'
  | 'boutique'
  | 'liberal'
  | 'generic'

export type StyleId =
  | 'minimal'
  | 'luxe'
  | 'moderne'
  | 'glass'
  | 'brutal'
  | 'neon'
  | 'retro'
  | 'nature'
  | 'corporate'
  | 'playful'

export type BlockType =
  | 'hero'
  | 'features'
  | 'services'
  | 'pricing'
  | 'menu'
  | 'testimonials'
  | 'team'
  | 'gallery'
  | 'timeline'
  | 'stats'
  | 'faq'
  | 'cta'
  | 'contact'
  | 'map'
  | 'hours'
  | 'newsletter'
  | 'logos'
  | 'about'
  | 'booking'
  | 'catalog'
  | 'blog'
  | 'portfolio'
  | 'video'
  | 'carousel'
  | 'loyalty'
  | 'links'
  | 'text'
  | 'steps'
  | 'footer'

export type RevealKind = 'none' | 'fade' | 'slide' | 'zoom'
export type HoverKind = 'none' | 'lift' | 'glow'
export type Spacing = 'compact' | 'regular' | 'airy'
export type HeaderVariant = 'bar' | 'center' | 'overlay'
export type FormMode = 'mailto' | 'formspree' | 'endpoint'
export type OrderMode = 'none' | 'whatsapp' | 'email' | 'link'
export type ProspectStatus =
  | 'nouveau'
  | 'a-contacter'
  | 'contacte'
  | 'interesse'
  | 'devis'
  | 'negociation'
  | 'client'
  | 'refuse'

export type ProjectStatus = 'draft' | 'active' | 'done' | 'published' | 'archived'

export type ShopMode = 'none' | 'mini' | 'full'

export type Viewport = 'desktop' | 'tablet' | 'mobile'

export interface ElementStyle {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  color?: string
  textAlign?: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: string
  opacity?: string
  maxWidth?: string
  margin?: string
  padding?: string
  background?: string
  radius?: string
  border?: string
  shadow?: string
  width?: string
  height?: string
}

export interface ElementOverride {
  desktop?: ElementStyle
  tablet?: ElementStyle
  mobile?: ElementStyle
  hidden?: boolean
  locked?: boolean
}

export interface BlockAnim {
  duration: string
  delay: string
}

export type LayoutMode = 'flow' | 'free'
export type FreeKind = 'text' | 'image' | 'button' | 'shape' | 'container' | 'grid' | 'divider'
export type NodeLayout = 'free' | 'grid' | 'stack'
export type AnimTrigger = 'load' | 'scroll' | 'hover' | 'click' | 'scroll-link'
export type AnimEffect =
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'blur'
  | 'rotate'
  | 'flip'
  | 'tilt'
  | 'letters'
  | 'words'
  | 'mask'
  | 'stagger'
  | 'parallax'
  | 'marquee'
  | 'gradient'
export type AnimEase = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring'
export type AnimDirection = 'up' | 'down' | 'left' | 'right'

export interface FreeBox {
  x: number
  y: number
  w: number
  h: number
  r: number
  z: number
}

export interface AnimSpec {
  trigger: AnimTrigger
  effect: AnimEffect
  duration: number
  delay: number
  easing: AnimEase
  distance: number
  intensity: number
  repeat: number
  stagger: number
  direction: AnimDirection
  desktop: boolean
  tablet: boolean
  mobile: boolean
  stiffness?: number
  damping?: number
  mass?: number
}

export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

export interface FocalPoint {
  x: number
  y: number
}

export interface ImageAdjust {
  original: string
  crop: CropRect | null
  focal: FocalPoint
  focalTablet?: FocalPoint
  focalMobile?: FocalPoint
}

export interface StudioFont {
  id: string
  family: string
  fileName: string
  format: 'woff2' | 'woff' | 'truetype' | 'opentype'
  dataUrl: string
}

export type VideoFormat = '9:16' | '1:1' | '16:9'
export type VideoTemplate = 'boutique' | 'promo' | 'produit' | 'avis' | 'menu' | 'evenement'
export type VideoTransition = 'fade' | 'slide' | 'zoom' | 'kenburns' | 'mask'
export type VideoTextAnim = 'none' | 'fade' | 'rise' | 'type'

export interface VideoScene {
  id: string
  title: string
  text: string
  image: string
  duration: number
  transition: VideoTransition
  textAnim: VideoTextAnim
}

export interface PromoVideo {
  id: string
  name: string
  template: VideoTemplate
  format: VideoFormat
  scenes: VideoScene[]
  musicId: string
  musicName: string
  musicDataUrl: string
  musicVolume: number
  musicFade: number
  cta: string
  updatedAt: string
}

export interface FreeNode {
  id: string
  parentId: string | null
  kind: FreeKind
  name: string
  text: string
  href: string
  src: string
  alt: string
  locked: boolean
  hidden: boolean
  layout: NodeLayout
  columns: number
  gap: number
  box: { desktop: FreeBox; tablet?: FreeBox; mobile?: FreeBox }
  style: ElementStyle
  styleTablet?: ElementStyle
  styleMobile?: ElementStyle
  motion: AnimSpec | null
  image?: ImageAdjust
}

export interface DesignTokens {
  bg: string
  surface: string
  text: string
  muted: string
  primary: string
  accent: string
  border: string
  radius: string
  shadow: string
  fontHeading: string
  fontBody: string
  fontHeadingCss: string
  fontBodyCss: string
  googleQuery: string
  spacing: Spacing
  buttonRadius: string
  headingWeight: number
  tracking: string
}

export interface MotionSettings {
  reveal: RevealKind
  parallax: boolean
  hover: HoverKind
  gradient: boolean
  typing: boolean
  pageTransition: boolean
  counters: boolean
  scrollProgress: boolean
  buttonMicro: boolean
  carouselAutoplay: boolean
}

export interface DayHours {
  day: string
  closed: boolean
  slots: { open: string; close: string }[]
}

export interface BusinessInfo {
  name: string
  tagline: string
  city: string
  address: string
  postalCode: string
  phone: string
  email: string
  whatsapp: string
  instagram: string
  facebook: string
  categoryLabel: string
  schemaType: string
  priceRange: string
  hours: DayHours[]
  siret: string
  legalName: string
}

export interface SeoSettings {
  title: string
  description: string
  canonicalBase: string
  ogImage: string
}

export interface ContactFormSettings {
  mode: FormMode
  formspreeId: string
  endpoint: string
  subject: string
}

export interface OrderingSettings {
  mode: OrderMode
  paymentLink: string
  note: string
}

export interface ChromeSettings {
  announcement: string
  ctaLabel: string
  ctaHref: string
  showPhone: boolean
  headerVariant: HeaderVariant
}

export interface ListItem {
  id: string
  fields: Record<string, string>
}

export interface BlockData {
  fields: Record<string, string>
  lists: Record<string, ListItem[]>
}

export interface SiteBackdrop {
  src: string
  position: string
  overlay: string
  opacity: number
  parallax: boolean
}

export interface BlockLayout {
  align: 'inherit' | 'start' | 'center' | 'end'
  pad: 'inherit' | 'sm' | 'md' | 'lg'
  bg: 'inherit' | 'default' | 'surface' | 'primary' | 'accent'
  width: 'inherit' | 'narrow' | 'default' | 'full'
}

export interface Block {
  id: string
  type: BlockType
  variant: string
  visible: boolean
  reveal: 'inherit' | RevealKind
  layout: BlockLayout
  data: BlockData
  elements: Record<string, ElementOverride>
  anim: BlockAnim
  layoutMode: LayoutMode
  hideFlow: boolean
  freeNodes: FreeNode[]
  motionSpec: AnimSpec | null
  motions: Record<string, AnimSpec>
  imageFrames: Record<string, ImageAdjust>
  backdrop?: SiteBackdrop
}

export interface Page {
  id: string
  slug: string
  title: string
  navLabel: string
  showInNav: boolean
  description: string
  blocks: Block[]
}

export interface Project {
  id: string
  version: typeof DATA_VERSION
  name: string
  kind: ProjectKind
  businessType: BusinessType
  styleId: StyleId
  paletteId: string | null
  fontPairId: string | null
  tokens: DesignTokens
  motion: MotionSettings
  business: BusinessInfo
  seo: SeoSettings
  contactForm: ContactFormSettings
  ordering: OrderingSettings
  chrome: ChromeSettings
  pwa: boolean
  pwaName: string
  pwaShortName: string
  logo: string
  logoSize: number
  favicon: string
  backdrop: SiteBackdrop
  clientName: string
  status: ProjectStatus
  shop: ShopMode
  taxRate: number
  shippingFlat: number
  library: string[]
  fonts: StudioFont[]
  videos: PromoVideo[]
  pages: Page[]
  createdAt: string
  updatedAt: string
}

export interface Prospect {
  id: string
  businessName: string
  contactName: string
  activity: string
  address: string
  website: string
  city: string
  phone: string
  email: string
  channel: string
  status: ProspectStatus
  offer: string
  price: string
  budget: string
  notes: string
  nextStep: string
  contactDate: string
  followUpDate: string
  history: { at: string; text: string }[]
  updatedAt: string
}

export interface QuoteLine {
  id: string
  label: string
  qty: number
  unitPrice: number
}

export interface Quote {
  id: string
  number: string
  prospectId: string
  projectId: string
  title: string
  lines: QuoteLine[]
  conditions: string
  validUntil: string
  status: 'draft' | 'sent' | 'accepted' | 'refused'
  createdAt: string
}

export interface MaintenancePlan {
  id: string
  clientName: string
  projectId: string
  offer: string
  price: number
  start: string
  renewal: string
  notes: string
  active: boolean
}

export interface RateCard {
  base: number
  perPage: number
  design: number
  shop: number
  pwa: number
  seo: number
  monthly: number
  costEstimate: number
}

export interface AgencyProfile {
  name: string
  owner: string
  email: string
  phone: string
  address: string
  siret: string
}

export interface StudioState {
  version: typeof DATA_VERSION
  projects: Project[]
  prospects: Prospect[]
  quotes: Quote[]
  plans: MaintenancePlan[]
  checklist: Record<string, boolean>
  agency: AgencyProfile
  rates: RateCard
}

export interface FieldSchema {
  key: string
  label: string
  control: 'text' | 'textarea' | 'image' | 'url' | 'select'
  options?: { value: string; label: string }[]
  placeholder?: string
  hint?: string
}

export interface ListSchema {
  key: string
  label: string
  itemLabel: string
  fields: FieldSchema[]
}

export interface TemplateContext {
  kind: ProjectKind
  businessType: BusinessType
  name: string
  city: string
  phone: string
  email: string
  address: string
  postalCode: string
}
