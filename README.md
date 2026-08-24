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

## Build

```
npm run build
```
