export const GALERY_STYLES = [
  'TRADICIONAL',
  'JAPONES',
  'BLACKWORK',
  'FINELINE',
  'NEOTRADICIONAL',
  'CHICANO',
  'REALISMO',
  'MINIMALISTA',
] as const;

export type GaleryStyle = (typeof GALERY_STYLES)[number];

const STYLE_LABELS: Record<GaleryStyle, string> = {
  TRADICIONAL: 'Tradicional',
  JAPONES: 'Japonês',
  BLACKWORK: 'Blackwork',
  FINELINE: 'Fineline',
  NEOTRADICIONAL: 'Neotradicional',
  CHICANO: 'Chicano',
  REALISMO: 'Realismo',
  MINIMALISTA: 'Minimalista',
};

const STYLE_BADGE_CLASSES: Record<GaleryStyle, string> = {
  TRADICIONAL: 'bg-orange-900/90 text-orange-100',
  JAPONES: 'bg-sky-900/90 text-sky-100',
  BLACKWORK: 'bg-neutral-800/90 text-neutral-100',
  FINELINE: 'bg-amber-900/90 text-amber-100',
  NEOTRADICIONAL: 'bg-purple-900/90 text-purple-100',
  CHICANO: 'bg-rose-900/90 text-rose-100',
  REALISMO: 'bg-emerald-900/90 text-emerald-100',
  MINIMALISTA: 'bg-zinc-700/90 text-zinc-100',
};

export function isGaleryStyle(value: unknown): value is GaleryStyle {
  return typeof value === 'string' && (GALERY_STYLES as readonly string[]).includes(value);
}

export function formatGaleryStyle(style: GaleryStyle) {
  return STYLE_LABELS[style];
}

export function galeryStyleBadgeClass(style: GaleryStyle) {
  return STYLE_BADGE_CLASSES[style];
}
