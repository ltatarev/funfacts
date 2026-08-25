const STORAGE_KEY = 'funfacts.deck.v1'

export interface DeckState {
  seed: number
  order: string[]
  index: number
  seenIds: string[]
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const rand = mulberry32(seed)
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function createDeck(ids: readonly string[], seenIds: readonly string[] = []): DeckState {
  const seed = newSeed()
  return { seed, order: shuffle(ids, seed), index: 0, seenIds: [...seenIds] }
}

/** Rebuilds the deck for a (possibly filtered) id subset: unseen ids shuffled to the
 * front, seen ids shuffled behind them. seenIds itself is untouched — it's global. */
export function rebuildDeck(ids: readonly string[], seenIds: readonly string[]): DeckState {
  const seed = newSeed()
  const seenSet = new Set(seenIds)
  const unseen = ids.filter((id) => !seenSet.has(id))
  const seen = ids.filter((id) => seenSet.has(id))
  const order = [...shuffle(unseen, seed), ...shuffle(seen, seed + 1)]
  return { seed, order, index: 0, seenIds: [...seenIds] }
}

/** Moves `id` to the deck's current index, shifting everything else along. Used
 * for deep links: `?fact=<id>` should open on that fact without losing the deck. */
export function insertAtCurrentPosition(state: DeckState, id: string): DeckState {
  const withoutId = state.order.filter((existing) => existing !== id)
  const index = Math.min(state.index, withoutId.length)
  const order = [...withoutId.slice(0, index), id, ...withoutId.slice(index)]
  return { ...state, order, index }
}

export function markSeen(state: DeckState, id: string): DeckState {
  if (state.seenIds.includes(id)) return state
  return { ...state, seenIds: [...state.seenIds, id] }
}

/**
 * Loads `seenIds` from storage, validated against `allIds` since seen state is
 * global and must survive filter changes, and builds a freshly shuffled deck
 * from `filteredIds` around it (unseen ids first). The order is never
 * restored from storage — each load reshuffles, so the fact order is always
 * random rather than resuming the previous session's order.
 */
export function loadDeck(filteredIds: readonly string[], allIds: readonly string[]): DeckState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DeckState
    if (
      typeof parsed.seed !== 'number' ||
      !Array.isArray(parsed.order) ||
      typeof parsed.index !== 'number' ||
      !Array.isArray(parsed.seenIds)
    ) {
      return null
    }

    const allSet = new Set(allIds)
    const seenIds = parsed.seenIds.filter((id) => allSet.has(id))
    if (filteredIds.length === 0) return null
    return rebuildDeck(filteredIds, seenIds)
  } catch {
    return null
  }
}

export function saveDeck(state: DeckState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — deck just won't persist.
  }
}
