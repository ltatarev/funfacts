# funfacts

A static site that shows one fun fact at a time, each with a linked source.

New facts come in by opening a GitHub issue with an article URL. A GitHub
Action fetches the article, condenses it into a fact with GitHub Models,
commits it to `data/facts.json`, and redeploys to GitHub Pages.

## Develop

```
npm install
npm run dev
```

## Fill previews for older facts

Facts added before the preview feature have no excerpt. Read the source pages
once and write the excerpts back:

```
npm run backfill:previews
```

Add `--dry-run` to see the result without a write, `--force` to read every
page again. Pages that block the fetch keep no excerpt. The card still shows
the site, the title, and the link.

## Build

```
npm run build
```
