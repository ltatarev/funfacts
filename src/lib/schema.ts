import { z } from 'zod'
import tags from '../../data/tags.json' with { type: 'json' }

export const TAGS = tags as readonly string[]

export const tagSchema = z.enum(TAGS as [string, ...string[]])

export const sourceSchema = z.object({
  url: z.url(),
  title: z.string().min(1),
  siteName: z.string().min(1).optional(),
})

export const factSchema = z.object({
  id: z.string().regex(/^f_\d{8}_[a-z0-9]{6}$/),
  fact: z.string().min(1).max(280),
  tags: z.array(tagSchema).min(1).max(3),
  source: sourceSchema,
  addedAt: z.iso.datetime(),
})

export const factsFileSchema = z.array(factSchema)

export type Tag = z.infer<typeof tagSchema>
export type Source = z.infer<typeof sourceSchema>
export type Fact = z.infer<typeof factSchema>
