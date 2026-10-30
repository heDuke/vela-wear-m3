// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Media (Horologist media-ui-material3) PNGs per device: scallop button, continuous ring track + 50 indicator overlays, icons, edge fades.
// node tools/media-assets.js  (needs playwright-core + Chrome; then python3 tools/media-quant.py). Writes assets/media.json.
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),D=require('./devices.json'),{C}=require('./tokens'),G=require('./media-geom');
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`};
const DIS_C=rgba(C.onSurface,.12),DIS_F=rgba(C.onSurface,.38);
const P=(pts,ox,oy,s,close)=>'M'+pts.map(p=>((ox+p[0])*s).toFixed(3)+' '+((oy+p[1])*s).toFixed(3)).join('L')+(close?'Z':'');
function svgIcon(name,size,color,s){ // centred in a size x size dp box
 const px=size*s;
 if(G.ICON_PATHS[name.replace(/^prev$/,'next')]){const flip=name==='prev',sc=px/24;
  return `<path d="${G.ICON_PATHS[flip?'next':name]}" fill="${color}" transform="${flip?`translate(${px} 0) scale(${-sc} ${sc})`:`scale(${sc})`}"/>`}
 const t=fs.readFileSync(path.join(__dirname,'icons','media_'+name+'.svg'),'utf8');
 const paths=[...t.matchAll(/<path[^>]*d="([^"]+)"/g)].map(m=>m[1]);
 return `<g transform="scale(${px/24})">${paths.map(p=>`<path d="${p}" fill="${color}"/>`).join('')}</g>`;
}
// Strokes are emitted as FILLED outlines (centre line offset +-w/2) plus circle caps: Chrome/Skia leaves sub-pixel
// coverage cracks inside strokes built from many short segments (seen as dark rows/columns at fractional scales).
const dedupe=q=>q.filter((p,i)=>!i||Math.hypot(p[0]-q[i-1][0],p[1]-q[i-1][1])>.02);
function outline(q,w){const n=q.length,L=[],Rt=[];for(let i=0;i<n;i++){const a=q[Math.max(0,i-1)],b=q[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
 L.push([q[i][0]+ty*w/2,q[i][1]-tx*w/2]);Rt.push([q[i][0]-ty*w/2,q[i][1]+tx*w/2])}
 return 'M'+L.concat(Rt.reverse()).map(p=>p[0].toFixed(3)+' '+p[1].toFixed(3)).join('L')+'Z'}
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const pg=await (await b.newContext({deviceScaleFactor:1})).newPage();const meta={};
 const shot=async(w,h,body,file)=>{await pg.setViewportSize({width:w,height:h});
  await pg.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="display:block">${body}</svg></body></html>`);
  await pg.screenshot({path:file,omitBackground:true,clip:{x:0,y:0,width:w,height:h}})};
 const R=G.ring(),btn=G.button(),sw=G.SPEC.stroke,Lb=R.T/10;
 for(const [id,d] of Object.entries(D)){
  const s=d.k,dir=path.join(ROOT,'assets',id),px=v=>Math.round(v*s),m={};
  // 1) scallop button 64dp (+ disabled), drawn in its own 64dp box
  const bs=px(64),bo=64/2;
  await shot(bs,bs,`<path d="${P(btn,bo,bo,bs/64,true)}" fill="${C.primary}"/>`,path.join(dir,'md_scallop.png'));
  await shot(bs,bs,`<path d="${P(btn,bo,bo,bs/64,true)}" fill="${DIS_C}"/>`,path.join(dir,'md_scallop_d.png'));
  // 2) wavy ring: one continuous track image (80dp box) + per-lobe indicator overlays drawn in place (no rotation).
  const box=px(80),c0=box/2,sp=sw*s,segPx=(a,b2)=>dedupe(G.seg(R.pts,R.L,a,b2).map(q=>[c0+q[0]*s,c0+q[1]*s]));
  const at=v=>{const L=R.L,i=Math.max(1,L.findIndex(x=>x>=v));const t=(v-L[i-1])/(L[i]-L[i-1]||1);return [c0+(R.pts[i-1][0]+(R.pts[i][0]-R.pts[i-1][0])*t)*s,c0+(R.pts[i-1][1]+(R.pts[i][1]-R.pts[i-1][1])*t)*s]};
  const circ=(q,r,col)=>`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="${r}" fill="${col}"/>`;
  const line=(a,b2,col,w,cap)=>{const q=segPx(a,b2);return `<path d="${outline(q,w)}" fill="${col}"/>`+(cap==='round'?circ(q[0],w/2,col)+circ(q[q.length-1],w/2,col):'')};
  const dot=(v,col)=>circ(at(v),sp/2,col);
  const h=R.gap/2;m.box=box;
  await shot(box,box,line(h,R.T-h,C.surfaceContainerLow,sp,'round'),path.join(dir,'md_ring_t.png'));
  // per-lobe pixel boxes: union of everything an overlay of lobe k may draw
  m.lobes={};const names=G.lobeNames(40),seg={};
  for(const name of names){seg[name]=G.lobeSegments(name,R.T,R.gap)}
  for(let k=0;k<10;k++){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
   for(const n of names.filter(n=>n.startsWith('md_r'+k+'_'))){const g=seg[n],hi=g.erase?g.erase[1]:g.ind[1];
    for(let v=g.ind[0];v<=hi+1e-6;v+=.25){const q=at(Math.min(v,hi));x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}}
   const pad=sp/2+1.5,L=Math.max(0,Math.floor(x0-pad)),T=Math.max(0,Math.floor(y0-pad)),Rr=Math.min(box,Math.ceil(x1+pad)),B=Math.min(box,Math.ceil(y1+pad));
   m.lobes[k]={x:L,y:T,w:Rr-L,h:B-T}}
  for(const name of names){const g=seg[name],k=+name[4],lb=m.lobes[k];let body='';
   if(g.erase)body+=line(g.erase[0],g.erase[1],'#000000',sp+2,'butt')+dot(g.trackCap,C.surfaceContainerLow);
   body+=line(g.ind[0],g.ind[1],C.onSecondaryContainer,sp,'butt');
   if(g.capStart)body+=dot(g.ind[0],C.onSecondaryContainer);if(g.capEnd)body+=dot(g.ind[1],C.onSecondaryContainer);
   await shot(lb.w,lb.h,`<g transform="translate(${-lb.x} ${-lb.y})">${body}</g>`,path.join(dir,name+'.png'))}
  // 3) icons: 32dp play/pause/next/prev, 24dp seek; onPrimary + disabled (onSurface 38%)
  for(const [n,sz] of [['play',32],['pause',32],['next',32],['prev',32],['replay_5',24],['replay_10',24],['replay_30',24],['forward_5',24],['forward_10',24],['forward_30',24]]){
   const stem=n.startsWith('replay_')?'md_back'+n.slice(7):n.startsWith('forward_')?'md_fwd'+n.slice(8):'md_'+n,q=px(sz);
   await shot(q,q,svgIcon(n,sz,C.onPrimary,q/sz),path.join(dir,stem+'_'+sz+'.png'));
   await shot(q,q,svgIcon(n,sz,DIS_F,q/sz),path.join(dir,stem+'_'+sz+'d.png'));
  }
  // 4) 8dp edge fades (TextMediaDisplay / MarqueeText edge gradient), black background assumed
  const fw=px(8),fh=px(20);
  for(const [n,a,b2] of [['md_fade_r',0,1],['md_fade_l',1,0]])
   await shot(fw,fh,`<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="${a}"/><stop offset="1" stop-color="#000" stop-opacity="${b2}"/></linearGradient></defs><rect width="${fw}" height="${fh}" fill="url(#g)"/>`,path.join(dir,n+'.png'));
  meta[id]=m;
 }
 fs.writeFileSync(path.join(ROOT,'assets','media.json'),JSON.stringify(meta,null,1)+'\n');
 await b.close();console.log('media assets ok');
})();
