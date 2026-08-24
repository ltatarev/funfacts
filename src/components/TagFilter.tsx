import { forwardRef, useImperativeHandle, useRef } from 'react'
import { TAGS } from '../lib/schema'
import { tagColor } from '../lib/palette'

interface TagFilterProps {
  selected: string[]
  counts: Record<string, number>
  onToggle: (tag: string) => void
}

export interface TagFilterHandle {
  focus: () => void
}

const TagFilter = forwardRef<TagFilterHandle, TagFilterProps>(function TagFilter(
  { selected, counts, onToggle },
  ref,
) {
  const firstEnabledRef = useRef<HTMLButtonElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => firstEnabledRef.current?.focus(),
  }))

  const firstEnabledTag = TAGS.find((tag) => {
    const count = counts[tag] ?? 0
    return count > 0 || selected.includes(tag)
  })

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
      {TAGS.map((tag) => {
        const count = counts[tag] ?? 0
        const isSelected = selected.includes(tag)
        const disabled = count === 0 && !isSelected
        const c = tagColor(tag)

        return (
          <button
            key={tag}
            ref={tag === firstEnabledTag ? firstEnabledRef : undefined}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(tag)}
            aria-pressed={isSelected}
            className={`font-body cursor-pointer rounded-full border-2 px-3 py-1.5 text-xs font-extrabold tracking-wide uppercase transition-all duration-200 hover:-translate-y-0.5 ${
              disabled ? 'cursor-not-allowed opacity-30 hover:translate-y-0' : ''
            }`}
            style={
              isSelected
                ? { background: c.bg, color: c.text, borderColor: c.border }
                : { background: 'transparent', color: 'var(--color-ink-soft)', borderColor: 'color-mix(in srgb, var(--color-ink) 18%, transparent)' }
            }
          >
            {tag} <span className="opacity-60">{count}</span>
          </button>
        )
      })}
    </div>
  )
})

export default TagFilter
