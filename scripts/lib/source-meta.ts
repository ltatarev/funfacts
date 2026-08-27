/**
 * Best-effort metadata for a source URL.
 *
 * The site is static, so the browser cannot fetch the source page itself.
 * The workflow reads the page once and stores the result in data/facts.json.
 * Every field is cosmetic. A failure never blocks a submission.
 */

export interface SourceMeta {
  title?: string
  siteName?: string
  excerpt?: string
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, ref: string) => {
    if (ref.startsWith('#')) {
      const code = ref[1].toLowerCase() === 'x' ? parseInt(ref.slice(2), 16) : Number(ref.slice(1))
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return ENTITIES[ref.toLowerCase()] ?? match
  })
}

function clean(text: string): string {
  return decodeEntities(text)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

function stripTags(html: string): string {
  return clean(
    html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

/** Read a <meta> content value, whichever order the attributes come in. */
function metaContent(html: string, key: string): string | undefined {
  const attr = key.startsWith('og:') || key.startsWith('article:') ? 'property' : 'name'
  const pattern = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const value = (
    html.match(
      new RegExp(`<meta[^>]+(?:${attr}|property|name)=["']${pattern}["'][^>]+content=["']([^"']*)["']`, 'i'),
    ) ??
    html.match(
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:${attr}|property|name)=["']${pattern}["']`, 'i'),
    )
  )?.[1]
  const text = value ? clean(value) : ''
  return text || undefined
}

/** Cut to a whole word, so the preview never ends mid-word. */
function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`
}

/** First paragraph of real prose, for pages with no description meta tag. */
function firstParagraph(html: string): string | undefined {
  for (const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = stripTags(match[1])
    if (text.length >= 80 && /[.!?]/.test(text)) return text
  }
  return undefined
}

/** Drop the " - Site name" suffix many pages append to <title>. */
function tidyTitle(title: string, siteName: string | undefined): string {
  if (!siteName) return title
  const suffix = new RegExp(`\\s*[-|–—·]\\s*${siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i')
  const short = title.replace(suffix, '').trim()
  return short || title
}

export function parseSourceMeta(html: string): SourceMeta {
  const title = metaContent(html, 'og:title') ?? clean(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '')
  const excerpt =
    metaContent(html, 'og:description') ??
    metaContent(html, 'description') ??
    metaContent(html, 'twitter:description') ??
    firstParagraph(html)

  const siteName = metaContent(html, 'og:site_name')

  return {
    title: title ? tidyTitle(title, siteName) : undefined,
    siteName,
    excerpt: excerpt ? truncate(excerpt, 240) : undefined,
  }
}

export async function fetchSourceMeta(url: string, timeoutMs = 15000): Promise<SourceMeta> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
    })
    if (!res.ok) return {}
    return parseSourceMeta(await res.text())
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}
