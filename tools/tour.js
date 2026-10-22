// Generate the scripted demo tour (emu-drive.js steps) for one device, from the same geometry gen.js uses.
// usage: node tools/tour.js <device> > tour.json   (run `node tools/gen.js <device>` first: absolute positions are read from src/)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DEV = JSON.parse(fs.readFileSync(path.join(__dirname, 'devices.json')));
const G = require('./geom.js');
const id = process.argv[2] || 'round', d = DEV[id];
const k = d.k, W = d.W, H = d.H, dp = v => Math.round(v * k), P = G.pad(W / k, H / k), VP = dp(P.v);
const round = d.shape === 'circle', pill = d.shape === 'pill';
const cx = Math.round(W / 2);
// absolute element boxes from generated CSS
function box(page, cls) {
  const t = fs.readFileSync(path.join(ROOT, 'src/pages', page, page + '.ux'), 'utf8');
  const m = t.match(new RegExp('\\.' + cls + '\\s*\\{([^}]*)\\}'));
  const g = p => +((m[1].match(new RegExp('(?:^|;|\\s)' + p + ':\\s*(-?[\\d.]+)px')) || [])[1] || 0);
  return { x: g('left'), y: g('top'), w: g('width'), h: g('height') };
}
const S = [];
const wait = ms => S.push(['wait', ms]);
const tap = (x, y, after = 700) => { S.push(['tap', Math.round(x), Math.round(y)]); wait(after); };
const drag = (dist, ms = 700, after = 500) => { dist = Math.min(dist, Math.round(H * 0.7)); ms = Math.round(ms * 0.75); const y0 = Math.round(H * 0.78); S.push(['drag', cx, y0, cx, y0 - dist, ms]); wait(after); };
const dragDown = (dist, ms = 700, after = 500) => { dist = Math.min(dist, Math.round(H * 0.7)); ms = Math.round(ms * 0.75); const y0 = Math.round(H * 0.22); S.push(['drag', cx, y0, cx, y0 + dist, ms]); wait(after); };
const flingUp = () => { S.push(['swipe', cx, Math.round(H * 0.85), cx, Math.round(H * 0.12), 180]); wait(350); };
const flingDown = () => { S.push(['swipe', cx, Math.round(H * 0.12), cx, Math.round(H * 0.85), 180]); wait(350); };
const shot = n => S.push(['shot', n]);
const log = m => S.push(['log', m]);
const bottom = () => { flingUp(); flingUp(); wait(500); };
const top = () => { flingDown(); flingDown(); flingDown(); wait(900); };
const backY = H - VP - dp(24);
const back = () => { tap(cx, backY, 700); };
// launcher rows: padt VP, header 48dp, 8 x 56dp
const rowTop = i => VP + dp(48) + dp(56) * i + dp(28);
const nItems = 8, contentH = VP * 2 + dp(48) + dp(56) * nItems, maxY = contentH - H;
let cur = 0; // launcher scroll offset (the launcher keeps it while a section page is on top)
function open(i) {
  // re-anchor the launcher (fling to top or bottom = exact), then drag exactly to bring row i near the centre and tap it
  const want = Math.max(0, Math.min(maxY, rowTop(i) - Math.round(H / 2)));
  if (want >= maxY - 4) { if (cur < maxY) { flingUp(); flingUp(); wait(400); } cur = maxY; }
  else if (want !== cur) { if (cur > 0) { flingDown(); flingDown(); wait(400); } cur = 0;
    let delta = want; const step = Math.round(H * 0.6);
    while (delta > 4) { const s = Math.min(step, delta); drag(s, 600, 300); delta -= s; } cur = want; }
  tap(cx, rowTop(i) - cur, 700);
}
const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null; // optional dir for still captures
const VIDEO = process.argv[4] === 'video'; // lighter tour for the <=60s walkthrough video
const cap = n => { if (SHOTS) shot(path.join(SHOTS, `${id}_${n}.png`)); };

// ---------------- the tour ----------------
// NB: the emulator renders ~0.5s behind input, so every drag is followed by >=700ms before the next tap.
const SET = 500; // taps additionally wait for the screen to settle (emu-drive --settle)
log('launcher'); wait(900); cap('01_launcher');

log('buttons'); open(0); cap('03_buttons');
if (!VIDEO) { drag(dp(220), 900, SET); cap('04_buttons_2'); } bottom(); cap('05_buttons_3'); back();

if (!VIDEO) { log('cards'); open(1); cap('06_cards'); bottom(); cap('07_cards_2'); back(); }
cap('02_launcher_tlc');

log('list'); open(2); cap('08_list_tlc'); if (VIDEO) { drag(dp(130), 900, SET); } else { tap(cx, rowTop(0), 300); drag(dp(130), 900, SET); cap('09_list_flat'); } bottom(); back();

log('edge'); open(3); cap('10_edge_top'); bottom(); cap('11_edge_bottom');
const eb = box('edge', 'eb'); tap(cx, eb.y + eb.h / 2, 700); cap('12_confirmation'); wait(pill ? 2300 : 1800);
tap(cx, box('edge', 'scrim').y - dp(4) - dp(24), 900);

log('time'); open(4); cap('13_time');
const rowY = (() => { const c = box('time', 'col').y; return c + dp(16) + dp(4) + (pill ? dp(48) : dp(60)) + (round ? 0 : dp(12)) + dp(18) + dp(24); })();
tap(cx - dp(31), rowY, VIDEO ? 800 : 1100); cap('14_time_12h'); tap(cx + dp(46), rowY, 900);

log('toggles'); open(5); cap('15_toggles');
tap(cx, rowTop(0), 350); tap(cx, rowTop(0) + dp(56), 350); tap(cx, rowTop(0) + dp(112), 350);
drag(dp(200), 800, SET); cap('16_toggles_2');
const rTop0 = VP + dp(48) + dp(56) * 3 + dp(32) + dp(28) - dp(200); tap(cx, rTop0 + dp(112), 400);
if (!VIDEO) { drag(dp(170), 800, SET); cap('17_toggles_3'); }
if (!VIDEO) { const slY = VP + dp(48) + dp(56) * 6 + dp(32) * 2 + dp(28) - dp(370); tap(W - dp(40), slY, 300); tap(W - dp(40), slY, 300); tap(dp(40), slY, 300); }
bottom(); back();

log('dialogs'); open(6); cap('18_dialogs');
tap(cx, rowTop(0), 1000); cap('19_alertdialog');
const ok = box('dialogs', 'dlg-ok'); tap(ok.x + ok.w / 2, ok.y + ok.h / 2, 700); cap('20_confirmation'); wait(pill ? 2300 : 1800);
bottom(); back();

log('motion'); open(7); wait(600); cap('21_motion'); drag(dp(150), 800, SET); cap('22_motion_2');
const colY = VP + dp(48) + dp(76) * 2 + dp(40) + dp(28) - dp(150); tap(cx, colY, 900);
bottom(); back();
log('home'); flingDown(); flingDown(); wait(900);
process.stdout.write(JSON.stringify(S));
