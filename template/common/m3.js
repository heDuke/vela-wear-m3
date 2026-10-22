// Shared runtime helpers (device group: $[id], $[W]x$[H], k=$[k] px/dp).
// Pure functions only — nothing here is bound to a page ViewModel (memory best practice, SPEC §9.2).
export const DEV = { id: '$[id]', W: $[W], H: $[H], k: $[k], shape: '$[shape]' }

// TransformingLazyColumn (lazy/ResponsiveTransformationSpec.kt + TransitionAreaProgress.kt),
// interpolated between the 192dp and 240dp specs by screen height in dp. Same maths as preview/v3/src/geom.js.
const HDP = $[Hdp]
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const inv = (a, b, v) => clamp01((v - a) / (b - a))
const SP = (function () {
  const S = [0.2, 0.6, 0.35, 0.55, 0.7, 0.5], L = [0.15, 0.45, 0.4, 0.6, 0.6, 0.5], p = inv(192, 240, HDP)
  return S.map((v, i) => lerp(v, L[i], p))
})()
// cubic-bezier(0.3, 0, 0.7, 1) evaluated by bisection
function ease(t) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  let lo = 0, hi = 1, u = t
  for (let i = 0; i < 18; i++) {
    u = (lo + hi) / 2
    const x = 3 * (1 - u) * (1 - u) * u * 0.3 + 3 * (1 - u) * u * u * 0.7 + u * u * u
    if (x < t) lo = u
    else hi = u
  }
  return 3 * (1 - u) * u * u + u * u * u
}
// top/bottom: item edges in px relative to the viewport top. Returns [scale, alpha].
export function tlc(top, bottom) {
  const H = $[H], t = top / H, b = bottom / H, rel = b - t
  const sr = inv(SP[0], SP[1], rel)
  const line = Math.min(lerp(SP[2], SP[3], sr), (1 + rel) / 2)
  let enc
  if (b < 1 - t) enc = Math.min(b / line - 1, 0)
  else enc = Math.max(1 - (1 - t) / line, 0)
  if (enc === 0) return [1, 1]
  const e = ease(clamp01(enc < 0 ? enc + 1 : 1 - enc))
  return [lerp(SP[4], 1, e), lerp(SP[5], 1, e)]
}
export function tlcStyle(top, bottom) {
  const r = tlc(top, bottom)
  const s = Math.round(r[0] * 100) / 100
  return { transform: JSON.stringify({ scaleX: s, scaleY: s }), opacity: Math.round(r[1] * 100) / 100 }
}
export const IDENT = { transform: JSON.stringify({ scaleX: 1, scaleY: 1 }), opacity: 1 }

// ScrollIndicator thumb placement; SI = per-page constants (thumb length differs per page), pos 0..1
export function siStyle(SI, pos) {
  pos = clamp01(pos)
  if (SI.round) {
    const along = -SI.L / 2 + SI.tl / 2 + (SI.L - SI.tl) * pos
    const deg = Math.round((along / SI.Ra) * 18000 / Math.PI) / 100
    return { transform: JSON.stringify({ rotate: deg + 'deg' }) }
  }
  return { top: Math.round(SI.y0 + (SI.L - SI.tl) * pos) + 'px' }
}

export function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}
