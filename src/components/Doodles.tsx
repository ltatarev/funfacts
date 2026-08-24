import type { CSSProperties } from 'react'

interface DoodleProps {
  className?: string
  style?: CSSProperties
}

/** Loose, hand-drawn-style decorative marks. Purely ornamental — always aria-hidden. */

export function Sparkle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M20 2c1 7 2 11 18 18-16 7-17 11-18 18-1-7-2-11-18-18C18 13 19 9 20 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Star({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M20 4c1.2 5.8 3 10 6 13 3 3 7.4 4.8 13 6-5.6 1.2-10 3-13 6-3 3-4.8 7.4-6 13-1.2-5.6-3-10-6-13-3-3-7.4-4.8-13-6 5.6-1.2 10-3 13-6 3-3 4.8-7.2 6-13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Squiggle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 20" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M2 14c8-14 16-14 24 0s16 14 24 0 16-14 24 0 16 14 24 0 16-14 20-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Ring({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M20 4c9.6 0 17 6.7 16.9 16-.1 8.4-7.8 15.7-17.4 15.9C10.6 36.1 3.4 29 3.1 20 2.8 11 10.2 3.9 20 4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Plus({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M20 6v28M6 20h28" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}

export function Zigzag({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 24" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M2 4 14 20 26 4 38 20 50 4 58 14"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
