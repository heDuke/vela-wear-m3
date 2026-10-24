// SPDX-License-Identifier: GPL-3.0-or-later
// Reproducible documentation artwork using existing Chrome design previews.
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/promotion/bandbbs');
const previews=path.join(root,'docs/screenshots/ui-2026-10-24/previews');
const brand='data:image/png;base64,'+fs.readFileSync(path.join(root,'docs/design/brand/sailboat-rounded-192.png')).toString('base64');
const img=name=>'data:image/png;base64,'+fs.readFileSync(path.join(previews,name+'.png')).toString('base64');
function page(dark,detail){
 const bg=dark?'#141218':'#FFF8FE',ink=dark?'#F1E7F6':'#241B30',muted=dark?'#C8BDCF':'#675B71',surface=dark?'#27232D':'#F0E5F6',primary=dark?'#DAC4FF':'#62458C';
 const cards=detail==='controls'?[
  ['round_buttons_part0','按钮','基础样式 · Button'],['round_button-pressed','按压形变','可选形变 · Button'],['round_pressed','图标','形变与状态 · IconButton'],['round_switch-k1-s0','开关','行首图标 · SwitchButton']
 ]:[['round_stepper','全屏数值','Stepper + LevelIndicator'],['round_horizontal-pages','连续分页','PageIndicator'],['round_arc-time','沿弧排布','Arc TimeText'],['round_progress-4','分段进度','ProgressIndicator']];
 const body=detail?`<div class="eyebrow">COMPONENT SPOTLIGHT · VELA-WEAR-M3</div><h1 class="detail-title">${detail==='controls'?'每一次操作，都有回应。':'形状与屏幕，一起工作。'}</h1><div class="tiles">${cards.map(([file,title,caption])=>`<article><div class="shot"><img ${file.includes('switch-k')?'style="border-radius:18px"':''} src="${img(file)}"></div><h2>${title}</h2><p>${caption}</p></article>`).join('')}</div><footer>实际 Chrome 设计预览 · 非设备实拍 <span>© 2026 heDuke</span></footer>`:
 `<div class="top"><span class="wordmark"><img class="brand-icon" src="${brand}" alt="小帆船项目图标">vela-wear-m3</span><span class="pill">Material 3 Expressive · for Vela</span></div><h1>让小屏幕<br>更有表现力<span class="period">。</span></h1><p class="sub">圆屏、矩形屏与手环，让组件找到自己的位置。</p><div class="devices">${[['round_home','round','ROUND'],['pro_home','pro','PRO'],['band10_switches','band','BAND10'],['band9_time','band small','BAND9']].map(([file,cls,label])=>`<div class="device ${cls}"><div class="frame"><img src="${img(file)}"></div><div class="device-label">${label}</div></div>`).join('')}</div><footer>Chrome 设计预览 · 非模拟器／真机实拍 <span>组件库 GPL-3.0-or-later · © 2026 heDuke</span></footer>`;
 return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1280px;height:${detail?760:960}px;padding:54px 64px 34px;background:${bg};color:${ink};font-family:'Microsoft YaHei',sans-serif}.top{display:flex;align-items:center;justify-content:space-between}.brand-icon{display:block;width:48px;height:48px}.wordmark{display:flex;align-items:center;gap:14px;font-weight:700;font-size:27px;letter-spacing:-1px}.pill{padding:12px 24px;border-radius:30px;background:${surface};color:${primary};font-size:17px;font-weight:600}h1{font-size:76px;line-height:1.13;letter-spacing:-3px;margin:35px 0 18px;font-weight:700}.period{color:${primary}}.sub{font-size:24px;color:${muted};margin:0}.devices{height:460px;display:flex;align-items:flex-end;justify-content:space-between;padding:32px 18px 0;gap:28px}.device{display:flex;flex-direction:column;align-items:center}.frame{background:#000;border:7px solid ${dark?'#484050':'#D5C7DE'};overflow:hidden}.frame img{display:block;width:100%}.round .frame{width:352px;height:352px;border-radius:50%}.pro .frame{width:256px;border-radius:48px}.band .frame{width:153px;border-radius:84px}.small .frame{width:140px}.device-label{color:${muted};font-size:14px;letter-spacing:3px;margin-top:16px}footer{display:flex;justify-content:space-between;font-size:15px;color:${muted};margin-top:38px}h1.detail-title{font-size:51px;margin:18px 0 34px;letter-spacing:-1px}.eyebrow{font-size:14px;font-weight:600;letter-spacing:2px;color:${primary}}.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}article{background:${surface};padding:20px 12px;border-radius:42px 42px 26px 26px;text-align:center}.shot{display:flex;height:300px;align-items:center;justify-content:center}.shot img{width:246px;max-height:290px;object-fit:contain;border-radius:50%}h2{font-size:24px;margin:21px 0 7px}article p{font-size:13px;margin:0;color:${muted}}</style>${body}</html>`;
}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const [name,dark,detail]of [['cover-light',false,null],['cover-dark',true,null],['components-controls',true,'controls'],['components-display',false,'display']]){
  const p=await browser.newPage({viewport:{width:1280,height:detail?760:960},deviceScaleFactor:1});
  await p.setContent(page(dark,detail));await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:path.join(out,name+'.png')});await p.close();
 }
 if(process.argv.includes('--images-only'))return;
 // Decode existing 30fps resource MP4s; keep sampled timestamps in a receipt.
 const videoDir=path.join(root,'docs/screenshots/ui-2026-10-24/design-motion');
 const receipts=[];
 for(const device of ['round','band10']){
  const folder=path.join(root,'out/promotion-frames',device);fs.mkdirSync(folder,{recursive:true});
  const p=await browser.newPage();
  await p.setContent('<video muted preload="auto" src="data:video/mp4;base64,'+fs.readFileSync(path.join(videoDir,device+'-asset-motion.mp4')).toString('base64')+'"></video><canvas width="540" height="360"></canvas>');
  await p.waitForFunction(()=>document.querySelector('video').readyState>=2);
  const duration=await p.evaluate(()=>document.querySelector('video').duration);
  const count=Math.ceil(duration*8);
  for(let i=0;i<count;i++){
   const data=await p.evaluate(async time=>{const v=document.querySelector('video');if(Math.abs(v.currentTime-time)>.001)await new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=time});const c=document.querySelector('canvas'),x=c.getContext('2d');x.fillStyle='#141218';x.fillRect(0,0,c.width,c.height);x.drawImage(v,0,0,540,360);return c.toDataURL('image/png').split(',')[1]},Math.min(i/8,duration-.01));
   fs.writeFileSync(path.join(folder,String(i).padStart(3,'0')+'.png'),Buffer.from(data,'base64'));
  }
  receipts.push({device,source:device+'-asset-motion.mp4',duration,samplingFps:8,frames:count});await p.close();
 }
 fs.writeFileSync(path.join(root,'out/promotion-frames/source.json'),JSON.stringify(receipts,null,2)+'\n');
 }finally{await browser.close()}
 console.log('4 documentation illustrations generated from existing design previews');
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
