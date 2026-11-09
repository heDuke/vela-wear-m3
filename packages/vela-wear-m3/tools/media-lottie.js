// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Horologist Lottie icons pre-rendered as PNG frames in onPrimary at 32dp (tools/lottie/, Apache-2.0, cdf245c). Vela has
// no Lottie player: media.methods.js shows the frames pre-mounted over the static icon. Enhanced (API 2) only.
// - AnimatedSeekToNextButton / AnimatedSeekToPreviousButton: M3Next.json, 30 frames at 60 fps = 500 ms per click
//   (previous = the same composition mirrored, graphicsLayer(scaleX = -1)); every 3rd frame 3, 6 .. 27 -> md_next_l1..9
//   / md_prev_l1..9 (frame 0 is the static LottiePlaceholders icon md_next_32 / md_prev_32).
// - AnimatedPlayPauseButtonContent: M3PlayPause.json, 100 frames, progress 0 = pause, 1 = play, animate(speed +-10) =
//   167 ms each way; frames 17, 33, 50, 67, 83 -> md_pp_l1..5 (the ends are md_pause_32 / md_play_32, which match frame
//   0 / 100 to the pixel at 32dp).
// LOTTIE_JS=/path/lottie.min.js node tools/media-lottie.js && python3 tools/media-quant.py   (playwright-core + Chrome)
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),D=require('./devices.json'),{C}=require('./tokens');
const JOBS=[{json:'M3Next.json',frames:[3,6,9,12,15,18,21,24,27],out:[['next',false],['prev',true]]},
 {json:'M3PlayPause.json',frames:[17,33,50,67,83],out:[['pp',false]]}];
const LOTTIE=process.env.LOTTIE_JS;if(!LOTTIE||!fs.existsSync(LOTTIE))throw new Error('set LOTTIE_JS to lottie-web 5.x build/player/lottie.min.js');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const lib=fs.readFileSync(LOTTIE,'utf8');let n=0;
 for(const [id,d] of Object.entries(D)){const q=Math.round(32*d.k);
  const pg=await (await b.newContext({deviceScaleFactor:1,viewport:{width:q,height:q}})).newPage();
  for(const job of JOBS){const json=fs.readFileSync(path.join(__dirname,'lottie',job.json),'utf8');
   for(const [stem,flip] of job.out){
    await pg.setContent(`<html><head><style>svg path{fill:${C.onPrimary}!important;stroke:${C.onPrimary}!important}#d{width:${q}px;height:${q}px;${flip?'transform:scaleX(-1);':''}}</style></head><body style="margin:0;background:transparent"><div id="d"></div><script>${lib}</script></body></html>`);
    await pg.evaluate(j=>{window.A=lottie.loadAnimation({container:document.getElementById('d'),renderer:'svg',loop:false,autoplay:false,animationData:JSON.parse(j)})},json);
    for(const [i,f] of job.frames.entries()){await pg.evaluate(f=>A.goToAndStop(f,true),f)
     await pg.screenshot({path:path.join(ROOT,'assets',id,'md_'+stem+'_l'+(i+1)+'.png'),omitBackground:true});n++}}}
  await pg.context().close()}
 await b.close();console.log('lottie frames ok',n);
})();
