import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { factSchema, factsFileSchema, TAGS } from '../src/lib/schema.ts'

const token = requireEnv('GITHUB_TOKEN')
const repo = requireEnv('GITHUB_REPOSITORY')
const issueNumber = Number(requireEnv('ISSUE_NUMBER'))
const issueBody = process.env.ISSUE_BODY ?? ''

const API = 'https://api.github.com'
const factsPath = fileURLToPath(new URL('../data/facts.json', import.meta.url))

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`missing env: ${name}`)
  return value
}

async function gh(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${path} failed: ${res.status} ${text}`)
  }
  return res
}

async function commentOnIssue(body: string): Promise<void> {
  await gh(`/repos/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

async function closeIssue(): Promise<void> {
  await gh(`/repos/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({ state: 'closed' }),
  })
}

async function labelNeedsAttention(): Promise<void> {
  await gh(`/repos/${repo}/issues/${issueNumber}/labels`, {
    method: 'POST',
    body: JSON.stringify({ labels: ['needs-attention'] }),
  })
}

// --- parse the issue-form body ---
// GitHub issue forms render each field as "### <label>\n\n<value or _No response_>".

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseSection(body: string, heading: string): string | null {
  const re = new RegExp(`### ${escapeRegExp(heading)}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |$)`)
  const match = body.match(re)
  if (!match) return null
  const value = match[1].trim()
  return value === '' || value === '_No response_' ? null : value
}

interface IssueFields {
  url: string | null
  fact: string | null
  tags: string[] | null
}

function parseIssue(body: string): IssueFields {
  const url = parseSection(body, 'Article URL')
  const fact = parseSection(body, 'Fact')
  const tagsRaw = parseSection(body, 'Tags')
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : null
  return { url, fact, tags }
}

// --- best-effort title / site-name lookup (cosmetic only; never blocks the submission) ---

async function fetchSourceMeta(url: string): Promise<{ title?: string; siteName?: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) return {}
    const html = await res.text()
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim()
    const siteName = (
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:site_name["']/i)
    )?.[1]?.trim()
    return { title: title || undefined, siteName: siteName || undefined }
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

// --- ids and url normalization ---

function normalizeUrl(raw: string): string {
  const url = new URL(raw)
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_')) url.searchParams.delete(key)
  }
  const normalized = url.toString()
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

function randomSuffix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function makeId(): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `f_${y}${m}${d}_${randomSuffix()}`
}

async function main(): Promise<void> {
  const fields = parseIssue(issueBody)

  if (!fields.url || !fields.fact || !fields.tags || fields.tags.length === 0) {
    const missing = [
      !fields.url && 'Article URL',
      !fields.fact && 'Fact',
      (!fields.tags || fields.tags.length === 0) && 'Tags',
    ].filter(Boolean)
    await commentOnIssue(`Missing required field(s): ${missing.join(', ')}.`)
    await labelNeedsAttention()
    return
  }

  const unknownTags = fields.tags.filter((t) => !TAGS.includes(t))
  if (unknownTags.length > 0) {
    await commentOnIssue(
      `Unknown tag(s): ${unknownTags.join(', ')}. Choose from: ${TAGS.join(', ')}.`,
    )
    await labelNeedsAttention()
    return
  }

  const existing = factsFileSchema.parse(JSON.parse(readFileSync(factsPath, 'utf-8')))

  const normalizedNew = normalizeUrl(fields.url)
  const dupe = existing.find((f) => normalizeUrl(f.source.url) === normalizedNew)
  if (dupe) {
    await commentOnIssue(`Already have this one: "${dupe.fact}"`)
    await closeIssue()
    return
  }

  const meta = await fetchSourceMeta(fields.url)

  const candidate = {
    id: makeId(),
    fact: fields.fact.slice(0, 280),
    tags: fields.tags.slice(0, 3),
    source: {
      url: fields.url,
      title: meta.title ?? fields.url,
      siteName: meta.siteName,
    },
    addedAt: new Date().toISOString(),
  }

  const parsedFact = factSchema.parse(candidate)
  const updated = factsFileSchema.parse([...existing, parsedFact])
  writeFileSync(factsPath, `${JSON.stringify(updated, null, 2)}\n`)

  await commentOnIssue(`Added: "${parsedFact.fact}"\n\nTags: ${parsedFact.tags.join(', ')}`)
  await closeIssue()
}

main().catch(async (err: unknown) => {
  console.error(err)
  try {
    await commentOnIssue(`Failed to add fact: ${err instanceof Error ? err.message : String(err)}`)
    await labelNeedsAttention()
  } catch (commentErr) {
    console.error('failed to comment on issue', commentErr)
  }
  process.exitCode = 1
})
