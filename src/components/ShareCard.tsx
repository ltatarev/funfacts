import { forwardRef } from 'react'
import type { Fact } from '../lib/schema'

interface ShareCardProps {
  fact: Fact
}

/** Off-screen 1080×1080 layout captured by html-to-image for the share/download flow. */
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard({ fact }, ref) {
  const sourceLabel = fact.source.siteName
    ? `${fact.source.siteName} — ${fact.source.title}`
    : fact.source.title

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', top: -10000, left: -10000, width: 1080, height: 1080, pointerEvents: 'none' }}
    >
      <div className="flex h-full w-full flex-col justify-between bg-manila px-20 py-20">
        <div className="font-type text-xl tracking-[0.3em] text-graphite uppercase">Fun facts</div>
        <p className="font-serif text-6xl leading-tight text-ink">{fact.fact}</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {fact.tags.map((tag) => (
              <span
                key={tag}
                className="font-type rounded-sm bg-sage/25 px-4 py-2 text-lg tracking-widest text-sage-ink uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="font-type border-t border-ink/20 pt-6 text-xl tracking-widest text-ink-soft uppercase">
            {sourceLabel}
          </div>
        </div>
      </div>
    </div>
  )
})

export default ShareCard
