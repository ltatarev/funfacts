import { useEffect, useRef } from "react";
import { TAGS } from "../lib/schema";
import { tagColor } from "../lib/palette";
import { XIcon } from "./Icons";

interface TagFilterProps {
  open: boolean;
  selected: string[];
  counts: Record<string, number>;
  resultCount: number;
  unavailableCount: number;
  onToggle: (tag: string) => void;
  onClose: () => void;
}

export default function TagFilter({
  open,
  selected,
  counts,
  resultCount,
  unavailableCount,
  onToggle,
  onClose,
}: TagFilterProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/25 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter facts by tag"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-pop relative w-full max-w-sm overflow-hidden rounded-[22px] bg-paper shadow-[0_18px_44px_rgba(60,48,90,0.18)]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 34% at 20% 4%, #D6C6F2 0%, transparent 62%), radial-gradient(52% 30% at 92% 40%, #C3E2DC 0%, transparent 60%)",
          }}
        />

        <div className="relative px-6 py-6 sm:px-7 sm:py-7">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-display text-lg text-ink">Filter</span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close filter"
              className="font-body cursor-pointer text-ink-soft transition-colors hover:text-ink"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="font-display mb-6 text-2xl leading-[1.3] text-ink">
            What are you
            <br />
            <em className="italic">in the mood</em> for?
          </p>

          <div
            className="mb-6 flex flex-wrap gap-[7px]"
            role="group"
            aria-label="Filter by tag"
          >
            {TAGS.map((tag) => {
              const count = counts[tag] ?? 0;
              const isSelected = selected.includes(tag);
              const disabled = count === 0 && !isSelected;
              const c = tagColor(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(tag)}
                  aria-pressed={isSelected}
                  className="font-body cursor-pointer rounded-full px-3 py-[7px] text-[10px] font-medium tracking-[0.11em] uppercase transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40"
                  style={
                    isSelected
                      ? { background: "var(--color-ink)", color: "var(--color-paper)" }
                      : { background: c.bg, color: c.text }
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-body text-[10.5px] tracking-[0.12em] text-ink-soft uppercase">
              {resultCount} {resultCount === 1 ? "fact" : "facts"}
            </span>
            {unavailableCount > 0 && (
              <span className="font-body text-[10.5px] text-ink-faint">
                {unavailableCount} unavailable
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-body w-full cursor-pointer rounded-full bg-ink py-3 text-center text-[12px] font-medium text-paper transition-opacity hover:opacity-90"
          >
            Show facts
          </button>
        </div>
      </div>
    </div>
  );
}
