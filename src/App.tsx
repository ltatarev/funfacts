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
import StampColumn from "./components/StampColumn";
import TagFilter, { type TagFilterHandle } from "./components/TagFilter";
import { deepLinkFor, exportCardImage } from "./lib/share";

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

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
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
  const tagFilterRef = useRef<TagFilterHandle>(null);
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
      a.click();
      URL.revokeObjectURL(objectUrl);
      await navigator.clipboard.writeText(link);
      showToast("Image downloaded and link copied");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      showToast("Could not share the image");
    }
  }, [currentFact, showToast]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"]')) return;

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
          tagFilterRef.current?.focus();
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

  if (facts.length === 0) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-drawer px-4">
        <div className="max-w-md rounded-sm bg-manila p-8 text-center text-ink">
          <p className="font-serif text-xl">No facts yet.</p>
          <p className="font-type mt-3 text-sm text-graphite">
            Add the first one by opening an issue on the repository's{" "}
            <a
              href="../.github/ISSUE_TEMPLATE/new-fact.yml"
              className="underline"
            >
              new fact form
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (!currentFact) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-drawer px-4 py-10">
      <ShareCard ref={shareCardRef} fact={currentFact} />

      {toast && (
        <div
          role="status"
          className="font-type fixed bottom-6 left-1/2 -translate-x-1/2 rounded-sm bg-ink px-4 py-2 text-xs tracking-widest text-manila uppercase shadow-lg"
        >
          {toast}
        </div>
      )}

      <header className="flex w-full max-w-2xl flex-col gap-3">
        <TagFilter
          ref={tagFilterRef}
          selected={selectedTags}
          counts={tagCounts}
          onToggle={toggleTag}
        />
      </header>

      {justReshuffled && (
        <div className="font-type flex w-full max-w-2xl items-center justify-between rounded-sm border border-manila-dark/40 px-3 py-2 text-[11px] tracking-widest text-manila-dark uppercase">
          <span>That's all of them — starting over.</span>
          <button
            type="button"
            onClick={() => setJustReshuffled(false)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex w-full max-w-2xl overflow-hidden rounded-sm border border-drawer-line shadow-2xl motion-safe:transition-transform motion-safe:duration-150">
        <StampColumn seenIds={deck.seenIds} currentId={currentId} />
        <FactCard
          fact={currentFact}
          position={deck.index + 1}
          total={deck.order.length}
        />
      </div>

      <div className="flex w-full max-w-2xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={deck.index === 0}
          className="font-type rounded-sm border border-manila-dark/40 px-3 py-2 text-xs tracking-widest text-manila uppercase disabled:cursor-not-allowed disabled:opacity-30"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={copyFact}
            className="font-type text-xs tracking-widest text-manila-dark uppercase underline"
          >
            {copyStatus === "copied" ? "Copied" : "Copy fact"}
          </button>
          <button
            type="button"
            onClick={shareFact}
            className="font-type text-xs tracking-widest text-manila-dark uppercase underline"
          >
            Share
          </button>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={goNext}
            className="font-type rounded-sm bg-stamp px-4 py-2 text-xs tracking-widest text-manila uppercase"
          >
            Next fact
          </button>
          <span className="font-type text-[10px] tracking-widest text-manila-dark/70 uppercase">
            space · → · enter
          </span>
        </div>
      </div>
    </div>
  );
}
