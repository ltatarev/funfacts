import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { factsFileSchema } from '../src/lib/schema.ts'

const factsPath = fileURLToPath(new URL('../data/facts.json', import.meta.url))
const raw = JSON.parse(readFileSync(factsPath, 'utf-8'))

const result = factsFileSchema.safeParse(raw)

if (!result.success) {
  console.error('data/facts.json failed schema validation:')
  console.error(result.error.format())
  process.exit(1)
}

const facts = result.data
const errors: string[] = []

const seenIds = new Set<string>()
for (const f of facts) {
  if (seenIds.has(f.id)) errors.push(`duplicate id: ${f.id}`)
  seenIds.add(f.id)
}

if (errors.length > 0) {
  console.error('data/facts.json failed validation:')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`data/facts.json is valid: ${facts.length} facts.`)
