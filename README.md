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

## Usage (script tag / CDN)

The IIFE build exposes a global **`BoneyardTailwind`** with: `snapshotBones`, `mountSkeleton`, `skeletonHTML`, `boneClassList`, `pickBreakpoint`, `toJSON`.

Always load **Tailwind** before or with your page (this library does not ship Tailwind CSS). Order matters: Tailwind first, then this script, then your code.

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://YOUR-CDN/boneyard-tailwind.min.js"></script>
<script>
  const data = BoneyardTailwind.snapshotBones(document.getElementById('card'), 'card')
  BoneyardTailwind.mountSkeleton(document.getElementById('skeleton-host'), data)
</script>
```

### Ways to host the file

1. **Your own server / CDN** — Run `npm run build:iife`, upload `dist/boneyard-tailwind.min.js`, use your absolute URL in `src`.
2. **GitHub + jsDelivr** — Commit `dist/boneyard-tailwind.min.js`, then (replace user, repo, branch):
   `https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH/dist/boneyard-tailwind.min.js`  
   Pin a tag or commit hash instead of `main` for stable production URLs.
3. **npm + jsDelivr / unpkg** — After `npm publish`, the `unpkg` / `jsdelivr` fields in `package.json` point CDNs at the minified bundle, e.g.  
   `https://cdn.jsdelivr.net/npm/boneyard-tailwind@0.1.0/dist/boneyard-tailwind.min.js`

A minimal local check (no modules): open `demo/cdn.html` over HTTP; it loads `../dist/boneyard-tailwind.min.js`.

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
