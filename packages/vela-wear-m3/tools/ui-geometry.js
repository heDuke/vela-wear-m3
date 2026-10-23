// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Geometry shared by asset generation, Vela templates and visual verification.
// Reference: androidx 2f557dc1f1ec71edae73e2c16b0e446523c644b7.
const { C } = require('./tokens');
const clamp = (v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function bezier(x1,y1,x2,y2,x) {
  let lo=0,hi=1,t=x;
  for(let i=0;i<24;i++){t=(lo+hi)/2;const a=1-t,px=3*a*a*t*x1+3*a*t*t*x2+t*t*t;if(px<x)lo=t;else hi=t;}
  return 3*(1-t)*(1-t)*t*y1+3*(1-t)*t*t*y2+t*t*t;
}
function spring(ms,damping=.55,stiffness=800) {
  const t=ms/1000,w=Math.sqrt(stiffness),wd=w*Math.sqrt(1-damping*damping);
  return 1-Math.exp(-damping*w*t)*(Math.cos(wd*t)+damping*w/wd*Math.sin(wd*t));
}
function spinner(ms) {
  const t=(ms%5000)/1250,phase=Math.floor(t),q=t-phase,e=bezier(.2,0,0,1,q);
  const progress=[.8*e,.8-.6*e,.2+.6*e,.8*(1-e)][phase];
  const rotation=1440*ms/5000+(phase<1?0:phase<2?360*e:phase<3?360:360+360*e);
  return {start:270+rotation,sweep:Math.max(2,progress*360)};
}
function device(d) {
  const px=n=>Math.round(n*d.k),pill=d.shape==='pill',round=d.shape==='circle';
  const hp=px(Math.ceil(d.W/d.k*.052)),vp=px(Math.ceil(d.H/d.k*.1));
  return {...d,pill,round,hp,vp,cw:d.W-2*hp,nav: px(64),row:px(pill?68:56)};
}
module.exports={C,clamp,bezier,spring,spinner,device};
