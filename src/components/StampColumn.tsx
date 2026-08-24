import { useEffect, useRef } from 'react'
import { hashString } from '../lib/hash'

interface StampColumnProps {
  seenIds: string[]
  currentId: string
}

const today = new Date()
const stampDate = today
  .toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
  .toUpperCase()
  .replace(' ', '·')

export default function StampColumn({ seenIds, currentId }: StampColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [seenIds.length])

  return (
    <div
      className="flex w-14 flex-col items-center gap-2 overflow-y-auto border-r border-ink/15 bg-manila-dark/60 py-4"
      aria-hidden="true"
      ref={listRef}
    >
      {seenIds.map((id) => {
        const angle = (hashString(id) % 17) - 8
        const isCurrent = id === currentId
        return (
          <span
            key={id}
            className="font-type shrink-0 select-none rounded-sm border px-1 text-[9px] leading-tight tracking-wide"
            style={{
              transform: `rotate(${angle}deg)`,
              borderColor: isCurrent ? 'var(--color-stamp)' : 'var(--color-graphite)',
              color: isCurrent ? 'var(--color-stamp)' : 'var(--color-graphite)',
              opacity: isCurrent ? 1 : 0.55,
            }}
          >
            {stampDate}
          </span>
        )
      })}
    </div>
  )
}
