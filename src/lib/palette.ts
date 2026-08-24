import { hashString } from './hash'

export interface TagColor {
  bg: string
  text: string
  border: string
}

const TAG_COLORS: TagColor[] = [
  { bg: '#ffe1f2', text: '#c2136d', border: '#ff3ea5' },
  { bg: '#e9e0ff', text: '#5b21b6', border: '#7c3aed' },
  { bg: '#dcf3ff', text: '#0369a1', border: '#38bdf8' },
  { bg: '#fff3c4', text: '#8a5a00', border: '#ffd23f' },
  { bg: '#ffe1d6', text: '#c2410c', border: '#ff6b4a' },
  { bg: '#d3fbec', text: '#0f7a5c', border: '#2dd4a7' },
]

/** Deterministic color per tag so a tag always renders the same hue. */
export function tagColor(tag: string): TagColor {
  return TAG_COLORS[hashString(tag) % TAG_COLORS.length]
}
