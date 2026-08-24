import { forwardRef } from "react";
import type { Fact } from "../lib/schema";
import { tagColor } from "../lib/palette";

interface ShareCardProps {
  fact: Fact;
}

/** Off-screen 1080×1080 layout captured by html-to-image for the share/download flow. */
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { fact },
  ref,
) {
  const sourceLabel = fact.source.siteName
    ? `${fact.source.siteName} — ${fact.source.title}`
    : fact.source.title;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: -10000,
        left: -10000,
        width: 1080,
        height: 1080,
        pointerEvents: "none",
      }}
    >
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden px-20 py-20"
        style={{
          background:
            "radial-gradient(circle at 10% 0%, #EEEAFB 0%, transparent 45%), radial-gradient(circle at 95% 15%, #E3EFF9 0%, transparent 45%), radial-gradient(circle at 15% 95%, #FBF3DC 0%, transparent 45%), var(--color-cream)",
        }}
      >
        <div className="font-display text-2xl text-ink">Fun facts</div>
        <p className="font-display text-6xl leading-[1.25] text-ink">
          {fact.fact}
        </p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {fact.tags.map((tag) => {
              const c = tagColor(tag);
              return (
                <span
                  key={tag}
                  className="font-body rounded-full px-5 py-2 text-lg font-medium tracking-wide uppercase"
                  style={{ background: c.bg, color: c.text }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
          <div className="font-body border-t border-line pt-6 text-xl text-ink-soft">
            {sourceLabel}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
