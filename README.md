# boneyard-tailwind

**Snapshot your real UI in the browser, get a skeleton loader that matches it—using only Tailwind CSS classes.**  
Works with plain HTML, PHP, Vue, etc. No React required.

Conceptually similar to [Boneyard](https://github.com/0xGF/boneyard) (auto-generated skeletons from layout); this repo is a small **vanilla JavaScript** + **Tailwind** toolkit.

---

## Table of contents

- [What you get](#what-you-get)
- [What you need](#what-you-need)
- [Quick start](#quick-start)
- [Try the demos](#try-the-demos)
- [How to use in your project](#how-to-use-in-your-project)
  - [Option A: ES modules](#option-a-es-modules-local-or-bundler)
  - [Option B: Script tag (GitHub CDN)](#option-b-script-tag-github-cdn)
- [API (short reference)](#api-short-reference)
- [Output JSON shape](#output-json-shape)
- [Responsive layouts (breakpoints)](#responsive-layouts-breakpoints)
- [npm scripts](#npm-scripts)
- [License](#license)

---

## What you get

| Piece | What it does |
| ----- | ------------- |
| **`snapshotBones(element)`** | Reads the live DOM and returns rectangles (“bones”): horizontal position/width as **%** of the container, vertical as **px**. |
| **`mountSkeleton` / `skeletonHTML`** | Builds placeholder markup using Tailwind (`animate-pulse`, slate grays, arbitrary `left-[…%]`, etc.). |
| **`pickBreakpoint`** | If you saved several snapshots for different widths, picks the best one for the current container. |

---

## What you need

1. **Tailwind CSS** on any page where you show the skeleton—e.g. the [Tailwind Play CDN](https://cdn.tailwindcss.com) or your own build.  
   This package is **JavaScript only**; it does **not** ship CSS.

2. If you use a **static Tailwind build** (not the CDN), generated classes use many **arbitrary values**. You must **safelist** those patterns or include the generated HTML in Tailwind’s content scan, or the styles will be purged.

---

## Quick start

1. Clone or copy this repository.
2. Run `npm install` (installs the dev tool that builds the browser bundle).
3. Choose how you load the code:

| Goal | Do this |
| ---- | ------- |
| Develop / use with a bundler | Import from `src/index.js` (see [Option A](#option-a-es-modules-local-or-bundler)). |
| Use a single file from GitHub | Run `npm run build:iife`, commit `dist/boneyard-tailwind.min.js`, use [jsDelivr](https://www.jsdelivr.com/?docs=gh) (see [Option B](#option-b-script-tag-github-cdn)). |

---

## Try the demos

Your dev server must use **HTTP** or **HTTPS**. Opening files as `file://` will **not** load ES modules correctly.

| File | Purpose |
| ---- | ------- |
| [`demo/index.html`](demo/index.html) | Full UI: snapshot, JSON output, side‑by‑side real UI vs skeleton. |
| [`demo/cdn.html`](demo/cdn.html) | Minimal page using the **IIFE** file (`dist/boneyard-tailwind.min.js`). Run `npm run build:iife` first. |

Example (adjust path to your server):

`http://localhost/.../skeleton-loading/demo/index.html`

---

## How to use in your project

### Option A: ES modules (local or bundler)

```js
import { snapshotBones, mountSkeleton } from './src/index.js'

const root = document.getElementById('card')
const host = document.getElementById('skeleton-host')

const data = snapshotBones(root, 'card')
mountSkeleton(host, data)
```

Point the import at your real path (or your bundler’s alias).

---

### Option B: Script tag (GitHub CDN)

Building produces **`dist/boneyard-tailwind.min.js`**, which sets a global **`BoneyardTailwind`**.

#### Step 1 — Build and push the file

```bash
npm run build:iife
git add dist/boneyard-tailwind.min.js
git commit -m "Add IIFE bundle for CDN"
git push
```

Keep that file in the repo if you use **GitHub + jsDelivr**.

#### Step 2 — CDN URL (jsDelivr + GitHub)

Use this pattern (replace the placeholders):

```text
https://cdn.jsdelivr.net/gh/GITHUB_USER/GITHUB_REPO@REF/dist/boneyard-tailwind.min.js
```

| Placeholder | Meaning |
| ----------- | -------- |
| `GITHUB_USER` | Your GitHub username or organization |
| `GITHUB_REPO` | Repository name |
| `REF` | Branch (`main`), **tag** (`v0.1.0`), or **commit SHA** — prefer tag or SHA in production for stable URLs |

#### Step 3 — HTML (order matters)

1. Tailwind  
2. `boneyard-tailwind.min.js`  
3. Your script  

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/gh/GITHUB_USER/GITHUB_REPO@v0.1.0/dist/boneyard-tailwind.min.js"></script>
<script>
  const data = BoneyardTailwind.snapshotBones(document.getElementById('card'), 'card')
  BoneyardTailwind.mountSkeleton(document.getElementById('skeleton-host'), data)
</script>
```

#### Other ways to host the same file

- **Your own server** — Upload `dist/boneyard-tailwind.min.js` and use your full URL in `src`.
- **npm** — After `npm publish`, something like:  
  `https://cdn.jsdelivr.net/npm/boneyard-tailwind@0.1.0/dist/boneyard-tailwind.min.js`  
  (see `unpkg` / `jsdelivr` in [`package.json`](package.json).)

---

## API (short reference)

| Export / global method | Role |
| ---------------------- | ---- |
| `snapshotBones(el, name?, config?)` | Returns one snapshot object (`width`, `height`, `bones`, …). |
| `mountSkeleton(container, snapshot, options?)` | Inserts skeleton DOM into `container`. |
| `skeletonHTML(snapshot, options?)` | Same layout as string HTML (for SSR or manual insert). |
| `boneClassList(bone)` | Tailwind class string for a single bone. |
| `pickBreakpoint(breakpoints, widthPx)` | Returns the snapshot object for the best matching key. |
| `toJSON(snapshotOrBundle)` | Pretty-printed JSON string (e.g. for download or textarea). |

Global namespace (IIFE): **`BoneyardTailwind`** with the same names as above.

---

## Output JSON shape

Each **snapshot** looks like this (values are examples):

```json
{
  "name": "card",
  "viewportWidth": 768,
  "width": 768,
  "height": 220,
  "bones": [
    { "x": 0, "y": 12, "w": 20.5, "h": 48, "r": "50%" },
    { "x": 28, "y": 16, "w": 65, "h": 20, "r": 8, "c": true }
  ]
}
```

| Field | Meaning |
| ----- | -------- |
| `x`, `w` | Horizontal position and width as **percentage** of the snapshot root width |
| `y`, `h` | Vertical position and height in **pixels** |
| `r` | Border radius (number = px, or `"50%"`, or a CSS string) |
| `c` | Optional; if `true`, drawn as a lighter “container” bone |

You can save that JSON in your app and call `mountSkeleton` while data is loading—no need to run `snapshotBones` in production unless you want a dev tool.

---

## Responsive layouts (breakpoints)

1. Resize the window (or capture on different devices).
2. Call `snapshotBones` at each width.
3. Store results under string keys (widths), e.g. `"375"`, `"768"`.

```json
{
  "breakpoints": {
    "375": { "name": "card", "viewportWidth": 375, "width": 375, "height": 200, "bones": [] },
    "768": { "name": "card", "viewportWidth": 768, "width": 768, "height": 220, "bones": [] }
  }
}
```

At runtime:

```js
const snapshot = pickBreakpoint(bundle.breakpoints, containerEl.offsetWidth)
mountSkeleton(host, snapshot)
```

---

## npm scripts

| Command | Result |
| ------- | ------ |
| `npm install` | Installs dev dependencies (e.g. `esbuild`). |
| `npm run build:iife` | Writes **`dist/boneyard-tailwind.min.js`** (minified IIFE). |
| `npm run build:iife:dev` | Writes **`dist/boneyard-tailwind.js`** plus source map. |

`prepublishOnly` runs the IIFE build before `npm publish`, so `dist` stays in sync if you publish to npm.

---

## License

MIT
