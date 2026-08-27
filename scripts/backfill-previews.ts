/**
 * Fill the source excerpt for facts that have none.
 *
 * Facts added before the preview feature carry no excerpt. This script reads
 * each source page once and writes the excerpt back to data/facts.json.
 * A page that fails stays as it is. Run it again later to try those again.
 *
 *   npx tsx scripts/backfill-previews.ts [--limit N] [--force] [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { factsFileSchema } from '../src/lib/schema.ts'
import { fetchSourceMeta } from './lib/source-meta.ts'

const factsPath = fileURLToPath(new URL('../data/facts.json', import.meta.url))

const args = process.argv.slice(2)
const force = args.includes('--force')
const dryRun = args.includes('--dry-run')
const limitArg = args.indexOf('--limit')
const limit = limitArg === -1 ? Infinity : Number(args[limitArg + 1])

const CONCURRENCY = 4
const PAUSE_MS = 250

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  const facts = factsFileSchema.parse(JSON.parse(readFileSync(factsPath, 'utf-8')))
  const targets = facts.filter((f) => force || !f.source.excerpt).slice(0, limit)

  console.log(`${targets.length} fact(s) to read, out of ${facts.length}`)

  let filled = 0
  let failed = 0

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (fact) => {
        const meta = await fetchSourceMeta(fact.source.url, 20000)
        if (meta.excerpt) {
          fact.source.excerpt = meta.excerpt
          filled += 1
          console.log(`ok    ${fact.source.url}`)
        } else {
          failed += 1
          console.log(`skip  ${fact.source.url}`)
        }
      }),
    )
    if (i + CONCURRENCY < targets.length) await sleep(PAUSE_MS)
  }

  console.log(`filled ${filled}, skipped ${failed}`)

  if (dryRun) {
    console.log('dry run: data/facts.json is unchanged')
    return
  }
  if (filled > 0) {
    writeFileSync(factsPath, `${JSON.stringify(factsFileSchema.parse(facts), null, 2)}\n`)
    console.log('wrote data/facts.json')
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
