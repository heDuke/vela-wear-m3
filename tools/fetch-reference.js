// Keep the reference snapshot pinned to the commit documented in HANDOFF/mapping.
const fs = require('fs'), path = require('path'), https = require('https');
const commit = '2f557dc1f1ec71edae73e2c16b0e446523c644b7';
const root = path.resolve(__dirname, '../docs/ref/androidx-m3-src');
const files = ['Slider.kt','tokens/SliderTokens.kt','Stepper.kt','SwitchButton.kt','CircularProgressIndicator.kt','ArcProgressIndicator.kt','LinearProgressIndicator.kt','SegmentedCircularProgressIndicator.kt','ProgressIndicator.kt','LevelIndicator.kt','PageIndicator.kt','MotionScheme.kt','tokens/MotionTokens.kt','tokens/SwitchButtonTokens.kt'];
function get(url) { return new Promise((resolve,reject) => https.get(url, r => {
  if (r.statusCode >= 300 && r.statusCode < 400) { r.resume(); return get(r.headers.location).then(resolve,reject); }
  let b=''; r.on('data',c=>b+=c); r.on('end',()=>r.statusCode===200?resolve(b):reject(new Error(r.statusCode+' '+url)));
}).on('error',reject)); }
(async()=>{ for (const file of files) {
  const body = await get(`https://raw.githubusercontent.com/androidx/androidx/${commit}/wear/compose/compose-material3/src/main/java/androidx/wear/compose/material3/${file}`);
  fs.writeFileSync(path.join(root,path.basename(file)),body);
  console.log(file);
} })().catch(e=>{console.error(e.message);process.exitCode=1;});
