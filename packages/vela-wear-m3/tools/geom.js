// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Geometry straight from androidx sources (EdgeButton.kt ShapeHelper/EdgeButtonShape, ScrollIndicator.kt, Padding.kt).
const EB={ExtraSmall:46,Small:56,Medium:70,Large:96};
function edgeButtonShape(screenWdp, heightDp){ // returns {w,h,path(dp, origin top-left of shape bbox), contentCenterY}
  const xsH=46, xsEll=58, ratio=1.42, bottomPad=3;
  const fade=Math.max(0,1-heightDp/xsH);                       // 0 for >=46dp
  const ell = (xsEll+(heightDp-xsH)*ratio)*(1-fade)+heightDp*fade;  // lerp
  const ry=ell/2, screenR=screenWdp/2-bottomPad;
  const rx=Math.min(Math.sqrt(ry*screenR),screenR);
  const r=heightDp-ry;                                          // top corner radius
  const w=2*rx, h=heightDp, cx=rx;
  // right top corner arc (center (cx+rx-r, r)), bottom half-ellipse (center (cx, h-ry)), left top corner
  const path=`M ${cx-rx+r} 0 L ${cx+rx-r} 0 A ${r} ${r} 0 0 1 ${cx+rx} ${r} A ${rx} ${ry} 0 0 1 ${cx-rx} ${r} A ${r} ${r} 0 0 1 ${cx-rx+r} 0 Z`;
  return {w,h,rx,ry,r,path,sidePad:screenWdp/2-rx};
}
const ceil=Math.ceil;
const pad=(Wdp,Hdp)=>({h:ceil(Wdp*0.052), v:ceil(Hdp*0.10)});   // PaddingDefaults (Padding.kt)
// TLC ResponsiveTransformationSpec (lazy/ResponsiveTransformationSpec.kt + TransitionAreaProgress.kt)
function bez(x1,y1,x2,y2){ return t=>{ if(t<=0) return 0; if(t>=1) return 1; let lo=0,hi=1,u=t; for(let i=0;i<40;i++){ u=(lo+hi)/2; const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u; if(x<t) lo=u; else hi=u; } return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u; }; }
const lerp=(a,b,t)=>a+(b-a)*t, inv=(a,b,v)=>Math.max(0,Math.min(1,(v-a)/(b-a)));
function tlcSpec(screenHdp){ const S={size:192,minE:.2,maxE:.6,minT:.35,maxT:.55,scale:.7,alpha:.5}, L={size:240,minE:.15,maxE:.45,minT:.4,maxT:.6,scale:.6,alpha:.5};
  const p=inv(S.size,L.size,screenHdp); const o={}; for(const k of ['minE','maxE','minT','maxT','scale','alpha']) o[k]=lerp(S[k],L[k],p); o.ease=bez(.3,0,.7,1); return o; }
// item top/bottom in dp relative to viewport; returns {scale, alpha(container), calpha(content)}
function tlcTransform(spec, topDp, bottomDp, Hdp){ const t=topDp/Hdp, b=bottomDp/Hdp, rel=b-t;
  const sr=inv(spec.minE,spec.maxE,rel); const line=Math.min(lerp(spec.minT,spec.maxT,sr),(1+rel)/2);
  let enc; if (b < 1-t) enc=Math.min(b/line-1,0); else enc=Math.max(1-(1-t)/line,0);
  if (enc===0) return {scale:1,alpha:1,calpha:1};
  const prog= enc<0? enc+1 : 1-enc; const e=spec.ease(Math.max(0,Math.min(1,prog)));
  return {scale:lerp(spec.scale,1,e), alpha:lerp(spec.alpha,1,e), calpha:lerp(spec.alpha,1,e)}; }
module.exports={EB,edgeButtonShape,pad,tlcSpec,tlcTransform};
