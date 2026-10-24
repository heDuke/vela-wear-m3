// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// StepperLevelIndicator geometry (assets/animations.json "level"): screen-centre circle, start/sweep/gap in degrees.
const LV=$[levelJs()]
// ScrollIndicatorDefaults.PositionAnimationSpec = tween(500, CubicBezierEasing(0,0,0,1)). With x1=x2=0 the curve's
// x(m)=m^3, so the easing is exact in closed form: m=cbrt(x), y=3m^2-2m^3.
const LV_MS=500
const lvEase=x=>{if(x<=0)return 0;if(x>=1)return 1;const m=Math.pow(x,1/3);return m*m*(3-2*m)}
let lvFrom=0,lvTo=-1,lvT0=0,lvTimer=null
// Stepper buttons: PrimaryContainer -> Primary 10% state layer (ripple pressedAlpha 0.10) = #5D4D84.
const KEY_IDLE=$[JSON.stringify([1,3,5].map(i=>parseInt(C.primaryContainer.slice(i,i+2),16)))],KEY_PRESSED=$[JSON.stringify([1,3,5].map(i=>{const a=parseInt(C.primaryContainer.slice(i,i+2),16),b=parseInt(C.primary.slice(i,i+2),16);return Math.round(a+(b-a)*.1)}))]
