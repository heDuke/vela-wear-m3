// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Build-time context for media-play-pause / media-controls / media-info (Horologist media-ui-material3, PLAN P1).
// Components set compile-time options with #set (mdPP / mdCtl / mdInf); media.css and media.head.js read them.
const fs=require('fs'),path=require('path'),G=require('./media-geom');
const MEDIA=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/media.json'),'utf8'));
const KINDS=Object.keys(G.SIDE);
module.exports=function(c){
 const {id,W,C,dp,pill}=c,L=G.layout(require('./devices.json')[id]),S=G.SPEC;
 const img=n=>'/common/img/'+n+'.png',B=dp(S.button);
 // ---- compile-time options -------------------------------------------------------------------------------------------
 c.mdOpts=(shape,ring,steps,rotate)=>{
  shape=shape||'scallop';if(!['scallop','round'].includes(shape))throw new Error('media shape must be scallop|round');
  if(!ring)ring=shape==='round'?'circle':'wavy';if(!['wavy','circle','none'].includes(ring))throw new Error('media ring must be wavy|circle|none');
  // default precision: 2.5 % (40 steps, 41 ring images) on watches, 5 % (20 steps, 21 images) on bands (50 KB budget)
  steps=+steps||(pill?20:40);if(![20,40].includes(steps))throw new Error('media steps must be 20 or 40');
  return {shape,ring,steps,rotate:rotate===true||rotate==='true'};
 };
 c.mdSides=(left,right)=>{left=left||'prev';right=right||'next';
  if(!KINDS.includes(left)||!KINDS.includes(right))throw new Error('media side keys: '+KINDS.join('|'));
  return {left,right,lIc:G.SIDE[left][0].endsWith('24')?'md-ic24':'md-ic',rIc:G.SIDE[right][0].endsWith('24')?'md-ic24':'md-ic'};
 };
 c.mdInfoOpts=marquee=>({marquee:marquee===true||marquee==='true'});
 // ---- markup helpers --------------------------------------------------------------------------------------------------
 c.mdLobes=()=>'<image class="md-rt" src="/common/img/md_ring_t.png"></image>'+Array.from({length:10},(_,k)=>'<image class="md-l'+k+'" if="{{mdRing['+k+']}}" src="{{mdRing['+k+']}}"></image>').join('');
 // ---- geometry (px) ---------------------------------------------------------------------------------------------------
 const g={vertical:L.vertical,B,pill64:dp(64),pillUp:dp(64+S.expansion),pillDown:dp(64-S.expansion)};
 if(!L.vertical){
  g.outer=dp(L.pad.outer);g.inner=dp(L.pad.inner);g.ph=dp(L.pillH);g.rowH=dp(L.midH);
  g.mid=B;g.side=Math.round((W-2*g.outer-2*g.inner-B)/2);g.mid=W-2*g.outer-2*g.inner-2*g.side;const e=dp(S.expansion),h=Math.round(e/2);
  g.w={'':[g.side,g.mid,g.side],prev:[g.side+e,g.mid-e,g.side],next:[g.side,g.mid-e,g.side+e],play:[g.side-h,g.mid+2*h,g.side-h]};
 }else{
  const cw=W-2*dp(L.HP),gap=dp(L.pad.gap),side=Math.floor((cw-gap)/2),e=dp(S.expansion);
  g.gap=cw-2*side;g.ph=dp(L.rowH);g.side=side;g.cw=cw;g.rowGap=dp(L.rowTop-L.playTop-S.button);
  g.w={'':[side,B,side],prev:[side+e,B,side-e],next:[side-e,B,side+e],play:[side,B,side]};
 }
 g.r=w=>Math.floor(Math.min(w,g.ph)/2);
 c.mdGeo=g;
 const fs_=dp(L.info.title),afs=dp(L.info.sub),tw=Math.round(dp(L.info.titleW)),aw=Math.round(dp(L.info.subW)),fw=dp(S.info.edge);
 // ---- CSS -------------------------------------------------------------------------------------------------------------
 c.mdCss=()=>{
  const pp=c.mdPP,ctl=c.mdCtl,inf=c.mdInf,dis=C.onSurface,rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
  const DC=rgba(dis,S.colors.disabledContainer[1]);let o='';
  const press=G.fitSpring(S.pressStiffness,100),rel=G.fitSpring(S.releaseStiffness,450);
  o+='.md-tin{transition-duration:100ms;transition-timing-function:cubic-bezier('+press.x1+',0,'+press.x2+',1);}\n.md-tout{transition-duration:450ms;transition-timing-function:cubic-bezier('+rel.x1+',0,'+rel.x2+',1);}\n';
  o+='.md-at-info{position:absolute;left:0px;top:'+dp(L.info.top)+'px;width:'+W+'px;}\n.md-at-ctl{position:absolute;left:0px;top:'+dp(L.vertical?L.playTop:L.topH)+'px;width:'+W+'px;}\n';
  if(pp){
   o+='.md-pp{width:'+B+'px;height:'+B+'px;justify-content:center;align-items:center;transition-property:width;}\n';
   o+='.md-ring{position:absolute;left:0px;top:0px;width:'+B+'px;height:'+B+'px;transition-property:opacity;transition-duration:100ms;}\n';
   if(pp.ring==='wavy'){o+='.md-rt{position:absolute;left:0px;top:0px;width:'+B+'px;height:'+B+'px;}\n';
    for(let k=0;k<10;k++){const b=MEDIA[id].lobes[k];o+='.md-l'+k+'{position:absolute;left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px;}\n';}}
   const arc='width:'+B+'px;height:'+B+'px;stroke-width:'+dp(S.stroke)+'px;color:'+C[S.colors.ring]+';layer-color:'+C[S.colors.track]+';start-angle:0deg;total-angle:360deg;';
   if(pp.ring==='circle')o+='.md-arc{'+arc+'}\n';
   o+='.md-load{position:absolute;left:0px;top:0px;width:'+B+'px;height:'+B+'px;transform:rotate(0deg);transform-origin:'+B/2+'px '+B/2+'px;animation-name:mdLoad;animation-duration:1500ms;animation-timing-function:linear;animation-iteration-count:infinite;}\n';
   o+='.md-larc{'+arc+'}\n@keyframes mdLoad{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}\n';
   if(pp.shape==='scallop'){const s=dp(8),q=dp(64);o+='.md-sc{position:absolute;left:'+s+'px;top:'+s+'px;width:'+q+'px;height:'+q+'px;transform:rotate(0deg);transform-origin:'+q/2+'px '+q/2+'px;}\n';
    if(pp.rotate)o+='.md-spin{animation-name:mdSpin;animation-duration:3000ms;animation-timing-function:steps(30);animation-iteration-count:infinite;}\n@keyframes mdSpin{0%{transform:rotate(0deg);}100%{transform:rotate(-36deg);}}\n';}
   o+='.md-pill{width:'+g.pill64+'px;height:'+g.pill64+'px;border-width:1px;border-radius:'+g.pill64/2+'px;justify-content:center;align-items:center;transition-property:width;}\n';
   o+='.md-pon{background-color:'+C.primary+';border-color:'+C.primary+';}\n.md-poff{background-color:rgba(0,0,0,0);border-color:rgba(0,0,0,0);}\n.md-pdis{background-color:'+DC+';border-color:'+DC+';}\n';
   o+='.md-ic{width:'+dp(S.icon)+'px;height:'+dp(S.icon)+'px;}\n';
  }
  if(ctl){
   o+='.md-ic24{width:'+dp(S.seekIcon)+'px;height:'+dp(S.seekIcon)+'px;}\n';
   o+='.md-side{height:'+g.ph+'px;border-width:1px;justify-content:center;align-items:center;transition-property:width;}\n';
   o+='.md-son{background-color:'+C[S.colors.side]+';border-color:'+C[S.colors.side]+';}\n.md-sdis{background-color:'+DC+';border-color:'+DC+';}\n';
   if(!g.vertical)o+='.md-ctl{width:'+W+'px;height:'+g.rowH+'px;flex-direction:row;align-items:center;}\n.md-sl{margin-left:'+g.outer+'px;margin-right:'+g.inner+'px;}\n.md-sr{margin-left:'+g.inner+'px;margin-right:'+g.outer+'px;}\n';
   else o+='.md-ctl{width:'+W+'px;flex-direction:column;align-items:center;}\n.md-row{width:'+g.cw+'px;height:'+g.ph+'px;margin-top:'+g.rowGap+'px;flex-direction:row;}\n.md-sl{margin-right:'+g.gap+'px;}\n.md-sr{margin-left:0px;}\n';
  }
  if(inf){
   const th=dp(S.info.titleH),ah=dp(S.info.subH);
   o+='.md-info{width:'+W+'px;flex-direction:column;align-items:center;}\n';
   o+='.md-tl{width:'+tw+'px;height:'+th+'px;justify-content:center;}\n.md-al{width:'+aw+'px;height:'+ah+'px;justify-content:center;}\n';
   o+='.md-tt{width:'+tw+'px;height:'+th+'px;font-size:'+fs_+'px;line-height:'+th+'px;color:'+C.onSurface+';font-weight:bold;text-align:center;lines:1;text-overflow:ellipsis;}\n';
   o+='.md-at{width:'+aw+'px;height:'+ah+'px;font-size:'+afs+'px;line-height:'+ah+'px;color:'+C.onSurface+';text-align:center;lines:1;text-overflow:ellipsis;}\n';
   o+='.md-none{width:'+tw+'px;height:'+th+'px;font-size:'+fs_+'px;line-height:'+th+'px;color:'+C[S.colors.nothing]+';font-weight:bold;text-align:center;lines:1;text-overflow:ellipsis;}\n';
   o+='.md-fr{position:absolute;left:'+(tw-fw)+'px;top:0px;width:'+fw+'px;height:'+th+'px;}\n.md-fl{position:absolute;left:0px;top:0px;width:'+fw+'px;height:'+th+'px;}\n.md-fra{position:absolute;left:'+(aw-fw)+'px;top:0px;width:'+fw+'px;height:'+ah+'px;}\n';
   if(inf.marquee)o+='.md-mq{width:'+tw+'px;height:'+th+'px;font-size:'+fs_+'px;color:'+C.onSurface+';}\n';
   const [b1,b2]=S.loadingBars;
   o+='.md-ph{border-width:1px;background-color:'+C.outlineVariant+';border-color:'+C.outlineVariant+';animation-name:mdPulse;animation-duration:1200ms;animation-iteration-count:infinite;animation-timing-function:linear;}\n';
   o+='.md-ph1{width:'+dp(b1[0])+'px;height:'+dp(b1[1])+'px;border-radius:'+dp(b1[1]/2)+'px;margin-top:'+Math.round((th-dp(b1[1]))/2)+'px;margin-bottom:'+Math.round((th-dp(b1[1]))/2)+'px;}\n';
   o+='.md-ph2{width:'+dp(b2[0])+'px;height:'+dp(b2[1])+'px;border-radius:'+dp(b2[1]/2)+'px;margin-top:'+Math.round((ah-dp(b2[1]))/2)+'px;}\n';
   o+='@keyframes mdPulse{0%{opacity:1;}50%{opacity:0.4;}100%{opacity:1;}}\n';
  }
  return o;
 };
 // ---- runtime constants -----------------------------------------------------------------------------------------------
 c.mdJs=()=>{
  const pp=c.mdPP,ctl=c.mdCtl,inf=c.mdInf,o={};
  if(pp){
   o.steps=pp.steps;o.ring=pp.ring;o.shape=pp.shape;o.rotate=pp.rotate;
   if(pp.ring==='wavy')o.lobes=Object.fromEntries(G.lobeNames(pp.steps).map(n=>[n.slice(4),img(n)]));
   o.sc=img('md_scallop');o.scD=img('md_scallop_d');
   o.ic={play:img('md_play_32'),pause:img('md_pause_32'),playD:img('md_play_32d'),pauseD:img('md_pause_32d')};
   o.pw={'':g.pill64,play:g.vertical?g.pill64:g.pillUp,side:g.vertical?g.pill64:g.pillDown};
   if(pp.shape==='round')o.sc=o.scD='';
  }
  o.vertical=g.vertical;o.w=g.w||null;o.ph=g.ph||0;
  if(ctl){const sd=k=>({ic:img(G.SIDE[k][0]),icD:img(G.SIDE[k][0]+'d'),seek:G.SIDE[k][2]});o.l=sd(ctl.left);o.r=sd(ctl.right)}
  if(inf)o.info={fs:fs_,afs,tw,aw,marquee:inf.marquee,amt:dp(S.marquee.speed),gap:dp(S.marquee.gap),pause:S.marquee.pause};
  return JSON.stringify(o);
 };
 // pill/side style objects for the initial (idle) state
 c.mdStyle=(slot)=>{const w=g.w?g.w[''][slot]:0;return JSON.stringify(slot===1?{width:w+'px'}:{width:w+'px',borderRadius:g.r(w)+'px'})};
 return c;
};
