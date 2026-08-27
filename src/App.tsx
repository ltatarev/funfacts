import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import factsData from "../data/facts.json" with { type: "json" };
import type { Fact } from "./lib/schema";
import { TAGS } from "./lib/schema";
import {
  createDeck,
  insertAtCurrentPosition,
  loadDeck,
  markSeen,
  rebuildDeck,
  saveDeck,
  type DeckState,
} from "./lib/deck";
import FactCard from "./components/FactCard";
import ShareCard from "./components/ShareCard";
import TagFilter from "./components/TagFilter";
import MeshBackground from "./components/MeshBackground";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  FilterIcon,
  ShareIcon,
} from "./components/Icons";
import { deepLinkFor, exportCardImage } from "./lib/share";
import { isDialogOpen, isTypingTarget } from "./lib/keys";

const facts = factsData as Fact[];
const factsById = new Map(facts.map((f) => [f.id, f]));
const allIds = facts.map((f) => f.id);

function readTagsFromUrl(): string[] {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("tags");
  if (!raw) return [];
  const set = new Set<string>(TAGS);
  return raw.split(",").filter((t) => set.has(t));
}

function readFactFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("fact");
}

function idsForTags(selected: string[]): string[] {
  if (selected.length === 0) return allIds;
  const set = new Set(selected);
  return facts.filter((f) => f.tags.some((t) => set.has(t))).map((f) => f.id);
}

function syncUrl(tags: string[], factId: string) {
  const params = new URLSearchParams();
  if (tags.length > 0) params.set("tags", tags.join(","));
  params.set("fact", factId);
  const qs = params.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `?${qs}` : window.location.pathname,
  );
}

function withCurrentSeen(state: DeckState): DeckState {
  const id = state.order[state.index];
  return id ? markSeen(state, id) : state;
}

