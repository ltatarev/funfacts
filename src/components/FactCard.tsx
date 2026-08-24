import type { Fact } from '../lib/schema'
import { tagColor } from '../lib/palette'
import { Squiggle } from './Doodles'

interface FactCardProps {
  fact: Fact
  position: number
  total: number
}

export default function FactCard({ fact, position, total }: FactCardProps) {
  const sourceLabel = fact.source.siteName
    ? `${fact.source.siteName} — ${fact.source.title}`
    : fact.source.title

  return (
    <div className="relative flex-1 px-6 py-9 sm:px-10 sm:py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-7">
        <div aria-live="polite" className="relative">
          <p className="font-display text-2xl leading-snug font-semibold text-ink sm:text-3xl">
            {fact.fact}
          </p>
          <Squiggle className="mt-2 h-3 w-16 text-yellow" />
          <a
            href={fact.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body mt-4 inline-block rounded-full border-2 border-ink/15 px-3 py-1 text-xs font-bold tracking-wide text-ink-soft transition-colors hover:border-purple hover:text-purple"
          >
            {sourceLabel} ↗
          </a>
        </div>

        <div className="border-t-2 border-dashed border-ink/15 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-2">
              {fact.tags.map((tag) => {
                const c = tagColor(tag)
                return (
                  <li
                    key={tag}
                    className="font-body rounded-full border-2 px-3 py-1 text-xs font-extrabold tracking-wide uppercase"
                    style={{ background: c.bg, color: c.text, borderColor: c.border }}
                  >
                    {tag}
                  </li>
                )
              })}
            </ul>
            <span className="font-display rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">
              {String(position).padStart(3, '0')} / {String(total).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
