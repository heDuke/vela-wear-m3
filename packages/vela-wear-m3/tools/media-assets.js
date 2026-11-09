// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Media (Horologist media-ui-material3) PNGs per device: scallop button + press-morph frames, ring tracks + 2 x 6 indicator
// segments + discs, icons, edge fades.
// node tools/media-assets.js  (needs playwright-core + Chrome; then python3 tools/media-quant.py). Writes assets/media.json.
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),D=require('./devices.json'),{C}=require('./tokens'),G=require('./media-geom');
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`};
const DIS_C=rgba(C.onSurface,G.SPEC.colors.disabledContainer[1]),DIS_F=rgba(C.onSurface,.38);
const P=(pts,ox,oy,s,close)=>'M'+pts.map(p=>((ox+p[0])*s).toFixed(3)+' '+((oy+p[1])*s).toFixed(3)).join('L')+(close?'Z':'');
function svgIcon(name,size,color,s){ // centred in a size x size dp box
 const px=size*s;
 if(G.ICON_PATHS[name.replace(/^prev$/,'next')]){const flip=name==='prev',sc=px/24;
  return `<path d="${G.ICON_PATHS[flip?'next':name]}" fill="${color}" transform="${flip?`translate(${px} 0) scale(${-sc} ${sc})`:`scale(${sc})`}"/>`}
 const t=fs.readFileSync(path.join(__dirname,'icons','media_'+name+'.svg'),'utf8'),vb=+(t.match(/viewBox="0 0 (\d+)/)||[0,24])[1];
 const paths=[...t.matchAll(/<path([^>]*)>/g)].filter(m=>!/fill="none"/.test(m[1])).map(m=>m[1].match(/\bd="([^"]+)"/)[1]);
 return `<g transform="scale(${px/vb})">${paths.map(p=>`<path d="${p}" fill="${color}"/>`).join('')}</g>`;
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
  // 1b) press morph (P5, enhanced): Morph(pill, scallop) at progress .25 / .5 / .75 (1 = scallop, media-geom morph()):
  //     u = play key pressed (pill 64+12dp wide), d = side key pressed (64-12dp), c = vertical layouts (circle 64dp),
  //     each centred in a 76 x 64dp box.
  {const Ld=G.layout(d),mw=px(76),mh=px(64);m.mf={w:mw,h:mh,seq:Ld.vertical?['c']:['u','d']};
   for(const [sq,pw] of (Ld.vertical?[['c',64]]:[['u',76],['d',52]]))for(let i=1;i<=3;i++)
    await shot(mw,mh,`<path d="${P(G.morph(btn,G.pill(pw,64),i/4),38,32,mw/76,true)}" fill="${C.primary}"/>`,path.join(dir,'md_mf_'+sq+i+'.png'))}
  // 2) wavy ring: one continuous track image (80dp box) + per-lobe indicator overlays drawn in place (no rotation).
  const box=px(80),c0=box/2,sp=sw*s,segPx=(a,b2)=>dedupe(G.seg(R.pts,R.L,a,b2).map(q=>[c0+q[0]*s,c0+q[1]*s]));
  const at=v=>{const L=R.L,i=Math.max(1,L.findIndex(x=>x>=v));const t=(v-L[i-1])/(L[i]-L[i-1]||1);return [c0+(R.pts[i-1][0]+(R.pts[i][0]-R.pts[i-1][0])*t)*s,c0+(R.pts[i-1][1]+(R.pts[i][1]-R.pts[i-1][1])*t)*s]};
  const circ=(q,r,col)=>`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="${r}" fill="${col}"/>`;
  const line=(a,b2,col,w,cap)=>{const q=segPx(a,b2);if(q.length<2)return '';return `<path d="${outline(q,w)}" fill="${col}"/>`+(cap==='round'?circ(q[0],w/2,col)+circ(q[q.length-1],w/2,col):'')};
  const dot=(v,col)=>circ(at(v),sp/2,col);
  const h=R.gap/2;m.box=box;
  await shot(box,box,line(h,R.T-h,C.surfaceContainerLow,sp,'round'),path.join(dir,'md_ring_t.png'));
  // 2b) ring segments (P5, continuous progress). Each ring (w = wavy, c = paused circle r 38dp) is cut into 40 equal
  //     arc-length quarters of its 10 lobes. Lobe-0 quarters q0..q3 (butt ends; q1..q3 start 1px early, every quarter
  //     ends 1px late, so stacked neighbours leave no seam) are rotated by 36k deg about the ring centre for lobe k
  //     (6 distinct images: 40 distinct ones overflow the emulator's image cache and draw as grey boxes); segment 0
  //     starts at the start gap (qs) and segment 39 ends at T - gap/2 (qe), both in place. The indicator tail
  //     (last whole quarter .. exact end) is a row of indicator discs and the gap a rotated black bar ending in a track
  //     disc, positioned at runtime (media.methods.js mdRingPaint).
  {const Rc=G.circleRing(),fns=Rg=>{const sg=(a,b2)=>dedupe(G.seg(Rg.pts,Rg.L,a,b2).map(q=>[c0+q[0]*s,c0+q[1]*s]));
    return {sg,line:(a,b2,col,w,cap)=>{const q=sg(a,b2);if(q.length<2)return '';return `<path d="${outline(q,w)}" fill="${col}"/>`+(cap==='round'?circ(q[0],w/2,col)+circ(q[q.length-1],w/2,col):'')}}};
   await shot(box,box,fns(Rc).line(Rc.gap/2,Rc.T-Rc.gap/2,C.surfaceContainerLow,sp,'round'),path.join(dir,'md_cring_t.png'));
   m.seg={};
   for(const [X,Rg] of [['w',R],['c',Rc]]){const F=fns(Rg),Q=Rg.T/40,hh=Rg.gap/2,ov=1/s;
    const bx={},parts={q0:[0,Q+ov],q1:[Q-ov,2*Q+ov],q2:[2*Q-ov,3*Q+ov],q3:[3*Q-ov,4*Q+ov],qs:[hh,Q+ov],qe:[39*Q-ov,Rg.T-hh]};
    for(const [n,[a,b2]] of Object.entries(parts)){const q=F.sg(a,b2);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of q){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
     const pad=sp/2+1.5,L=Math.max(0,Math.floor(x0-pad)),T=Math.max(0,Math.floor(y0-pad)),Rr=Math.min(box,Math.ceil(x1+pad)),B=Math.min(box,Math.ceil(y1+pad));bx[n]={x:L,y:T,w:Rr-L,h:B-T};
     await shot(Rr-L,B-T,`<g transform="translate(${-L} ${-T})">${F.line(a,b2,C.onSecondaryContainer,sp,'butt')}</g>`,path.join(dir,'md_'+X+n+'.png'))}
    m.seg[X]=bx}
   const D_=Math.ceil(sp)+2;m.dot=D_;
   await shot(D_,D_,circ([D_/2,D_/2],sp/2,C.onSecondaryContainer),path.join(dir,'md_rdot.png'));
   await shot(D_,D_,circ([D_/2,D_/2],sp/2,C.surfaceContainerLow),path.join(dir,'md_tdot.png'))}
  // 2c) settings row: 24dp onSurface icons (+ disabled 38 %), 18dp 7-point star badges (primaryDim + 14dp onPrimary icon)
  {const S=G.SPEC.settings,q=px(S.icon),SD=rgba(C.onSurface,S.disabledContent[1]),SDC=rgba(C.onSurface,S.disabledContainer[1]);
   for(const [n,stem] of [['headphones','md_set_hp'],['watch','md_set_watch'],['output_off','md_set_off'],['more_vert','md_set_more'],['volume_up','md_vol_up'],['volume_down','md_vol_down'],['volume_mute','md_vol_mute']]){
    await shot(q,q,svgIcon(n,S.icon,C.onSurface,q/S.icon),path.join(dir,stem+'_24.png'));
    await shot(q,q,svgIcon(n,S.icon,SD,q/S.icon),path.join(dir,stem+'_24d.png'))}
   const bq=px(S.badge),bi=px(S.badgeIcon),bo=(bq-bi)/2,st=G.star(S.star.n,S.star.inner,S.star.rounding);
   const sd='M'+st.map(p=>(p[0]*bq).toFixed(3)+' '+(p[1]*bq).toFixed(3)).join('L')+'Z';
   for(const [n,stem] of [['volume_up','up'],['volume_down','down'],['volume_mute','mute']]){
    await shot(bq,bq,`<path d="${sd}" fill="${C[S.badgeColor]}"/><g transform="translate(${bo} ${bo})">${svgIcon(n,S.badgeIcon,C[S.badgeIconColor],bi/S.badgeIcon)}</g>`,path.join(dir,'md_badge_'+stem+'.png'));
    await shot(bq,bq,`<path d="${sd}" fill="${SDC}"/><g transform="translate(${bo} ${bo})">${svgIcon(n,S.badgeIcon,SD,bi/S.badgeIcon)}</g>`,path.join(dir,'md_badge_'+stem+'d.png'))}}
  // 2d) VolumeScreen (P3): Stepper keys VolumeUp/VolumeDown 24dp in primary (+ disabled onSurface 38 %); DeviceButton
  //     headphones / watch 24dp in onPrimary on the primary container
  {const q=px(24);for(const [n,stem] of [['volume_up','md_vs_up'],['volume_down','md_vs_down']]){
    await shot(q,q,svgIcon(n,24,C.primary,q/24),path.join(dir,stem+'_24.png'));await shot(q,q,svgIcon(n,24,DIS_F,q/24),path.join(dir,stem+'_24d.png'))}
   for(const [n,stem] of [['headphones','md_dev_hp'],['watch','md_dev_watch']])await shot(q,q,svgIcon(n,24,C.onPrimary,q/24),path.join(dir,stem+'_24.png'))}
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
