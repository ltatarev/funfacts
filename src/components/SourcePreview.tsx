import { useEffect, useId, useState } from "react";
import type { Source } from "../lib/schema";
import { tagColor } from "../lib/palette";
import { hostLabel, monogram, pathLabel, siteLabel } from "../lib/source";
import { isDialogOpen, isTypingTarget } from "../lib/keys";
import { ChevronDownIcon, ExternalLinkIcon } from "./Icons";

interface SourcePreviewProps {
  source: Source;
}

/**
 * The source line, with the preview card open under it.
 * The card shows where the link goes before the reader leaves the page.
 * A source with no preview text keeps the plain source line, so a failed
 * read of the source page stays invisible to the reader.
 */
export default function SourcePreview({ source }: SourcePreviewProps) {
  const hasPreview = Boolean(source.excerpt);
  const [open, setOpen] = useState(true);
  const panelId = useId();

  const host = hostLabel(source.url);
  const path = pathLabel(source.url);
  const site = siteLabel(source);
  const label = source.siteName
    ? `${source.siteName} — ${source.title}`
    : source.title;
  // The same site always gets the same tile color.
  const color = tagColor(host);

  useEffect(() => {
    if (!hasPreview) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "s" || isTypingTarget(e.target) || isDialogOpen()) return;
      setOpen((prev) => !prev);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasPreview]);

  return (
    <div className="mt-6 border-t border-line pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-body shrink-0 text-[11px] tracking-[0.14em] text-ink-faint uppercase">
          Source
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body truncate border-b border-ink-faint/50 pb-[2px] text-right text-[12.5px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {label}
          </a>
          {hasPreview && (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={
                open ? "Hide the source preview" : "Show the source preview"
              }
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink"
            >
              <ChevronDownIcon
                className={`h-[15px] w-[15px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {hasPreview && (
        <div
          id={panelId}
          aria-hidden={open ? undefined : true}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? undefined : -1}
              className="group mt-3 flex gap-3.5 rounded-[14px] border border-line bg-cream p-3.5 transition-colors hover:border-ink-faint/70"
            >
              <span
                aria-hidden="true"
                className="font-body flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] text-[13px] font-medium tracking-[0.04em]"
                style={{ background: color.bg, color: color.text }}
              >
                {monogram(source)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="font-body flex items-baseline gap-2 text-[10.5px] tracking-[0.13em] text-ink-faint uppercase">
                  <span className="truncate">{site}</span>
                  <span className="ml-auto shrink-0 normal-case tracking-normal">
                    {host}
                  </span>
                </div>

                <div className="font-display mt-1 line-clamp-2 text-[16px] leading-[1.35] text-ink">
                  {source.title}
                </div>

                <p className="font-body mt-1.5 line-clamp-3 text-[12.5px] leading-[1.55] text-ink-soft">
                  {source.excerpt}
                </p>

                <div className="font-body mt-2.5 flex items-center gap-2 text-[11px] text-ink-faint">
                  {path && <span className="truncate">{path}</span>}
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-ink-soft transition-colors group-hover:text-ink">
                    Open
                    <ExternalLinkIcon className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
