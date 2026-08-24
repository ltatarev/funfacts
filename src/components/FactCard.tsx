import type { Fact } from '../lib/schema'

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
    <div className="relative flex-1 bg-manila px-6 py-8 sm:px-10 sm:py-12">
      <span
        aria-hidden="true"
        className="absolute top-4 left-4 h-3 w-3 rounded-full bg-drawer shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] sm:top-6 sm:left-6"
      />

      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div aria-live="polite">
          <p className="font-serif text-2xl leading-snug text-ink sm:text-3xl">{fact.fact}</p>
          <a
            href={fact.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-type mt-4 inline-block text-[11px] tracking-widest text-ink-soft uppercase underline decoration-graphite/40 underline-offset-4 hover:text-stamp"
          >
            {sourceLabel}
          </a>
        </div>

        <div className="border-t border-ink/15 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-2">
              {fact.tags.map((tag) => (
                <li
                  key={tag}
                  className="font-type rounded-sm bg-sage/25 px-2 py-0.5 text-[10px] tracking-widest text-sage-ink uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <span className="font-type text-[11px] tracking-widest text-graphite">
              {String(position).padStart(3, '0')} / {String(total).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
