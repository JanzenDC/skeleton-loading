/**
 * Render bones with Tailwind utilities only (arbitrary values for geometry).
 * Requires Tailwind (CDN JIT or build) so dynamic classes are generated.
 */

/**
 * @typedef {{ x: number, y: number, w: number, h: number, r: number|string, c?: boolean }} Bone
 * @typedef {{ name: string, viewportWidth: number, width: number, height: number, bones: Bone[] }} SkeletonResult
 */

/**
 * Tailwind class fragment for border radius from bone.r
 * @param {number|string} r
 */
function radiusClass(r) {
  if (r === '50%') return 'rounded-full'
  if (typeof r === 'number') {
    if (r > 9998) return 'rounded-full'
    return `rounded-[${r}px]`
  }
  return `rounded-[${r}]`
}

/**
 * Background: container bones slightly lighter
 * @param {boolean} [container]
 */
function bgClass(container) {
  return container
    ? 'bg-slate-100 dark:bg-slate-800/80'
    : 'bg-slate-200 dark:bg-slate-700'
}

/**
 * @param {Bone} bone
 * @returns {string}
 */
export function boneClassList(bone) {
  const { x, y, w, h, c } = bone
  const r = bone.r
  return [
    'absolute',
    'animate-pulse',
    'will-change-[opacity]',
    bgClass(!!c),
    radiusClass(r),
    `left-[${x}%]`,
    `top-[${y}px]`,
    `w-[${w}%]`,
    `h-[${h}px]`,
  ].join(' ')
}

/**
 * @param {SkeletonResult} result
 * @param {{ extraRootClass?: string }} [opts]
 * @returns {string} HTML string (safe if bone coords are numeric from snapshot)
 */
export function skeletonHTML(result, opts = {}) {
  const rootExtra = opts.extraRootClass ?? ''
  const h = result.height
  const bones = result.bones
    .map(
      (b) =>
        `<div class="${boneClassList(b).replace(/"/g, '&quot;')}" role="presentation" aria-hidden="true"></div>`
    )
    .join('')
  return `<div class="relative w-full overflow-hidden ${rootExtra}" style="min-height:${h}px">${bones}</div>`
}

/**
 * @param {ParentNode} container
 * @param {SkeletonResult} result
 * @param {{ extraRootClass?: string, replace?: boolean }} [opts]
 */
export function mountSkeleton(container, result, opts = {}) {
  const wrap = document.createElement('div')
  wrap.innerHTML = skeletonHTML(result, opts).trim()
  const el = wrap.firstElementChild
  if (!el) return
  if (opts.replace) {
    container.replaceChildren(el)
  } else {
    container.appendChild(el)
  }
}

/**
 * Pick best snapshot for container width (max breakpoint <= width).
 * @param {Record<string, SkeletonResult>} breakpoints
 * @param {number} containerWidth
 */
export function pickBreakpoint(breakpoints, containerWidth) {
  const keys = Object.keys(breakpoints)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
  if (keys.length === 0) return undefined
  let chosen = keys[0]
  for (const k of keys) {
    if (k <= containerWidth) chosen = k
  }
  return breakpoints[String(chosen)]
}

/**
 * @param {SkeletonResult} result
 * @returns {string}
 */
export function toJSON(result) {
  return JSON.stringify(result, null, 2)
}
