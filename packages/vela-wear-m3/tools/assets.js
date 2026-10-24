// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Per-device PNG assets in physical px (designWidth = physical width), same pipeline as
// vela-notes/preview/v3/src/assets3.js: Material Symbols Rounded (Apache-2.0) rendered in fixed M3 colours
// (Vela <image> cannot tint), EdgeButton shape from androidx EdgeButtonShape math, round ScrollIndicator arcs,
// curved TimeText background, curved "已保存", spinner arc. PNG8-quantised afterwards by quant.py.
// v3 PNGs that already exist are copied 1:1 (edge_button, curved_saved, check/close/delete icons).
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V3 = process.env.V3_DIR || path.join(__dirname, 'v3');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'devices.json')));
const { C } = require('./tokens.js'); const G = require('./geom.js');
const FONT = `@font-face{font-family:GSF;src:url(file://${V3}/fonts/GoogleSansFlex.ttf);} `;
const REUSE = ['edge_button', 'curved_saved', 'check_onPrimary_32', 'check_onPrimary_28', 'close_primary_28', 'delete_onBackground_24', 'check_primary_52', 'scroll_track_arc'];
// [file, svg, colorRole, dp(round/rect), dp(pill)]  (section icons: 20dp in 32dp circle on round, 16 in 24 elsewhere — v3 rule)
const SEC = [['sec_buttons', 'smart_button', 'onPrimary'], ['sec_cards', 'view_agenda', 'onSecondary'], ['sec_list', 'list', 'onTertiary'],
  ['sec_edge', 'vertical_align_bottom', 'onPrimary'], ['sec_time', 'schedule', 'onSecondary'], ['sec_toggles', 'toggle_on', 'onTertiary'],
  ['sec_dialogs', 'chat_bubble', 'onPrimary'], ['sec_motion', 'animation', 'onSecondary'],
  ['li_music', 'music_note', 'onPrimary'], ['li_alarm', 'alarm', 'onSecondary'], ['li_water', 'water_drop', 'onTertiary'],
  ['li_run', 'directions_run', 'onTertiary'], ['li_star', 'star', 'onPrimary']];
