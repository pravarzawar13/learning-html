# HTML Learning Playground — Design

**Date:** 2026-05-24
**For:** Pravar (HTML beginner)

## Purpose

A friendly, browser-based playground where a beginner types HTML, sees it
rendered live, and gets warm, plain-language feedback about mistakes and good
habits. Deployed as a static site on GitHub Pages.

## Success criteria

- Type HTML on the left → see it rendered on the right within a moment.
- Common beginner mistakes are pointed out clearly, with the line number and a
  plain-English explanation a learner can act on.
- A tag cheatsheet and starter snippets help Pravar discover and try tags.
- Works as a static page on GitHub Pages (no build step).

## Layout

Single page, side-by-side:

```
+----------------------------------------------------------+
|  Header: title + "Toolbox" toggle                        |
+---------------------------+------------------------------+
|  Code editor              |  Live preview (iframe)       |
|  (textarea + line gutter) |  (sandboxed srcdoc)          |
+---------------------------+------------------------------+
|  Mistakes & Tips panel (full width, scrollable)          |
+----------------------------------------------------------+
```

- **Toolbox drawer** (slides in from the side): tag cheatsheet + starter
  snippets, each with an "Insert" button.
- Responsive: on narrow screens the editor/preview stack vertically.

## Components

1. **Editor** — `<textarea>` with a synced line-number gutter. Plain, robust,
   no editor dependency. On input (debounced ~300ms) it triggers preview +
   linting.
2. **Preview** — a sandboxed `<iframe srcdoc>` rendering the current HTML in
   isolation.
3. **Linter** — hybrid:
   - **HTMLHint** (loaded from CDN) for reliable structural errors:
     unclosed/mismatched tags, attribute quoting, duplicate attributes.
   - **Custom rules layer** (our JS) for teaching-focused checks:
     - Unknown / misspelled tag names (compared against a known-tags list).
     - Deprecated tags (`center`, `font`, `marquee`, `big`, `tt`, `strike`, …)
       with a modern alternative suggested.
     - Best-practice & accessibility tips: `<img>` missing `alt`, heading
       order (h1 before h2…), missing `<html lang>`, missing `<title>`.
4. **Mistakes & Tips panel** — renders combined results, sorted by line, each
   with a severity badge:
   - 🔴 **error** (broken markup)
   - 🟡 **warning** (deprecated / risky)
   - 🔵 **tip** (good habit)
   Empty state: a friendly "Looks good! 🎉" message.
5. **Toolbox** — data-driven cheatsheet + starter snippets.

## Data flow

```
textarea input
  → debounce
  → (a) iframe.srcdoc = code         [live preview]
  → (b) HTMLHint.verify(code)  ─┐
       custom rules(code)      ─┴─→ merge + sort by line → render panel
```

## Files

- `index.html` — structure + CDN script tag for HTMLHint.
- `styles.css` — layout and theming (friendly, readable).
- `app.js` — editor wiring, preview, linter (HTMLHint + custom rules), toolbox.
- (cheatsheet/snippet data can live inline in `app.js` for simplicity.)

## Error handling

- If HTMLHint fails to load (offline / CDN down), the custom rules still run and
  a small notice says structural checking is unavailable. Preview still works.
- iframe is sandboxed (`allow-scripts` only as needed) so learner code can't
  affect the host page.

## Deployment

- GitHub Pages from `main` branch, root folder. Repo:
  `github.com/pravarzawar13/learning-html`. `index.html` is at root.
- Enable Pages via GitHub settings/API; site served at the Pages URL.

## Out of scope (YAGNI)

- Saving/loading projects, multiple files, CSS/JS linting, accounts, sharing
  links. Can be added later if wanted.
