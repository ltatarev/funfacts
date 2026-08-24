import type { Fact } from "../lib/schema";
import { tagColor } from "../lib/palette";

interface FactCardProps {
  fact: Fact;
}

export default function FactCard({ fact }: FactCardProps) {
  const sourceLabel = fact.source.siteName
    ? `${fact.source.siteName} — ${fact.source.title}`
    : fact.source.title;

  return (
    <div className="relative flex-1 px-6 py-8 sm:px-9 sm:py-9">
      <div className="flex flex-wrap gap-[7px]">
        {fact.tags.map((tag) => {
          const c = tagColor(tag);
          return (
            <span
              key={tag}
              className="font-body rounded-full px-[11px] py-[5px] text-[10.5px] font-medium tracking-[0.13em] uppercase"
              style={{ background: c.bg, color: c.text }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="font-display mt-5 text-2xl leading-[1.3] font-normal text-ink sm:mt-6 sm:text-[31px]"
      >
        {fact.fact}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <span className="font-body shrink-0 text-[11px] tracking-[0.14em] text-ink-faint uppercase">
          Source
        </span>
        <a
          href={fact.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body truncate border-b border-ink-faint/50 pb-[2px] text-right text-[12.5px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          {sourceLabel}
        </a>
      </div>
    </div>
  );
}
