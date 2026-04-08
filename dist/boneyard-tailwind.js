var BoneyardTailwind = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    boneClassList: () => boneClassList,
    mountSkeleton: () => mountSkeleton,
    pickBreakpoint: () => pickBreakpoint,
    skeletonHTML: () => skeletonHTML,
    snapshotBones: () => snapshotBones,
    toJSON: () => toJSON
  });

  // src/snapshot.js
  var DEFAULT_LEAF_TAGS = /* @__PURE__ */ new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th"]);
  function parseBorderRadius(style, el) {
    const tl = parseFloat(style.borderTopLeftRadius) || 0;
    const tr = parseFloat(style.borderTopRightRadius) || 0;
    const br = parseFloat(style.borderBottomRightRadius) || 0;
    const bl = parseFloat(style.borderBottomLeftRadius) || 0;
    if (tl === 0 && tr === 0 && br === 0 && bl === 0) return void 0;
    const isSquarish = el ? (() => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4;
    })() : false;
    if (style.borderRadius === "50%") return "50%";
    const maxCorner = Math.max(tl, tr, br, bl);
    if (maxCorner > 9998) {
      return isSquarish ? "50%" : 9999;
    }
    if (tl === tr && tr === br && br === bl) {
      return tl !== 8 ? tl : void 0;
    }
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  function snapshotBones(el, name = "component", config = {}) {
    const rootRect = el.getBoundingClientRect();
    const bones = [];
    const leafTags = config.leafTags ? /* @__PURE__ */ new Set([...DEFAULT_LEAF_TAGS, ...config.leafTags]) : DEFAULT_LEAF_TAGS;
    const captureRoundedBorders = config.captureRoundedBorders ?? true;
    const excludeTags = config.excludeTags ? new Set(config.excludeTags) : null;
    const excludeSelectors = config.excludeSelectors ?? null;
    function walk(node) {
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;
      const tag = node.tagName.toLowerCase();
      if (excludeTags?.has(tag)) return;
      if (excludeSelectors?.some((sel) => node.matches(sel))) return;
      const children = [...node.children].filter((child) => {
        const cs = getComputedStyle(child);
        return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
      });
      const isMedia = tag === "img" || tag === "svg" || tag === "video" || tag === "canvas";
      const isFormEl = tag === "input" || tag === "button" || tag === "textarea" || tag === "select";
      const isLeaf = children.length === 0 || isMedia || isFormEl || leafTags.has(tag);
      const bg = style.backgroundColor;
      const hasBg = bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      const hasBgImage = style.backgroundImage !== "none";
      const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
      const hasBorder = captureRoundedBorders && borderTopWidth > 0 && style.borderTopColor !== "rgba(0, 0, 0, 0)" && style.borderTopColor !== "transparent";
      const hasBorderRadius = (parseFloat(style.borderTopLeftRadius) || 0) > 0;
      const hasVisualSurface = hasBg || hasBgImage || hasBorder && hasBorderRadius;
      const isTableNode = tag === "tr" || tag === "td" || tag === "th" || tag === "thead" || tag === "tbody" || tag === "table";
      if (isLeaf) {
        const rect = node.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const isSquarish = isMedia && rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4;
        const br = isTableNode ? 0 : isSquarish ? "50%" : parseBorderRadius(style, node) ?? 8;
        const rw = rootRect.width;
        bones.push({
          x: rw > 0 ? +((rect.left - rootRect.left) / rw * 100).toFixed(4) : 0,
          y: Math.round(rect.top - rootRect.top),
          w: rw > 0 ? +(rect.width / rw * 100).toFixed(4) : 0,
          h: Math.round(rect.height),
          r: br
        });
        return;
      }
      if (hasVisualSurface) {
        const rect = node.getBoundingClientRect();
        if (rect.width >= 1 && rect.height >= 1) {
          const br = isTableNode ? 0 : parseBorderRadius(style, node) ?? 8;
          const rw = rootRect.width;
          bones.push({
            x: rw > 0 ? +((rect.left - rootRect.left) / rw * 100).toFixed(4) : 0,
            y: Math.round(rect.top - rootRect.top),
            w: rw > 0 ? +(rect.width / rw * 100).toFixed(4) : 0,
            h: Math.round(rect.height),
            r: br,
            c: true
          });
        }
      }
      for (const child of children) {
        walk(child);
      }
    }
    for (const child of el.children) {
      walk(child);
    }
    return {
      name,
      viewportWidth: Math.round(rootRect.width),
      width: Math.round(rootRect.width),
      height: Math.round(rootRect.height),
      bones
    };
  }

  // src/render.js
  function radiusClass(r) {
    if (r === "50%") return "rounded-full";
    if (typeof r === "number") {
      if (r > 9998) return "rounded-full";
      return `rounded-[${r}px]`;
    }
    return `rounded-[${r}]`;
  }
  function bgClass(container) {
    return container ? "bg-slate-100 dark:bg-slate-800/80" : "bg-slate-200 dark:bg-slate-700";
  }
  function boneClassList(bone) {
    const { x, y, w, h, c } = bone;
    const r = bone.r;
    return [
      "absolute",
      "animate-pulse",
      "will-change-[opacity]",
      bgClass(!!c),
      radiusClass(r),
      `left-[${x}%]`,
      `top-[${y}px]`,
      `w-[${w}%]`,
      `h-[${h}px]`
    ].join(" ");
  }
  function skeletonHTML(result, opts = {}) {
    const rootExtra = opts.extraRootClass ?? "";
    const h = result.height;
    const bones = result.bones.map(
      (b) => `<div class="${boneClassList(b).replace(/"/g, "&quot;")}" role="presentation" aria-hidden="true"></div>`
    ).join("");
    return `<div class="relative w-full overflow-hidden ${rootExtra}" style="min-height:${h}px">${bones}</div>`;
  }
  function mountSkeleton(container, result, opts = {}) {
    const wrap = document.createElement("div");
    wrap.innerHTML = skeletonHTML(result, opts).trim();
    const el = wrap.firstElementChild;
    if (!el) return;
    if (opts.replace) {
      container.replaceChildren(el);
    } else {
      container.appendChild(el);
    }
  }
  function pickBreakpoint(breakpoints, containerWidth) {
    const keys = Object.keys(breakpoints).map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
    if (keys.length === 0) return void 0;
    let chosen = keys[0];
    for (const k of keys) {
      if (k <= containerWidth) chosen = k;
    }
    return breakpoints[String(chosen)];
  }
  function toJSON(result) {
    return JSON.stringify(result, null, 2);
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=boneyard-tailwind.js.map
