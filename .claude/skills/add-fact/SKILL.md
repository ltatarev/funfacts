---
name: add-fact
description: Extract a fact from a link, article, or raw text using PROMPT.md, then add it to data/facts.json. Use when the user asks to add a fact, submit a fact, or add an entry to the funfact app from a source.
---

# Add fact

Turn one piece of input (a link, an article, or raw text) into a new entry in
`data/facts.json`, using the extraction rules in `PROMPT.md`.

## Steps

1. Read `PROMPT.md` at the project root. It defines the extraction rules and
   the required output format (Article URL / Fact / Tags). Follow it exactly.

2. Get the input from the user's `$ARGUMENTS`, or ask for it if empty. If the
   input is a URL, fetch its content with `WebFetch` before applying the
   rules.

3. Apply the `PROMPT.md` rules to produce:
   - `Article URL`
   - `Fact` (1-2 sentences, under 280 characters, plain language, not copied
     verbatim from the source)
   - `Tags` (1 to 3, chosen only from `data/tags.json`)

4. If `PROMPT.md` step 7 applies (no source confirms the fact), tell the user
   before continuing. Do not silently drop the warning.

5. The schema in `src/lib/schema.ts` requires a valid source URL — `source.url`
   must be a real URL, not the literal string "unknown". If no URL can be
   found or given, stop and ask the user for one instead of writing a
   placeholder.

6. Read `data/facts.json`. Normalize the new URL the same way
   `scripts/add-fact.ts` does (strip the hash, drop `utm_*` query params,
   drop a trailing slash) and compare against existing `source.url` values.
   If it is already there, tell the user which entry it matches and stop —
   do not add a duplicate.

7. Get the page title (and site name, from `og:site_name`, if present) for
   the source, from the fetched content or a fresh fetch. Fall back to the
   URL itself if no title is found.

8. Build the new entry to match `factSchema` in `src/lib/schema.ts`:
   - `id`: `f_<YYYYMMDD>_<6 lowercase alphanumeric chars>`, using today's UTC
     date and a random suffix, matching `/^f_\d{8}_[a-z0-9]{6}$/`.
   - `fact`: the extracted fact, max 280 characters.
   - `tags`: 1 to 3 tags from `data/tags.json`.
   - `source`: `{ url, title, siteName? }`.
   - `addedAt`: current UTC time as an ISO datetime string.

9. Append the entry to the array in `data/facts.json` and write the file back
   with 2-space indentation and a trailing newline, matching the existing
   file's exact formatting (see the `writeFileSync` call in
   `scripts/add-fact.ts` for the format to match).

10. Run `npm run validate:facts` to confirm the file still passes schema
    validation. If it fails, fix the entry and rerun until it passes.

11. Report the result in one line: the fact text and its tags. Do not print
    the full JSON entry unless the user asks for it.
