// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Media controls (Horologist media-ui-material3): build-time constants + module-level state (md* names only).
const MDC=$[mdJs()]
let mdRelTimer=null,mdMqTimer=null,mdVisible=false
const mdS={press:'',playing:false,playOn:true,prevOn:true,nextOn:true,loading:false,q:0,f:0,rel:false}
// Ring overlay for lobe k at quantised progress q/steps ('' = none); same rule as tools/media-geom.js lobeState.
function mdLobe(k,q,steps){const n=q*10-k*steps;if(n<=0)return '';return MDC.lobes[k+'_'+(n>=steps?'I':'P'+Math.round(n*4/steps))]}
// Width estimate of one line (API 1 has no text measurement): CJK 1em, Latin ~0.58em bold. [derived]
function mdTextW(s,fs,bold){let w=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);
 w+=c>0x2e7f?1:c===32?.28:/[A-Z0-9]/.test(s[i])?.64:/[iljt.,:;'!|]/.test(s[i])?.3:.55}return w*fs*(bold?1.05:1)}
