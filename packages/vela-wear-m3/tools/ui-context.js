// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
const fs=require('fs'),path=require('path');
const A=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/animations.json'),'utf8'));
const {spring}=require('./ui-geometry');
module.exports=function(c,enhanced){
 const {id,W,H,C,dp,round,pill,CW,HP}=c,a=A[id];
 c.spinCss=()=> '@keyframes indSpin{'+a.spinRotation.map((r,i)=>(i*100/150).toFixed(4)+'%{transform:rotate('+r.toFixed(3)+'deg);}').join('')+'100%{transform:rotate(2160deg);}}';c.pagerJs=()=>JSON.stringify(a.pager);c.fontJs=()=>JSON.stringify(a.font);c.tlcEaseLut=()=>JSON.stringify(Array.from({length:257},(_,i)=>+require('./ui-geometry').bezier(.3,0,.7,1,i/256).toFixed(7)));c.levelJs=()=>JSON.stringify(a.level);c.arcLoadingBox=a.arcLoadingBox;c.levelGeo=a.level;c.enhanced=enhanced;c.api=enhanced?2:1;c.NAVH=dp(round?32:56);c.DEMONAVH=dp(pill?80:56);c.ROW=dp(pill?68:56);
 c.iconsH=dp(round?64:pill?192:128);c.compactH=dp(pill?96:48);
 c.frames=n=>JSON.stringify(a[n].map(src=>({src})));c.images=n=>JSON.stringify(!enhanced&&['morph','buttonMorph','compactMorph'].includes(n)?a[n].map((src,i)=>a[n][i===18?18:0]):a[n]);
 c.switchJs=()=>JSON.stringify({on:a.switchOn,off:a.switchOff,dis:a.switchDisabled,p:a.switchThumb,ms:a.switchFrameMs});
 c.progressAssets=()=>JSON.stringify(Object.fromEntries(["ring","ringThin","ringLarge","seg","segBinary","arc","linear","linearThick","overflow"].map(n=>[n,a[n]])));
 c.siJs=()=>JSON.stringify(round?{round:true,...a.scrollBox,images:a.scroll}:{round:false,L:dp(50),y0:Math.round(H/2-dp(25))});
 c.siCss=()=>{
  if(round){const b=a.scrollBox,[tw,th]=c.png('scroll_track_arc');return '.si-track{position:absolute;left:'+(W-tw)+'px;top:'+Math.round((H-th)/2)+'px;width:'+tw+'px;height:'+th+'px;}\n.si-thumb{position:absolute;left:'+(W-b.w)+'px;top:'+Math.round((H-b.h)/2)+'px;width:'+b.w+'px;height:'+b.h+'px;transform:rotate(0deg);transform-origin:'+(b.w-W/2)+'px '+b.h/2+'px;}';}
  const w=dp(5),x=W-dp(pill?10:7);
  return '.si-track{position:absolute;left:'+x+'px;top:'+Math.round(H/2-dp(25))+'px;width:'+w+'px;height:'+dp(50)+'px;background-color:'+C.scrollTrack+';border-width:1px;border-color:'+C.scrollTrack+';border-radius:'+w/2+'px;}\n.si-thumb{position:absolute;left:'+x+'px;top:'+Math.round(H/2-dp(25))+'px;width:'+w+'px;height:'+dp(15)+'px;background-color:'+C.scrollThumb+';border-width:1px;border-color:'+C.scrollThumb+';border-radius:'+w/2+'px;}';
 };
 c.navCss=()=>'.li-nav{width:'+W+'px;height:'+c.NAVH+'px;flex-direction:row;align-items:center;justify-content:'+(round||pill?'center':'flex-start')+';padding-left:'+(round||pill?0:HP)+'px;}\n.nav-back{width:'+dp(48)+'px;height:'+dp(48)+'px;background-color:'+C.surfaceContainer+';border-width:1px;border-color:'+C.surfaceContainer+';border-radius:'+dp(24)+'px;align-items:center;justify-content:center;transform:scale(1);transform-origin:'+dp(24)+'px '+dp(24)+'px;}\n.nav-arrow{width:'+dp(24)+'px;height:'+dp(24)+'px;}';
 c.arcTemplate=status=>{
  const prefix=status?(pill?'· ':'同步 · '):'',labels=[...prefix,...'00:00'],font=dp(pill?13:15),r=CW/2-dp(4);
  const adv=labels.map(s=>s===' '?font*.3:/[0-9]/.test(s)?font*.60:s===':'?font*.3:font*.95);let x=-adv.reduce((s,v)=>s+v,0)/2;
  return labels.map((s,i)=>{const w=Math.ceil(adv[i]),deg=(x+w/2)/r*180/Math.PI;x+=adv[i];const n=i-prefix.length;
  return '<div class="arc-g" style="left:'+Math.round(CW/2-w/2)+'px;top:'+dp(3)+'px;width:'+w+'px;height:'+dp(20)+'px;transform:rotate('+deg.toFixed(2)+'deg);transform-origin:'+w/2+'px '+r+'px;"><text class="arc-char">'+(n>=0?'{{tt'+n+'}}':s)+'</text></div>';
 }).join('\n');};
 // androidx springs sampled into linear keyframes (Vela: no spring easing, no animation-fill-mode).
 // crit(k,ms): critically damped (EffectsDampingRatio=1) progress; faster(50f) => stiffness x2.25 (AnimationSpecUtils.kt).
 const crit=(k,ms)=>{const w=Math.sqrt(k),s=ms/1000;return 1-(1+w*s)*Math.exp(-w*s)};
 const kf=(name,dur,step,fn)=>{let s='@keyframes '+name+'{';for(let t=0;t<=dur;t+=step){const p=+(t*100/dur).toFixed(2);s+=p+'%{'+fn(t,t===dur)+'}'}return s+'}'};
 c.OV_IN=200;c.OV_OUT=200;c.CF_STRETCH=400;c.CF_TEXT=200;
 // Dialog.kt: Display alpha fastEffects.faster(50) (k=1400*2.25), scale 1.25->1 defaultEffects.faster(50) (k=500*2.25);
 // Hide alpha standard fastEffects (k=1400), scale 1->1.25 (k=1125).
 c.ovCss=()=>'.ovl-in{animation-name:ovIn;animation-duration:'+c.OV_IN+'ms;animation-timing-function:linear;}\n.ovl-out{opacity:0;animation-name:ovOut;animation-duration:'+c.OV_OUT+'ms;animation-timing-function:linear;}\n'
  +kf('ovIn',c.OV_IN,20,(t,end)=>'opacity:'+(end?1:+crit(3150,t).toFixed(4))+';transform:scale('+(end?1:+(1.25-.25*crit(1125,t)).toFixed(4))+');')+'\n'
  +kf('ovOut',c.OV_OUT,20,(t,end)=>'opacity:'+(end?0:+(1-crit(1400,t)).toFixed(4))+';transform:scale('+(end?1.25:+(1+.25*crit(1125,t)).toFixed(4))+');');
 const cw=Math.round(W*.537),ch=round?Math.round(H*.648):Math.round(cw*1.21),B=Math.ceil(Math.max(cw,ch)*1.2),cy=H/2-dp(pill?12:0);
 c.cfCss=()=>'.cf-circle{width:'+cw+'px;height:'+cw+'px;border-width:1px;border-color:'+C.onPrimary+';border-radius:'+cw/2+'px;background-color:'+C.onPrimary+';}\n.cf-rot{position:absolute;left:'+Math.round((W-B)/2)+'px;top:'+Math.round(cy-B/2)+'px;width:'+B+'px;height:'+B+'px;justify-content:center;align-items:center;transform:rotate(45deg);transform-origin:'+B/2+'px '+B/2+'px;}\n.cf-blob{width:'+cw+'px;height:'+ch+'px;border-width:1px;border-color:'+C.onPrimary+';border-radius:'+cw/2+'px;background-color:'+C.onPrimary+';animation-name:cfStretch;animation-duration:'+c.CF_STRETCH+'ms;animation-timing-function:linear;animation-delay:0ms;}\n.cf-icon{position:absolute;left:'+Math.round((W-dp(52))/2)+'px;top:'+Math.round(cy-dp(26))+'px;width:'+dp(52)+'px;height:'+dp(52)+'px;}\n.cf-txt{position:absolute;left:0px;top:'+(round?H-c.png('curved_saved')[1]:Math.round(cy+(cw+ch)/Math.SQRT2/2+dp(12)))+'px;width:'+W+'px;'+(round?'height:'+c.png('curved_saved')[1]+'px;':'justify-content:center;')+'animation-name:cfText;animation-duration:'+c.CF_TEXT+'ms;animation-delay:0ms;animation-timing-function:linear;}\n'+kf('cfStretch',c.CF_STRETCH,20,(t,end)=>'height:'+(end?ch:Math.round(cw+(ch-cw)*spring(t)))+'px;')+'\n'+kf('cfText',c.CF_TEXT,20,(t,end)=>'opacity:'+(end?1:+crit(1400,t).toFixed(4))+';');

 if(pill)c.dlgCss=()=>{
  const okY=H-c.VP-dp(40),xY=okY-dp(80),button=dp(60),okW=dp(63),okH=dp(54),icon=dp(28);
  return '.dlg-col{position:absolute;left:'+HP+'px;top:'+Math.round(W*.30)+'px;width:'+CW+'px;flex-direction:column;align-items:center;}\n.dlg-title{width:'+CW+'px;text-align:center;margin-top:'+dp(4)+'px;lines:2;}\n.dlg-text{width:'+CW+'px;text-align:center;margin-top:'+dp(8)+'px;lines:3;}\n.dlg-x{position:absolute;left:'+Math.round((W-button)/2)+'px;top:'+Math.round(xY-button/2)+'px;width:'+button+'px;height:'+button+'px;background-color:'+C.surfaceContainer+';border-width:1px;border-color:'+C.surfaceContainer+';border-radius:'+dp(18)+'px;justify-content:center;align-items:center;}\n.dlg-ok{position:absolute;left:'+Math.round((W-okW)/2)+'px;top:'+Math.round(okY-okH/2)+'px;width:'+okW+'px;height:'+okH+'px;background-color:'+C.primary+';border-width:1px;border-color:'+C.primary+';border-radius:'+okH/2+'px;transform:rotate(-45deg);transform-origin:'+okW/2+'px '+okH/2+'px;}\n.dlg-okp{background-color:'+C.primaryDim+';border-color:'+C.primaryDim+';}\n.ic28{width:'+icon+'px;height:'+icon+'px;}\n.dlg-okic{position:absolute;left:'+Math.round((W-icon)/2)+'px;top:'+Math.round(okY-icon/2)+'px;width:'+icon+'px;height:'+icon+'px;}';
 };

 require("./time-layout")(c,a.font);
 return c;
};
