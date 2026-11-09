// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Public: maSet({title,artist,liked,shuffle,repeat:'off'|'all'|'one',next}) mqSetItems([{id,title,artist,art?}],currentId?,
// highlight?) mqSetCurrent(id) opSetup({title,devices:[{id,name,type,current}],footnote}) mlLayout(extraTop[],nQueue).
// Emits (if defined): maOnLike(b) maOnShuffle(b) maOnRepeat(mode) maOnNext() mqOnItem(id,index) opOnSelect(id).
// Toggles repaint immediately on tap (Wear OS), then call back; the page may correct the state with maSet.
mlFeed(ids){const f=Object.assign({},this.feedback);ids.forEach(id=>{if(!f[id])f[id]={opacity:1}});this.feedback=f},
// IconToggleButton press: fastEffects (3800) in, defaultSpatial (700, critically damped here) out; base.js sqPress
maDown(id){this.sqPress(id,this.maR(id),ML.rP,3800,700)},
maR(id){return (id==='maLike'?mlS.liked:id==='maShuf'?mlS.shuffle:mlS.repeat!=='off')?ML.rOn:ML.rOff},
maSet(o){o=o||{};if('title' in o)this.maTitle=o.title||'';if('artist' in o)this.maArtist=o.artist||'';if('next' in o)this.maNext=o.next||''
 if('liked' in o)mlS.liked=!!o.liked;if('shuffle' in o)mlS.shuffle=!!o.shuffle;if('repeat' in o)mlS.repeat=o.repeat==='all'||o.repeat==='one'?o.repeat:'off'
 this.mlFeed(['maLike','maShuf','maRep','maNext']);this.maPaint()},
maPaint(){const put=(k,v)=>{if(this[k]!==v)this[k]=v}
 put('maLikeCls',mlS.liked?'ma-on':'ma-off');put('maLikeIc',mlS.liked?ML.ic.liked:ML.ic.like);put('maShufCls',mlS.shuffle?'ma-on':'ma-off');put('maShufIc',mlS.shuffle?ML.ic.shuf:ML.ic.shuft)
 put('maRepCls',mlS.repeat==='off'?'ma-off':'ma-on');put('maRepIc',mlS.repeat==='off'?ML.ic.rept:mlS.repeat==='one'?ML.ic.rep1:ML.ic.rep)
 ;['maLike','maShuf','maRep'].forEach(id=>this.sqRest(id,this.maR(id)))},
maTap(k){
 if(k==='like'){mlS.liked=!mlS.liked;this.maPaint();if(this.maOnLike)this.maOnLike(mlS.liked)}
 else if(k==='shuffle'){mlS.shuffle=!mlS.shuffle;this.maPaint();if(this.maOnShuffle)this.maOnShuffle(mlS.shuffle)}
 else if(k==='repeat'){mlS.repeat=mlS.repeat==='off'?'all':mlS.repeat==='all'?'one':'off';this.maPaint();if(this.maOnRepeat)this.maOnRepeat(mlS.repeat)}
 else if(k==='next'&&this.maOnNext)this.maOnNext()},
mqSetItems(items,cur,hl){mlS.items=(items||[]).slice();mlS.hl=!!hl;mlS.cur=cur===undefined?null:cur;this.mqPaint(true)},
mqSetCurrent(id){const was=mlS.cur;mlS.cur=id;if(mlS.hl&&was!==id)this.mqPaint(false)},
mqPaint(all){const ids=mlS.items.map((it,i)=>'mq'+i);if(all)this.mlFeed(ids)
 this.mqItems=mlS.items.map((it,i)=>({id:i,fid:'mq'+i,title:it.title||'',artist:it.artist||'',art:it.art||'',cls:mlS.hl&&it.id===mlS.cur?'mq-cur':'mq-tonal',c1:mlS.hl&&it.id===mlS.cur?'ml-p1':'ml-c1',c2:mlS.hl&&it.id===mlS.cur?'ml-p2':'ml-c2'}))},
mqTap(i){i=+i;const it=mlS.items[i];if(!it)return;if(this.mqOnItem)this.mqOnItem(it.id,i)},
opSetup(o){o=o||{};if(o.title)this.opTitle=o.title;this.opFoot=o.footnote||'';mlS.devices=(o.devices||[]).slice();this.mlFeed(mlS.devices.map((d,i)=>'op'+i));this.opPaint()},
opPaint(){this.opItems=mlS.devices.map((d,i)=>{const ic=ML.op[d.type]||ML.op.phone
 return {id:i,fid:'op'+i,name:d.name||'',current:!!d.current,cls:d.current?'mq-cur':'mq-tonal',c1:d.current?'ml-p1':'ml-c1',c2:d.current?'ml-p2':'ml-c2',ic:d.current?ic[0]:ic[1]}})},
opTap(i){i=+i;const d=mlS.devices[i];if(!d)return;mlS.devices.forEach((x,j)=>{x.current=j===i});this.opPaint();if(this.opOnSelect)this.opOnSelect(d.id)},
// Row heights (px) of the scroll column for setLayout: extra rows first (e.g. [H] for the player), then header, buttons,
// card, n queue items and the bottom padding.
mlLayout(extra,n,parts){const p=parts||{actions:true};const h=(extra||[]).slice();if(p.header!==false)h.push(ML.hd);if(p.actions){h.push(ML.row);h.push(ML.card)}
 for(let i=0;i<n;i++)h.push(ML.item);h.push(ML.padb);return h},
