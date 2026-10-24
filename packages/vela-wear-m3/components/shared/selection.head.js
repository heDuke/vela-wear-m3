// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// #include @wear/range.head.js
// SwitchButton sprites (androidx default: tick always drawn in the thumb). on/off = time-indexed frames, one per SW.ms
// page timer step; thumb on fastEffectsSpec, track/border/thumb/tick colours on slowEffectsSpec; SW.p = thumb progress per frame.
const SW=$[switchJs()],SW_LAST=SW.on.length-1,CHECK=$[images('check')]
let checkTimer=null,checkPosition=8,switchTimer=null
function switchSrc(it){return it.disabled?SW.dis[it.checked?1:0]:(it.dir?SW.on:SW.off)[it.frame]}
function variants(kind){const rows=[];for(let i=0;i<4;i++){const checked=i%2===0,disabled=i>=2,it={id:'sw'+i,leading:kind===1,checked,disabled,label:checked?'已开启':'已关闭',caption:disabled?'禁用':'点按切换',dir:checked?1:0,frame:SW_LAST};it.src=switchSrc(it);rows.push(it)}return rows}
