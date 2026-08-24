import { useEffect, useRef } from 'react'
import { hashString } from '../lib/hash'

interface StampColumnProps {
  seenIds: string[]
  currentId: string
}

const DOT_COLORS = ['bg-pink', 'bg-purple', 'bg-blue', 'bg-yellow', 'bg-coral', 'bg-mint']

export default function StampColumn({ seenIds, currentId }: StampColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [seenIds.length])

  return (
    <div
      className="flex w-12 flex-col items-center gap-2.5 overflow-y-auto border-r-2 border-dashed border-ink/15 bg-cream-soft/60 py-4 sm:w-14"
      aria-hidden="true"
      ref={listRef}
    >
      {seenIds.map((id) => {
        const h = hashString(id)
        const color = DOT_COLORS[h % DOT_COLORS.length]
        const angle = (h % 21) - 10
        const isCurrent = id === currentId
        return (
          <span
            key={id}
            className={`shrink-0 rounded-full ${color} ${isCurrent ? 'h-3.5 w-3.5 ring-2 ring-ink ring-offset-2 ring-offset-cream-soft' : 'h-2.5 w-2.5 opacity-60'}`}
            style={{ transform: `rotate(${angle}deg)` }}
          />
        )
      })}
    </div>
  )
}