export default function App() {
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    readTagsFromUrl(),
  );
  const filteredIds = useMemo(() => idsForTags(selectedTags), [selectedTags]);

  const [deck, setDeck] = useState<DeckState>(() => {
    let initial = loadDeck(filteredIds, allIds) ?? createDeck(filteredIds);
    const deepLinkId = readFactFromUrl();
    if (
      deepLinkId &&
      factsById.has(deepLinkId) &&
      filteredIds.includes(deepLinkId)
    ) {
      initial = insertAtCurrentPosition(initial, deepLinkId);
    }
    return withCurrentSeen(initial);
  });

  const [justReshuffled, setJustReshuffled] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const currentId = deck.order[deck.index];
  const currentFact = currentId ? factsById.get(currentId) : undefined;

  useEffect(() => {
    saveDeck(deck);
  }, [deck]);

  useEffect(() => {
    if (!currentId) return;
    syncUrl(selectedTags, currentId);
  }, [selectedTags, currentId]);

  const goNext = useCallback(() => {
    setJustReshuffled(false);
    setDeck((prev) => {
      if (prev.index + 1 >= prev.order.length) {
        setJustReshuffled(true);
        return withCurrentSeen(rebuildDeck(filteredIds, prev.seenIds));
      }
      return withCurrentSeen({ ...prev, index: prev.index + 1 });
    });
  }, [filteredIds]);

  const goBack = useCallback(() => {
    setDeck((prev) =>
      prev.index > 0
        ? withCurrentSeen({ ...prev, index: prev.index - 1 })
        : prev,
    );
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      const nextIds = idsForTags(next);
      setDeck((prevDeck) =>
        withCurrentSeen(rebuildDeck(nextIds, prevDeck.seenIds)),
      );
      setJustReshuffled(false);
      return next;
    });
  }, []);

  const copyFact = useCallback(() => {
    if (!currentFact) return;
    const text = `${currentFact.fact}\n${currentFact.source.url}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 1500);
    });
  }, [currentFact]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const shareFact = useCallback(async () => {
    if (!currentFact || !shareCardRef.current) return;
    try {
      const blob = await exportCardImage(shareCardRef.current);
      const file = new File([blob], `funfact-${currentFact.id}.png`, {
        type: "image/png",
      });
      const link = deepLinkFor(currentFact.id);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: currentFact.fact,
          url: link,
        });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke later. Some browsers cancel the download if the URL goes first.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

      try {
        await navigator.clipboard.writeText(link);
        showToast("Image downloaded and link copied");
      } catch {
        showToast("Image downloaded");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      showToast("Could not share the image");
    }
  }, [currentFact, showToast]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (isDialogOpen()) return;

      switch (e.key) {
        case " ":
        case "Enter":
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goBack();
          break;
        case "c":
          copyFact();
          break;
        case "/":
          e.preventDefault();
          setFilterOpen(true);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goBack, copyFact]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of TAGS) {
      counts[tag] = facts.filter((f) => f.tags.includes(tag)).length;
    }
    return counts;
  }, []);

  const unavailableCount = useMemo(
    () => TAGS.filter((tag) => (tagCounts[tag] ?? 0) === 0).length,
    [tagCounts],
  );

  if (facts.length === 0) {
    return (
      <>
        <MeshBackground />
        <div className="flex min-h-svh items-center justify-center px-4">
          <div className="animate-card-pop max-w-md rounded-[22px] bg-paper p-8 text-center text-ink shadow-[0_18px_44px_rgba(60,48,90,0.10)]">
            <p className="font-display text-xl text-ink">No facts yet.</p>
            <p className="font-body mt-3 text-sm text-ink-soft">
              Add the first one by opening an issue on the repository's{" "}
              <a
                href="../.github/ISSUE_TEMPLATE/new-fact.yml"
                className="border-b border-ink-faint/50 pb-[1px] text-ink"
              >
                new fact form
              </a>
              .
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!currentFact) {
    return null;
  }

  return (
    <>
      <MeshBackground tag={currentFact.tags[0]} />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
        <ShareCard ref={shareCardRef} fact={currentFact} />

        {toast && (
          <div
            role="status"
            className="font-body animate-toast-pop fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-cream shadow-[0_8px_24px_rgba(23,22,29,0.25)]"
          >
            {toast}
          </div>
        )}

        <TagFilter
          open={filterOpen}
          selected={selectedTags}
          counts={tagCounts}
          resultCount={filteredIds.length}
          unavailableCount={unavailableCount}
          onToggle={toggleTag}
          onClose={() => setFilterOpen(false)}
        />

        <header className="flex w-full max-w-2xl items-baseline justify-between">
          <span className="font-display text-xl text-ink sm:text-[21px]">
            Fun facts
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Filter facts by tag"
              className="font-body cursor-pointer text-ink-soft transition-colors hover:text-ink"
            >
              <FilterIcon className="h-4 w-4" />
            </button>
            <span className="font-body text-[11px] tracking-[0.14em] text-ink-soft uppercase">
              {String(deck.index + 1).padStart(3, "0")} /{" "}
              {String(deck.order.length).padStart(3, "0")}
            </span>
          </div>
        </header>

        {justReshuffled && (
          <div className="font-body flex w-full max-w-2xl items-center justify-between rounded-full bg-paper/70 px-4 py-2 text-xs text-ink-soft">
            <span>That's all of them — starting over.</span>
            <button
              type="button"
              onClick={() => setJustReshuffled(false)}
              aria-label="Dismiss"
              className="cursor-pointer text-base leading-none"
            >
              ×
            </button>
          </div>
        )}

        <div
          key={currentId}
          className="animate-card-pop w-full max-w-2xl overflow-hidden rounded-[22px] bg-paper shadow-[0_18px_44px_rgba(60,48,90,0.10)]"
        >
          <FactCard fact={currentFact} />
        </div>

        <div className="flex w-full max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={deck.index === 0}
            aria-label="Previous fact"
            className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-faint/60 text-ink-soft transition-all duration-150 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink-faint/60 disabled:hover:text-ink-soft"
          >
            <ArrowLeftIcon className="h-[17px] w-[17px]" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="font-body flex cursor-pointer items-center gap-2.5 rounded-full bg-ink px-[22px] py-3 text-[13px] text-cream transition-opacity hover:opacity-90"
          >
            Next fact
            <ArrowRightIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={copyFact}
            aria-label={copyStatus === "copied" ? "Copied" : "Copy fact"}
            className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-faint/60 text-ink-soft transition-all duration-150 hover:border-ink hover:text-ink"
          >
            {copyStatus === "copied" ? (
              <CheckIcon className="h-[17px] w-[17px] text-teal-text" />
            ) : (
              <CopyIcon className="h-[17px] w-[17px]" />
            )}
          </button>

          <button
            type="button"
            onClick={shareFact}
            aria-label="Share fact"
            className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-faint/60 text-ink-soft transition-all duration-150 hover:border-ink hover:text-ink"
          >
            <ShareIcon className="h-[17px] w-[17px]" />
          </button>

          <span className="font-body ml-auto hidden text-[11px] tracking-[0.1em] text-ink-faint sm:inline">
            press space
          </span>
        </div>
      </div>
    </>
  );
}
