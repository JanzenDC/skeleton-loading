/**
 * DOM snapshot → bone layout (Boneyard-style).
 * Bones use % width relative to root, px for y/h (matches 0xGF/boneyard snapshot output).
 */

const DEFAULT_LEAF_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'])

/**
 * @typedef {{ x: number, y: number, w: number, h: number, r: number|string, c?: boolean }} Bone
 * @typedef {{ name: string, viewportWidth: number, width: number, height: number, bones: Bone[] }} SkeletonResult
 * @typedef {{
 *   leafTags?: string[],
 *   captureRoundedBorders?: boolean,
 *   excludeTags?: string[],
 *   excludeSelectors?: string[],
 * }} SnapshotConfig
 */

/**
 * @param {CSSStyleDeclaration} style
 * @param {Element} [el]
 * @returns {number|string|undefined}
 */
function parseBorderRadius(style, el) {
  const tl = parseFloat(style.borderTopLeftRadius) || 0
  const tr = parseFloat(style.borderTopRightRadius) || 0
  const br = parseFloat(style.borderBottomRightRadius) || 0
  const bl = parseFloat(style.borderBottomLeftRadius) || 0

  if (tl === 0 && tr === 0 && br === 0 && bl === 0) return undefined

  const isSquarish = el
    ? (() => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4
      })()
    : false

  if (style.borderRadius === '50%') return '50%'

  const maxCorner = Math.max(tl, tr, br, bl)
  if (maxCorner > 9998) {
    return isSquarish ? '50%' : 9999
  }

  if (tl === tr && tr === br && br === bl) {
    return tl !== 8 ? tl : undefined
  }

  return `${tl}px ${tr}px ${br}px ${bl}px`
}

/**
 * @param {Element} el
 * @param {string} [name]
 * @param {SnapshotConfig} [config]
 * @returns {SkeletonResult}
 */
export function snapshotBones(el, name = 'component', config = {}) {
  const rootRect = el.getBoundingClientRect()
  /** @type {Bone[]} */
  const bones = []

  const leafTags = config.leafTags
    ? new Set([...DEFAULT_LEAF_TAGS, ...config.leafTags])
    : DEFAULT_LEAF_TAGS
  const captureRoundedBorders = config.captureRoundedBorders ?? true
  const excludeTags = config.excludeTags ? new Set(config.excludeTags) : null
  const excludeSelectors = config.excludeSelectors ?? null

  /**
   * @param {Element} node
   */
  function walk(node) {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return

    const tag = node.tagName.toLowerCase()

    if (excludeTags?.has(tag)) return
    if (excludeSelectors?.some((sel) => node.matches(sel))) return

    const children = [...node.children].filter((child) => {
      const cs = getComputedStyle(child)
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0'
    })

    const isMedia = tag === 'img' || tag === 'svg' || tag === 'video' || tag === 'canvas'
    const isFormEl = tag === 'input' || tag === 'button' || tag === 'textarea' || tag === 'select'
    const isLeaf = children.length === 0 || isMedia || isFormEl || leafTags.has(tag)

    const bg = style.backgroundColor
    const hasBg = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
    const hasBgImage = style.backgroundImage !== 'none'
    const borderTopWidth = parseFloat(style.borderTopWidth) || 0
    const hasBorder =
      captureRoundedBorders &&
      borderTopWidth > 0 &&
      style.borderTopColor !== 'rgba(0, 0, 0, 0)' &&
      style.borderTopColor !== 'transparent'
    const hasBorderRadius = (parseFloat(style.borderTopLeftRadius) || 0) > 0
    const hasVisualSurface = hasBg || hasBgImage || (hasBorder && hasBorderRadius)

    const isTableNode =
      tag === 'tr' || tag === 'td' || tag === 'th' || tag === 'thead' || tag === 'tbody' || tag === 'table'

    if (isLeaf) {
      const rect = node.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      const isSquarish =
        isMedia && rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4
      const br = isTableNode ? 0 : isSquarish ? '50%' : (parseBorderRadius(style, node) ?? 8)
      const rw = rootRect.width
      bones.push({
        x: rw > 0 ? +((rect.left - rootRect.left) / rw * 100).toFixed(4) : 0,
        y: Math.round(rect.top - rootRect.top),
        w: rw > 0 ? +((rect.width / rw) * 100).toFixed(4) : 0,
        h: Math.round(rect.height),
        r: br,
      })
      return
    }

    if (hasVisualSurface) {
      const rect = node.getBoundingClientRect()
      if (rect.width >= 1 && rect.height >= 1) {
        const br = isTableNode ? 0 : (parseBorderRadius(style, node) ?? 8)
        const rw = rootRect.width
        bones.push({
          x: rw > 0 ? +((rect.left - rootRect.left) / rw * 100).toFixed(4) : 0,
          y: Math.round(rect.top - rootRect.top),
          w: rw > 0 ? +((rect.width / rw) * 100).toFixed(4) : 0,
          h: Math.round(rect.height),
          r: br,
          c: true,
        })
      }
    }

    for (const child of children) {
      walk(child)
    }
  }

  for (const child of el.children) {
    walk(child)
  }

  return {
    name,
    viewportWidth: Math.round(rootRect.width),
    width: Math.round(rootRect.width),
    height: Math.round(rootRect.height),
    bones,
  }
}
