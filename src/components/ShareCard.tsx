import { forwardRef } from 'react'
import type { Fact } from '../lib/schema'
import { tagColor } from '../lib/palette'

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
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden px-20 py-20"
        style={{
          background:
            'radial-gradient(circle at 10% 0%, #ffe1f2 0%, transparent 45%), radial-gradient(circle at 95% 15%, #dcf3ff 0%, transparent 45%), radial-gradient(circle at 15% 95%, #fff3c4 0%, transparent 45%), var(--color-cream)',
        }}
      >
        <div className="font-display flex items-center gap-3 text-2xl font-bold tracking-wide text-ink">
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--color-pink), var(--color-purple))' }}
          />
          Fun facts
        </div>
        <p className="font-display text-6xl leading-tight font-semibold text-ink">{fact.fact}</p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {fact.tags.map((tag) => {
              const c = tagColor(tag)
              return (
                <span
                  key={tag}
                  className="font-body rounded-full border-2 px-5 py-2 text-lg font-extrabold tracking-wide uppercase"
                  style={{ background: c.bg, color: c.text, borderColor: c.border }}
                >
                  {tag}
                </span>
              )
            })}
          </div>
          <div className="font-body border-t-2 border-dashed border-ink/20 pt-6 text-xl font-bold text-ink-soft">
            {sourceLabel}
          </div>
        </div>
      </div>
    </div>
  )
})

export default ShareCard
