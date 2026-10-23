// Drive a running Vela emulator via its gRPC EmulatorController (sendMouse / getScreenshot / streamScreenshot)
// usage: node tools/emu-drive.js <grpcPort> <script.json|-> [--record out.mp4 --w W --h H --fps 30]
//   script steps: ["wait",ms] ["tap",x,y] ["swipe",x1,y1,x2,y2,ms] ["key","GoBack"] ["shot","file.png"] ["log","msg"]
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const grpc = require('@grpc/grpc-js'), loader = require('@grpc/proto-loader');
const PROTO = path.join(__dirname, '../node_modules/@aiot-toolkit/emulator/lib/static/proto/emulator_controller.proto');
const def = loader.loadSync(PROTO, { keepCase: true, longs: Number, enums: String, defaults: true, includeDirs: [path.dirname(PROTO)] });
const pkg = grpc.loadPackageDefinition(def);
const Ctl = pkg.android.emulation.control.EmulatorController;
const args = process.argv.slice(2);
const port = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const c = new Ctl('127.0.0.1:' + port, grpc.credentials.createInsecure(), { 'grpc.max_receive_message_length': 64 << 20 });
const call = (m, req) => new Promise((res, rej) => c[m](req, (e, r) => (e ? rej(e) : res(r))));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mouse = (x, y, b) => call('sendMouse', { x: Math.round(x), y: Math.round(y), buttons: b, display: 0 });
async function swipe(x1, y1, x2, y2, ms = 300, hold = 0) {
  const n = Math.max(6, Math.round(ms / 16));
  await mouse(x1, y1, 1);
  for (let i = 1; i <= n; i++) { const t = i / n, e = t; await mouse(x1 + (x2 - x1) * e, y1 + (y2 - y1) * e, 1); await sleep(ms / n); }
  if (hold) { await mouse(x2, y2, 1); await sleep(hold); }
  await mouse(x2, y2, 0);
}
async function shot(file) {
  const r = await call('getScreenshot', { format: 'PNG' });
  fs.writeFileSync(file, r.image);
}
// wait until the screen stops changing (the emulator renders behind input); used before every tap with --settle
async function settle(maxMs = 3000) {
  const t0 = Date.now(); let prev = null, calm = 0;
  while (Date.now() - t0 < maxMs) {
    const r = await call('getScreenshot', { format: 'RGB888', width: 0, height: 0 });
    const b = r.image;
    if (prev && prev.length === b.length) {
      let diff = 0; for (let i = 0; i < b.length; i += 12) if (Math.abs(b[i] - prev[i]) > 40 || Math.abs(b[i + 1] - prev[i + 1]) > 40) diff++;
      if (diff / (b.length / 12) < 0.004) { if (++calm >= 2) return Date.now() - t0; } else calm = 0;
    }
    prev = Buffer.from(b); await sleep(90);
  }
  return Date.now() - t0;
}
let rec = null;
function startRecord(out, W, H, fps) {
  const ff = spawn(process.env.FFMPEG_PATH||'ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-',
    ...(W % 2 || H % 2 ? ['-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  let last = Buffer.alloc(W * H * 3), frames = 0;
  const samples=[];let previous=null;const inputEvents=[]
  const st = c.streamScreenshot({ format: 'RGB888', width: W, height: H });
  st.on('data', img => { if(img.image&&img.image.length===W*H*3){const b=Buffer.from(img.image);let changed=0,total=0;if(previous)for(let i=0;i<b.length;i+=48){total++;if(Math.abs(b[i]-previous[i])+Math.abs(b[i+1]-previous[i+1])+Math.abs(b[i+2]-previous[i+2])>60)changed++}samples.push({time:Date.now(),timestampUs:img.timestampUs,seq:img.seq,changed:total?changed/total:0});previous=b;last=b;} });
  st.on('error', () => {});
  const t0 = Date.now();
  const timer = setInterval(() => {
    const due = Math.floor((Date.now() - t0) * fps / 1000);
    while (frames <= due) { ff.stdin.write(last); frames++; }
  }, 1000 / fps / 2);
  rec = { inputEvents,stop: () => new Promise(res => { clearInterval(timer);st.cancel();fs.writeFileSync(out+'.frames.json',JSON.stringify({samples,inputEvents},null,2));ff.stdin.end(); ff.on('close', () => res(frames)); }) };
}
(async () => {
  const src = args[1] && args[1] !== '-' ? JSON.parse(fs.readFileSync(args[1], 'utf8')) : [];
  const out = opt('record');
  if (out) startRecord(out, +opt('w'), +opt('h'), +opt('fps', 30));
  if (args.includes('--settle')) await settle();
  for (const s of src) {
    const [op,...a]=s;const event={op,start:Date.now()};if(rec)rec.inputEvents.push(event);
    if (op === 'wait') await sleep(a[0]);
    else if (op === 'tap') { if (args.includes('--settle')) await settle(); await mouse(a[0], a[1], 1); await sleep(a[2] || 90); await mouse(a[0], a[1], 0); }
    else if (op === 'swipe') await swipe(...a);
    else if (op === 'drag') await swipe(a[0], a[1], a[2], a[3], a[4] || 500, 160);
    else if (op === 'key') { await call('sendKey', { eventType: 'keypress', key: a[0] }); }
    else if (op === 'evkey') { await call('sendKey', { codeType: 'Evdev', eventType: 'keydown', keyCode: a[0] }); await sleep(80); await call('sendKey', { codeType: 'Evdev', eventType: 'keyup', keyCode: a[0] }); }
    else if (op === 'shot') await shot(a[0]);
    else if (op === 'log') console.log('[drive]', ...a);
    event.end=Date.now();
  }
  if (rec) console.log('frames', await rec.stop());
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
