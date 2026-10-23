// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// #include @wear/range.head.js
const SW=[$[images('switchPlain')],$[images('switchIcon')]],SWD=[$[images('switchDisabledPlain')],$[images('switchDisabledIcon')]],CHECK=$[images('check')]
let checkTimer=null,checkPosition=8
function variants(kind){const rows=[];for(let i=0;i<4;i++){const checked=i%2===0,disabled=i>=2,tick=kind%2===1;rows.push({id:'s'+kind+'_'+i,leading:kind>=2,tick,checked,disabled,label:checked?'已开启':'已关闭',caption:disabled?'禁用':'点按切换',position:checked?9:0,src:disabled?SWD[tick?1:0][checked?1:0]:SW[tick?1:0][checked?9:0]})}return rows}
