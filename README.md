# boneyard-tailwind

Vanilla JS helpers to **snapshot rendered DOM** into skeleton “bones” and **render them with Tailwind CSS only** (pulse placeholders, arbitrary position/size utilities). Inspired by the idea behind [0xGF/boneyard](https://github.com/0xGF/boneyard), without React.

## Features

- `snapshotBones(element)` — reads layout from the browser, outputs JSON-friendly bone rects (`x`/`w` as % of root, `y`/`h` in px).
- `mountSkeleton` / `skeletonHTML` — builds markup using Tailwind classes (`animate-pulse`, `bg-slate-*`, `left-[…%]`, etc.).
- `pickBreakpoint` — choose the best snapshot when you store multiple widths under `breakpoints`.

## Requirements

- **Tailwind** must be available where the skeleton renders (e.g. [Tailwind CDN](https://cdn.tailwindcss.com) for JIT, or your own build). Dynamic classes are mostly **arbitrary values**; if you use a static build, **safelist** or scan generated HTML so they are not purged.

## Try the demo

Serve the folder over HTTP (ES modules), then open:

`demo/index.html`

Example with XAMPP: `http://localhost/projects/random/skeleton-loading/demo/index.html`  
IIFE smoke test: `demo/cdn.html` (requires `npm run build:iife` first).

## Usage (ES module)

```js
import { snapshotBones, mountSkeleton } from './src/index.js'

const root = document.getElementById('card')
const target = document.getElementById('skeleton-host')

const data = snapshotBones(root, 'card')
mountSkeleton(target, data)
```

## Usage (script tag) — GitHub + jsDelivr

[jsDelivr](https://www.jsdelivr.com/?docs=gh) can serve any file from a public GitHub repo. That is a simple way to use this project as a CDN without npm or your own server.

### 1. Build and commit the bundle

```bash
npm run build:iife
git add dist/boneyard-tailwind.min.js
git commit -m "Add IIFE bundle for jsDelivr"
git push
```

Keep `dist/boneyard-tailwind.min.js` in the repo so the CDN URL always has a file to serve.

### 2. URL pattern

```
https://cdn.jsdelivr.net/gh/GITHUB_USER/GITHUB_REPO@REF/dist/boneyard-tailwind.min.js
```

Replace **`GITHUB_USER`**, **`GITHUB_REPO`**, and **`REF`**:

- **`REF`** = branch name (e.g. `main`) for latest, or a **git tag** (e.g. `v0.1.0`) / **commit SHA** for a stable, cache-friendly production URL.

### 3. Embed in your page

The IIFE exposes a global **`BoneyardTailwind`**: `snapshotBones`, `mountSkeleton`, `skeletonHTML`, `boneClassList`, `pickBreakpoint`, `toJSON`.

Load **Tailwind** first (this repo does not ship CSS), then the script, then your code:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/gh/GITHUB_USER/GITHUB_REPO@v0.1.0/dist/boneyard-tailwind.min.js"></script>
<script>
  const data = BoneyardTailwind.snapshotBones(document.getElementById('card'), 'card')
  BoneyardTailwind.mountSkeleton(document.getElementById('skeleton-host'), data)
</script>
```

### Other hosting (optional)

- **Self-hosted** — Upload `dist/boneyard-tailwind.min.js` anywhere and point `src` at that URL.
- **npm** — After `npm publish`, use e.g. `https://cdn.jsdelivr.net/npm/boneyard-tailwind@0.1.0/dist/boneyard-tailwind.min.js` (see `unpkg` / `jsdelivr` in `package.json`).

Local smoke test (no GitHub): open `demo/cdn.html` over HTTP; it loads `../dist/boneyard-tailwind.min.js`.

## Responsive snapshots

Resize the viewport (or capture in different sessions), snapshot each time, and merge:

```json
{
  "breakpoints": {
    "375": { "name": "card", "viewportWidth": 375, "width": 375, "height": 200, "bones": [] },
    "768": { "name": "card", "viewportWidth": 768, "width": 768, "height": 220, "bones": [] }
  }
}
```

At runtime: `pickBreakpoint(bundle.breakpoints, containerEl.offsetWidth)` then `mountSkeleton(…)`.

## Scripts

| Command              | Output                          |
| -------------------- | ------------------------------- |
| `npm install`        | Installs `esbuild` (dev).       |
| `npm run build:iife` | Minified `dist/boneyard-tailwind.min.js`. |
| `npm run build:iife:dev` | `dist/boneyard-tailwind.js` + source map. |

## License

MIT
