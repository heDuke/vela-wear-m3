// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// P4 media icons (media-actions / media-queue / media-output-picker): Material Symbols Rounded 24dp PNGs per device.
// node tools/media-p4-assets.js && python3 tools/media-quant.py   (needs playwright-core + Chrome)
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),D=require('./devices.json'),{C}=require('./tokens');
function icon(name,px,color){const t=fs.readFileSync(path.join(__dirname,'icons','media_'+name+'.svg'),'utf8');
 const vb=(t.match(/viewBox="([^"]+)"/)[1]).split(/\s+/).map(Number),s=px/vb[2];
 const paths=[...t.matchAll(/<path([^>]*)>/g)].filter(m=>!/fill="none"/.test(m[1])).map(m=>m[1].match(/\bd="([^"]+)"/)[1]);
 return `<g transform="scale(${s}) translate(${-vb[0]} ${-vb[1]})">${paths.map(p=>`<path d="${p}" fill="${color}"/>`).join('')}</g>`}
// [file stem, symbol, colour]: on primary = onPrimary; tonal (off / unselected) = onSurface; card icon = onSurfaceVariant
const LIST=[['md_ma_liket','thumb_up',C.onSurface],['md_ma_liked','thumb_up_fill',C.onPrimary],
 ['md_ma_shuf','shuffle',C.onPrimary],['md_ma_shuft','shuffle',C.onSurface],['md_ma_rep','repeat',C.onPrimary],['md_ma_rept','repeat',C.onSurface],
 ['md_ma_rep1','repeat_one',C.onPrimary],['md_ma_queue','queue_music',C.onSurfaceVariant]];
for(const [k,sym] of [['phone','smartphone'],['watch','watch'],['hp','headphones'],['spk','speaker'],['bt','bluetooth']]){
 LIST.push(['md_op_'+k,sym,C.onPrimary],['md_op_'+k+'t',sym,C.onSurface])}
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const pg=await (await b.newContext({deviceScaleFactor:1})).newPage();
 for(const [id,d] of Object.entries(D)){const q=Math.round(24*d.k);
  for(const [stem,sym,col] of LIST){await pg.setViewportSize({width:q,height:q})
   await pg.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${q}" height="${q}" style="display:block">${icon(sym,q,col)}</svg></body></html>`)
   await pg.screenshot({path:path.join(ROOT,'assets',id,stem+'_24.png'),omitBackground:true,clip:{x:0,y:0,width:q,height:q}})}}
 await b.close();console.log('p4 icons ok',LIST.length)})();
