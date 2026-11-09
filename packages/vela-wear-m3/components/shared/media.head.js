// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Media controls (Horologist media-ui-material3): build-time constants + module-level state (md* names only).
const MDC=$[mdJs()]
let mdRelTimer=null,mdMqTimer=null,mdVisible=false
// Lottie click frames (enhanced: M3Next.json every 3rd frame, 50 ms each; prev mirrored): side -> frame index 1..9
const mdLot={l:0,r:0,t:{},s:{}}
// play / pause icon (enhanced, M3PlayPause): position 1 (pause) .. 7 (play), 0 = not painted yet
const mdPp={pos:0,tgt:0,t:null}
const mdS={press:'',playing:false,playOn:true,prevOn:true,nextOn:true,loading:false,q:0,f:0,rel:false,circ:null,rc:null,sn:0,out:'headphones',outPref:'headphones',vol:-1,setOn:true}
// Point (px, ring box) at arc length s (dp) of the continuous ring R (MDC.rw wavy table / MDC.rc analytic circle)
function mdRingPos(R,s){if(R.tab){const a=R.tab,u=Math.min(Math.max(s/R.d,0),a.length/2-1.0001),j=Math.floor(u),t=u-j
  return [a[2*j]+(a[2*j+2]-a[2*j])*t,a[2*j+1]+(a[2*j+3]-a[2*j+1])*t]}const an=-Math.PI/2+2*Math.PI*s/R.T;return [R.c0+R.r*Math.cos(an),R.c0+R.r*Math.sin(an)]}
// press morph (enhanced): shapeMorphProgress m (1 = scallop, 0 = pill), critically damped spring state; seq = frame base
const mdMf={m:1,v:0,m0:1,v0:0,tgt:1,k:0,t0:0,t:null,seq:0,q:4}
// Volume level indicator (VolumeLevelIndicator): visible 2500 ms after each event, value tween 500 ms
// CubicBezier(0,0,0,1) (closed form: m=cbrt(x), y=3m^2-2m^3), painted only while visible.
let mdLvTimer=null,mdLvTween=null
const mdLv={on:false,outEnd:0,from:0,to:-1,t0:0}
const mdLvEase=x=>{if(x<=0)return 0;if(x>=1)return 1;const m=Math.pow(x,1/3);return m*m*(3-2*m)}
// Width estimate of one line (API 1 has no text measurement): CJK 1em, Latin ~0.58em bold. [derived]
function mdTextW(s,fs,bold){let w=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);
 w+=c>0x2e7f?1:c===32?.28:/[A-Z0-9]/.test(s[i])?.64:/[iljt.,:;'!|]/.test(s[i])?.3:.55}return w*fs*(bold?1.05:1)}
