import { hashString } from "./hash";

export interface TagColor {
  bg: string;
  text: string;
}

export interface TagGradient {
  /** Three radial-gradient stop colors, keyed to the tag's mood. */
  stops: [string, string, string];
}

const TAG_COLORS: TagColor[] = [
  { bg: "var(--color-violet-bg)", text: "var(--color-violet-text)" },
  { bg: "var(--color-peach-bg)", text: "var(--color-peach-text)" },
  { bg: "var(--color-teal-bg)", text: "var(--color-teal-text)" },
  { bg: "var(--color-rose-bg)", text: "var(--color-rose-text)" },
  { bg: "var(--color-sky-bg)", text: "var(--color-sky-text)" },
  { bg: "var(--color-gold-bg)", text: "var(--color-gold-text)" },
];

const TAG_GRADIENTS: TagGradient[] = [
  { stops: ["#C9B8F5", "#F2C3DC", "#B9D9F0"] },
  { stops: ["#F7C9A8", "#F3B9B5", "#E9D6A6"] },
  { stops: ["#A8D9CC", "#D6C6F2", "#C3E2DC"] },
  { stops: ["#F2C3DC", "#F7C9A8", "#E9BEEA"] },
  { stops: ["#B9D9F0", "#C9B8F5", "#A8D9CC"] },
  { stops: ["#E9D6A6", "#F7C9A8", "#F2C3DC"] },
];

const DEFAULT_GRADIENT: TagGradient = { stops: ["#D6C6F2", "#C3E2DC", "#F2C3DC"] };

/** Deterministic color per tag so a tag always renders the same hue. */
export function tagColor(tag: string): TagColor {
  return TAG_COLORS[hashString(tag) % TAG_COLORS.length];
}

/** Deterministic background gradient per tag, so the page mood matches the fact. */
export function tagGradient(tag: string | undefined): TagGradient {
  if (!tag) return DEFAULT_GRADIENT;
  return TAG_GRADIENTS[hashString(tag) % TAG_GRADIENTS.length];
}
