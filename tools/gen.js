// Generate src/ for one device group from template/ (tiny preprocessor, no runtime cost):
//   $(N)        -> round(N dp * k) + 'px'       (k = px per dp: round/pro 2.0, bands 1.625 — same as v3 previews)
//   $[expr]     -> JS expression evaluated with the device context below (W, H, k, CW, dp(), round, pill, rect, css helpers)
//   #if expr / #elif expr / #else / #endif   (inside <!-- -->, /* */ or // comments, one per line)
//   #include name   (inline template/partials/name, recursively preprocessed)
//   #set name = expr (define a context variable for the rest of the file)
// designWidth = physical screen width (VELA_DEV_SPEC §7.2), so px in CSS == physical px.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), TPL = path.join(ROOT, 'template'), SRC = path.join(ROOT, 'src');
const DEV = JSON.parse(fs.readFileSync(path.join(__dirname, 'devices.json')));
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'meta.json')));
const { C, T } = require('./tokens.js'); const G = require('./geom.js');
const id = process.argv[2] || 'round'; const d = DEV[id]; if (!d) throw new Error('unknown device ' + id);
const png = n => { const b = fs.readFileSync(path.join(ROOT, 'assets', id, n + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

function context() {
  const k = d.k, W = d.W, H = d.H, Wdp = W / k, Hdp = H / k, P = G.pad(Wdp, Hdp);
  const dp = v => Math.round(v * k);
  const round = d.shape === 'circle', pill = d.shape === 'pill', rect = d.shape === 'rect';
  const ctx = { id, W, H, k, Wdp, Hdp, dp, round, pill, rect, shape: d.shape, C,
    HP: dp(P.h), VP: dp(P.v), CW: W - 2 * dp(P.h), ICS: dp(round ? 32 : 24),
    BPL: dp(round ? 12 : pill ? 8 : 10), BPR: dp(pill ? 10 : 14) };
  ctx.LABW = ctx.CW - ctx.BPL - ctx.ICS - dp(6) - ctx.BPR - 2;
  ctx.LABW2 = ctx.CW - 2 * dp(pill ? 10 : 14) - dp(24) - dp(6) - 2;      // label width next to a 24dp icon
  ctx.png = png;
  // ---- TimeText: curved = one <text> per glyph rotated about the screen/arc centre (v3 §8.3.2 item 5) ----
  ctx.ttCss = () => {
    const fs_ = dp(15), L = dp(18), col = C.timeText;
    if (rect) return `.tt-rect{position:absolute;left:0px;top:${dp(2)}px;width:${W}px;height:${L}px;justify-content:center;}
.tt-str{font-size:${fs_}px;line-height:${L}px;height:${L}px;color:${col};font-weight:bold;text-align:center;padding-left:${dp(6)}px;padding-right:${dp(6)}px;background-color:#000000;border-width:1px;border-color:#000000;border-radius:${L / 2}px;}`;
    const cx = W / 2, cy = round ? H / 2 : W / 2, rTop = W / 2 - dp(2) - dp(2), rMid = rTop - L / 2;
    const adv = [0.62, 0.62, 0.32, 0.62, 0.62].map(a => Math.round(a * fs_)); const tot = adv.reduce((a, b) => a + b, 0);
    let acc = -tot / 2, out = `.tt-bg{position:absolute;left:0px;top:0px;width:${png('timetext_bg')[0]}px;height:${png('timetext_bg')[1]}px;}\n`;
    adv.forEach((a, i) => { const mid = acc + a / 2; acc += a; const deg = (mid / rMid * 180 / Math.PI).toFixed(2);
      out += `.tt${i}{position:absolute;left:${Math.round(cx - a / 2)}px;top:${Math.round(cy - rTop)}px;width:${a}px;height:${L}px;transform:rotate(${deg}deg);transform-origin:${a / 2}px ${rTop}px;}\n`; });
    return out + `.ttc{width:${Math.max(...adv)}px;height:${L}px;font-size:${fs_}px;line-height:${L}px;color:${col};font-weight:bold;text-align:center;}\n`;
  };
  // ---- ScrollIndicator: arc PNGs on round (thumb rotated about screen centre), straight bars elsewhere ----
  ctx.META = META;
  ctx.siFrac = 5;
  ctx.siThumbLen = () => round ? META[id]['thumb' + ctx.siFrac].len : Math.round(dp(50) * ctx.siFrac / 10);
  ctx.siCss = () => {
    if (round) { const m = META[id].scroll, [tw, th] = png('scroll_track_arc'), [qw, qh] = png('si_thumb_' + ctx.siFrac);
      const ql = W - qw, qt = Math.round(H / 2 - qh / 2);
      return `.si-track{position:absolute;left:${W - tw}px;top:${Math.round(H / 2 - th / 2)}px;width:${tw}px;height:${th}px;}
.si-thumb{position:absolute;left:${ql}px;top:${qt}px;width:${qw}px;height:${qh}px;transform:rotate(0deg);transform-origin:${W / 2 - ql}px ${H / 2 - qt}px;}`; }
    const w = dp(Wdp >= 225 ? 6 : 5), L = dp(50), x = W - dp(2) - w - (pill ? dp(3) : 0), y0 = Math.round(H / 2 - L / 2), tl = ctx.siThumbLen();
    return `.si-track{position:absolute;left:${x}px;top:${y0}px;width:${w}px;height:${L}px;background-color:${C.scrollTrack};border-width:1px;border-color:${C.scrollTrack};border-radius:${w / 2}px;}
.si-thumb{position:absolute;left:${x}px;top:${y0}px;width:${w}px;height:${tl}px;background-color:${C.scrollThumb};border-width:1px;border-color:${C.scrollThumb};border-radius:${w / 2}px;}`;
  };
  ctx.siJs = () => { // constants the runtime needs to place the thumb
    if (round) { const m = META[id].scroll, tl = ctx.siThumbLen(); return `{round:true,L:${m.L},tl:${tl},Ra:${m.Ra}}`; }
    return `{round:false,L:${dp(50)},tl:${ctx.siThumbLen()},y0:${Math.round(H / 2 - dp(50) / 2)}}`;
  };
  // ---- EdgeButton (Small 56dp) exact androidx shape PNG + 32dp icon; 3dp from bottom edge ----
  ctx.ebCss = () => { const [w, h] = png('edge_button'), [iw] = png('check_onPrimary_32'), top = H - dp(3) - h, [sw, sh] = png('scrim');
    const cyc = dp(6) + (h - dp(14)) / 2;
    return `.eb{position:absolute;left:${Math.round((W - w) / 2)}px;top:${top}px;width:${w}px;height:${h}px;}
.eb-img{position:absolute;left:0px;top:0px;width:${w}px;height:${h}px;}
.eb-ic{position:absolute;left:${Math.round((w - iw) / 2)}px;top:${Math.round(cyc - iw / 2)}px;width:${iw}px;height:${iw}px;}
.scrim{position:absolute;left:0px;top:${H - sh - dp(3) - h + dp(20)}px;width:${sw}px;height:${sh}px;}
.scrim2{position:absolute;left:0px;top:${H - dp(3) - h + dp(20)}px;width:${W}px;height:${h - dp(17)}px;background-color:#000000;}`; };
  ctx.EBH = png('edge_button')[1] + dp(3);
  // bottom padding of the EdgeButton list: keep the last item above the scrim (the scrim image swallows taps)
  ctx.EBPAD = png('scrim')[1] + dp(3) + png('edge_button')[1] - dp(20) + dp(4);
  // ---- AlertDialog (v3 dialog(): icon 24, titleMedium, bodyMedium, dismiss 60dp tonal r18, confirm 63x54 pill rotated -45°) ----
  ctx.dlgCss = () => { const s = pill ? 0.8 : 1, sp = v => dp(v * s);
    const pTitle = Math.round(W * 0.12), pText = Math.round(W * 0.0416), cpad = ctx.HP;
    const iconTop = round ? dp(22) : pill ? Math.round(W * 0.30) : dp(28);
    const btnH = sp(61), btnTop = H - dp(Math.ceil(Hdp * 0.10)) - btnH - (pill ? Math.round(W * 0.18) : 0);
    const dW = sp(60), cW = sp(63), cH = sp(54), gap = Math.round(W * 0.03);
    const rowW = sp(6) + sp(61) + gap + cW + sp(2), rowL = Math.round((W - rowW) / 2);
    const cl = rowL + sp(6) + sp(61) + gap, ccy = btnTop + btnH / 2, [ci] = png('check_onPrimary_28'), [xi] = png('close_primary_28');
    const tw = W - 2 * cpad - 2 * (pill ? 0 : pTitle), bw = W - 2 * cpad - 2 * pText;
    return `.dlg-col{position:absolute;left:0px;top:${iconTop}px;width:${W}px;flex-direction:column;align-items:center;}
.dlg-title{width:${tw}px;text-align:center;margin-top:${dp(4)}px;lines:3;}
.dlg-text{width:${bw}px;text-align:center;margin-top:${dp(8)}px;lines:3;}
.dlg-x{position:absolute;left:${rowL + sp(6) + sp(1)}px;top:${btnTop + sp(1)}px;width:${dW}px;height:${dW}px;background-color:${C.surfaceContainer};border-width:1px;border-color:${C.surfaceContainer};border-radius:${sp(18)}px;justify-content:center;align-items:center;}
.dlg-ok{position:absolute;left:${cl}px;top:${Math.round(ccy - cH / 2)}px;width:${cW}px;height:${cH}px;background-color:${C.primary};border-width:1px;border-color:${C.primary};border-radius:${cH / 2}px;transform:rotate(-45deg);transform-origin:${cW / 2}px ${cH / 2}px;}
.dlg-okp{background-color:${C.primaryDim};border-color:${C.primaryDim};}
.ic28{width:${xi}px;height:${xi}px;}
.dlg-okic{position:absolute;left:${Math.round(cl + cW / 2 - ci / 2)}px;top:${Math.round(ccy - ci / 2)}px;width:${ci}px;height:${ci}px;}`; };
  // ---- SuccessConfirmation (v3 confirm(): pill rotated 45°, #210F48, check 52dp primary, curved / linear "已保存") ----
  ctx.cfCss = () => { const cw = Math.round(W * (1 - 2 * 0.2315)), ch = round ? Math.round(H * (1 - 2 * 0.176)) : Math.round(cw * 1.21);
    const cy = round ? H / 2 : pill ? H / 2 - dp(10) : H / 2 - dp(16), [iw] = png('check_primary_52'); const bb = (cw + ch) / Math.SQRT2;
    let txt = round ? `.cf-txt{position:absolute;left:0px;top:${H - png('curved_saved')[1]}px;width:${W}px;height:${png('curved_saved')[1]}px;}`
      : `.cf-txt{position:absolute;left:0px;top:${Math.round(cy + bb / 2 + dp(8))}px;width:${W}px;justify-content:center;}`;
    return `.cf-pop{position:absolute;left:0px;top:${Math.round(cy - H / 2)}px;width:${W}px;height:${H}px;justify-content:center;align-items:center;}
.cf-blob{width:${cw}px;height:${ch}px;background-color:${C.onPrimary};border-width:1px;border-color:${C.onPrimary};border-radius:${cw / 2}px;transform:rotate(45deg);transform-origin:${cw / 2}px ${ch / 2}px;}
.cf-ic{position:absolute;left:${Math.round(W / 2 - iw / 2)}px;top:${Math.round(cy - iw / 2)}px;width:${iw}px;height:${iw}px;}
${txt}`; };
  return ctx;
}

// expand $[expr] with balanced brackets
function expand(t, ctx) {
  let r = '', i = 0;
  while (true) {
    const j = t.indexOf('$[', i); if (j < 0) return r + t.slice(i);
    let depth = 0, e = j + 1;
    for (; e < t.length; e++) { if (t[e] === '[') depth++; else if (t[e] === ']') { depth--; if (depth === 0) break; } }
    r += t.slice(i, j) + String(evalIn(ctx, t.slice(j + 2, e))); i = e + 1;
  }
}
function evalIn(ctx, expr) { return Function(...Object.keys(ctx), `return (${expr});`)(...Object.values(ctx)); }
const DIR = /^\s*(?:<!--|\/\*|\/\/)\s*#(if|elif|else|endif|include|set)\b\s*(.*?)\s*(?:-->|\*\/)?\s*$/;
function pp(text, ctx) {
  const out = [], st = []; const on = () => st.every(s => s.active);
  for (const line of text.split('\n')) {
    const m = line.match(DIR);
    if (!m) { if (on()) out.push(line); continue; }
    const [, kw, arg] = m;
    if (kw === 'if') { const parent = on(); const v = parent && !!evalIn(ctx, arg); st.push({ active: v, taken: v }); }
    else if (kw === 'elif') { const s = st[st.length - 1]; if (s.taken) s.active = false; else { s.active = !!evalIn(ctx, arg); s.taken = s.active; } }
    else if (kw === 'else') { const s = st[st.length - 1]; s.active = !s.taken; s.taken = true; }
    else if (kw === 'endif') st.pop();
    else if (!on()) continue;
    else if (kw === 'include') out.push(pp(fs.readFileSync(path.join(TPL, 'partials', arg), 'utf8'), ctx));
    else if (kw === 'set') { const [n, ...e] = arg.split('='); ctx[n.trim()] = evalIn(ctx, e.join('=')); }
  }
  if (st.length) throw new Error('unbalanced #if');
  return expand(out.join('\n'), ctx)
    .replace(/\$\((\d+(?:\.\d+)?)\)/g, (_, v) => Math.round(+v * ctx.k) + 'px');
}

// ---- CSS tree-shaking: every page inlines m3.css, so drop class rules / keyframes the page never references ----
function shakeUx(src) {
  const a = src.indexOf('<style>'), b = src.indexOf('</style>');
  if (a < 0 || b < 0) return src;
  const css = src.slice(a + 7, b).replace(/\/\*[\s\S]*?\*\//g, '');
  const rest = src.slice(0, a) + src.slice(b);
  const used = new Set(rest.match(/[A-Za-z0-9_-]+/g) || []);
  const blocks = []; let i = 0;
  while (i < css.length) {
    const o = css.indexOf('{', i); if (o < 0) break;
    const sel = css.slice(i, o).trim(); let d = 1, j = o + 1;
    while (j < css.length && d) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
    blocks.push([sel, css.slice(o, j)]); i = j;
  }
  const kept = blocks.filter(([sel]) => sel.startsWith('@') || sel.split(',').some(x => { const m = x.trim().match(/^\.([A-Za-z0-9_-]+)$/); return !m || used.has(m[1]); }));
  const anims = new Set(); kept.forEach(([sel, body]) => { if (!sel.startsWith('@')) (body.match(/animation-name:\s*([A-Za-z0-9_-]+)/g) || []).forEach(x => anims.add(x.split(':')[1].trim())); });
  const out = kept.filter(([sel]) => !sel.startsWith('@keyframes') || anims.has(sel.split(/\s+/)[1])).map(([s1, b1]) => s1 + ' ' + b1.replace(/\s*\n\s*/g, ' ')).join('\n');
  return src.slice(0, a + 7) + '\n' + out + '\n' + src.slice(b);
}

// ---- run ----
fs.rmSync(SRC, { recursive: true, force: true });
const used = new Set();
(function walk(rel) {
  for (const f of fs.readdirSync(path.join(TPL, rel))) {
    const r = path.join(rel, f), abs = path.join(TPL, r);
    if (r.startsWith('partials')) continue;
    if (fs.statSync(abs).isDirectory()) { walk(r); continue; }
    fs.mkdirSync(path.dirname(path.join(SRC, r)), { recursive: true });
    if (/\.(ux|js|json|css|tpl)$/.test(f)) { let t = pp(fs.readFileSync(abs, 'utf8'), context()); if (/\.ux\.tpl$/.test(f)) t = shakeUx(t); fs.writeFileSync(path.join(SRC, r.replace('manifest.tpl.json', 'manifest.json').replace(/\.ux\.tpl$/, '.ux')), t);
      for (const m of t.matchAll(/\/common\/img\/([\w]+)\.png/g)) used.add(m[1]); }
    else fs.copyFileSync(abs, path.join(SRC, r));
  }
})('');
// copy only the PNGs that the generated code references (keeps the rpk small)
fs.mkdirSync(path.join(SRC, 'common', 'img'), { recursive: true });
for (const n of used) { const s = path.join(ROOT, 'assets', id, n + '.png'); if (!fs.existsSync(s)) throw new Error('missing asset ' + n); fs.copyFileSync(s, path.join(SRC, 'common', 'img', n + '.png')); }
fs.copyFileSync(path.join(ROOT, 'assets', id, 'logo.png'), path.join(SRC, 'common', 'logo.png'));
console.log(`[gen] ${id} ${d.W}x${d.H} -> src/ (${used.size} images)`);
