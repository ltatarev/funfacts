import { forwardRef, useImperativeHandle, useRef } from 'react'
import { TAGS } from '../lib/schema'

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

        return (
          <button
            key={tag}
            ref={tag === firstEnabledTag ? firstEnabledRef : undefined}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(tag)}
            aria-pressed={isSelected}
            className={`font-type rounded-sm border px-2 py-1 text-[10px] tracking-widest uppercase transition-colors ${
              isSelected
                ? 'border-stamp bg-stamp/15 text-stamp'
                : 'border-manila-dark/60 text-manila-dark/80 hover:border-manila-dark hover:text-manila'
            } ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
          >
            {tag} <span className="opacity-60">{count}</span>
          </button>
        )
      })}
    </div>
  )
})

export default TagFilter