const ICONS = [
  ...SEC.map(([f, s, c]) => [f, s, c, 20, 16]),
  ['favorite_onPrimary_24', 'favorite', 'onPrimary', 24, 24], ['star_primary_24', 'star', 'primary', 24, 24],
  ['alarm_primary_24', 'alarm', 'primary', 24, 24], ['info_primary_24', 'info', 'primary', 24, 24],
  ['play_onPrimary_26', 'play_arrow', 'onPrimary', 26, 26], ['play_primary_26', 'play_arrow', 'primary', 26, 26],
  ['add_onPrimary_20', 'add', 'onPrimary', 20, 20], ['settings_primary_24', 'settings', 'primary', 24, 24],
  ['water_primary_18', 'water_drop', 'primary', 18, 18], ['check_onPrimary_16', 'check', 'onPrimary', 16, 16],
  ['remove_primary_24', 'remove', 'primary', 24, 24], ['add_primary_24', 'add', 'primary', 24, 24],
  ['wifi_onSurface_24', 'wifi', 'onSurface', 24, 20], ['wifi_primary_24', 'wifi', 'primary', 24, 20],
  ['bt_onSurface_24', 'bluetooth', 'onSurface', 24, 20], ['bt_onPrimaryC_24', 'bluetooth', 'onPrimaryContainer', 24, 20],
  ['bell_onSurface_24', 'notifications', 'onSurface', 24, 20], ['bell_onPrimaryC_24', 'notifications', 'onPrimaryContainer', 24, 20],
  ['sun_primary_24', 'light_mode', 'primary', 24, 20],
  ['add_onPrimary_32', 'add', 'onPrimary', 32, 32]];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome'), args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const pg = await (await b.newContext({ deviceScaleFactor: 1 })).newPage(); const meta = {};
  const shot = async (html, w, h, file) => {
    await pg.setViewportSize({ width: Math.max(1, w), height: Math.max(1, h) });
    await pg.setContent(`<html><head><style>${FONT}html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`);
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(20);
    await pg.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  };
  const col = r => C[r] || ({ onPrimaryContainer: '#F6EDFF' })[r];
  for (const [id, d] of Object.entries(D)) {
    const dir = path.join(ROOT, 'assets', id); fs.mkdirSync(dir, { recursive: true });
    const k = d.k, px = v => Math.round(v * k), Wdp = d.W / k, pill = d.shape === 'pill', round = d.shape === 'circle'; meta[id] = {};
    // 1) reuse v3 PNGs verbatim where they exist for this device
    for (const n of REUSE) { const s = path.join(V3, 'assets', id, n + '.png'); if (fs.existsSync(s)) fs.copyFileSync(s, path.join(dir, n + '.png')); }
    // 2) icons
    for (const [n, svg, role, dpR, dpP] of ICONS) {
      if (fs.existsSync(path.join(dir, n + '.png'))) continue;
      let dp = pill ? dpP : dpR; if (/^(sec|li)_/.test(n) && !round) dp = 16;
      const s = px(dp);
      const src = fs.readFileSync(path.join(__dirname, 'icons', svg + '.svg'), 'utf8').replace(/height="24"/, `height="${s}"`).replace(/width="24"/, `width="${s}"`).replace('<path ', `<path fill="${col(role)}" `);
      await shot(src.replace('<svg ', '<svg style="display:block" '), s, s, path.join(dir, n + '.png'));
    }
    // 3) EdgeButton fallback (pro/round already copied)
    if (!fs.existsSync(path.join(dir, 'edge_button.png'))) {
      const eb = G.edgeButtonShape(Wdp, 56); const ew = Math.ceil(eb.w * k), eh = px(56);
      await shot(`<svg width="${ew}" height="${eh}" viewBox="0 0 ${eb.w} 56" preserveAspectRatio="none" style="display:block"><path d="${eb.path}" fill="${C.primary}"/></svg>`, ew, eh, path.join(dir, 'edge_button.png'));
    }
    // 4) EdgeButton scrim: black, alpha 0 -> 1 over 40dp, full width (Vela has no CSS gradient guarantee -> PNG)
    { const h = px(40); await shot(`<div style="width:${d.W}px;height:${h}px;background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,0.85) 55%,#000)"></div>`, d.W, h, path.join(dir, 'scrim.png')); }
    // 5) CircularProgressIndicator (indeterminate): track ring + 90° arc, rotated at runtime with @keyframes
    { const S = px(48), sw = px(5), r = (S - sw) / 2, c = S / 2;
      await shot(`<svg width="${S}" height="${S}" style="display:block"><circle cx="${c}" cy="${c}" r="${r}" stroke="${C.surfaceContainer}" stroke-width="${sw}" fill="none"/></svg>`, S, S, path.join(dir, 'spin_track.png'));
      const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 0.6, P = a => [c + r * Math.cos(a), c + r * Math.sin(a)]; const [x0, y0] = P(a0), [x1, y1] = P(a1);
      await shot(`<svg width="${S}" height="${S}" style="display:block"><path d="M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}" stroke="${C.primary}" stroke-width="${sw}" stroke-linecap="round" fill="none"/></svg>`, S, S, path.join(dir, 'spin_arc.png'));
      meta[id].spin = { S, sw }; }
    // 6) round ScrollIndicator thumbs for 3 thumb fractions (0.3 / 0.5 / 0.7 of 50dp), black gap baked in (v3 method)
    if (round) {
      const R = d.W / 2, sw = px(Wdp >= 225 ? 6 : 5), Ra = R - px(2) - sw / 2, L = px(50), gap = px(3);
      const arc = (a0, a1, colr, width) => { const p = a => [R + Ra * Math.cos(a), R + Ra * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M ${x0} ${y0} A ${Ra} ${Ra} 0 0 1 ${x1} ${y1}" stroke="${colr}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`; };
      const tw = sw + 10, th = L + sw + 4;
      const crop = (svg, file, h) => shot(`<div style="width:${tw}px;height:${h}px;overflow:hidden;position:relative"><svg width="${d.W}" height="${d.H}" style="position:absolute;left:${-(d.W - tw)}px;top:${-(R - h / 2)}px">${svg}</svg></div>`, tw, h, file);
      if (!fs.existsSync(path.join(dir, 'scroll_track_arc.png'))) { const half = (L - sw) / 2 / Ra; await crop(arc(-half, half, C.scrollTrack, sw), path.join(dir, 'scroll_track_arc.png'), th); }
      for (const f of [0.3, 0.5, 0.7]) { const tl = Math.round(L * f), h2 = (tl - sw) / 2 / Ra, hg = (tl - sw) / 2 / Ra + (gap + sw) / Ra; const hh = tl + 2 * gap + 2 * sw + 4;
        await crop(arc(-hg, hg, '#000000', sw + 2) + arc(-h2, h2, C.scrollThumb, sw), path.join(dir, `si_thumb_${Math.round(f * 10)}.png`), hh);
        meta[id]['thumb' + Math.round(f * 10)] = { len: tl, w: tw, h: hh }; }
      meta[id].scroll = { Ra, sw, L, gap, tw, th };
    }
    // 7) app icon 192x192 (manifest icon) — primaryContainer disc + "M3"
    await shot(`<div style="width:192px;height:192px;border-radius:96px;background:${C.primaryContainer};display:flex;align-items:center;justify-content:center;font:700 84px GSF,sans-serif;color:${C.primary}">M3</div>`, 192, 192, path.join(dir, 'logo.png'));
  }
  fs.writeFileSync(path.join(ROOT, 'assets', 'meta.json'), JSON.stringify(meta, null, 1));
  await b.close(); console.log('assets ok');
})();
