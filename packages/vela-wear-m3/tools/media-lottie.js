// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Horologist AnimatedSeekToNextButton / AnimatedSeekToPreviousButton: M3Next.json (Apache-2.0, tools/lottie/, 30 frames
// at 60 fps = 500 ms; previous = the same composition mirrored, graphicsLayer(scaleX = -1)) pre-rendered as PNG frames
// in onPrimary at 32dp. Vela has no Lottie player, so media.methods.js swaps the side-key image every 50 ms (every 3rd
// frame: 3, 6 .. 27; frame 0 is the static LottiePlaceholders icon md_next_32 / md_prev_32). Enhanced (API 2) only.
// LOTTIE_JS=/path/lottie.min.js node tools/media-lottie.js && python3 tools/media-quant.py   (playwright-core + Chrome)
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),D=require('./devices.json'),{C}=require('./tokens');
const FRAMES=[3,6,9,12,15,18,21,24,27];
const LOTTIE=process.env.LOTTIE_JS;if(!LOTTIE||!fs.existsSync(LOTTIE))throw new Error('set LOTTIE_JS to lottie-web 5.x build/player/lottie.min.js');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const json=fs.readFileSync(path.join(__dirname,'lottie','M3Next.json'),'utf8'),lib=fs.readFileSync(LOTTIE,'utf8');
 for(const [id,d] of Object.entries(D)){const q=Math.round(32*d.k);
  const pg=await (await b.newContext({deviceScaleFactor:1,viewport:{width:q,height:q}})).newPage();
  for(const flip of [false,true]){
   await pg.setContent(`<html><head><style>svg path{fill:${C.onPrimary}!important;stroke:${C.onPrimary}!important}#d{width:${q}px;height:${q}px;${flip?'transform:scaleX(-1);':''}}</style></head><body style="margin:0;background:transparent"><div id="d"></div><script>${lib}</script></body></html>`);
   await pg.evaluate(j=>{window.A=lottie.loadAnimation({container:document.getElementById('d'),renderer:'svg',loop:false,autoplay:false,animationData:JSON.parse(j)})},json);
   for(const [i,f] of FRAMES.entries()){await pg.evaluate(f=>A.goToAndStop(f,true),f)
    await pg.screenshot({path:path.join(ROOT,'assets',id,'md_'+(flip?'prev':'next')+'_l'+(i+1)+'.png'),omitBackground:true})}}
  await pg.context().close()}
 await b.close();console.log('lottie frames ok',FRAMES.length*2);
})();
