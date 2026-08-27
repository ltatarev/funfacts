import type { Fact } from "../lib/schema";
import { tagColor } from "../lib/palette";
import SourcePreview from "./SourcePreview";

interface FactCardProps {
  fact: Fact;
}

export default function FactCard({ fact }: FactCardProps) {
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

      <SourcePreview source={fact.source} />
    </div>
  );
}
