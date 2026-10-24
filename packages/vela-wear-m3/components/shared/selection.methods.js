// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
toggleSwitch(i){const it=this.switches[i];if(!it||it.disabled)return;it.checked=!it.checked;this.vib();const dir=it.checked?1:0
 if(it.frame<SW_LAST){const p=(it.dir?SW.p.on:SW.p.off)[it.frame],q=dir?SW.p.on:SW.p.off;let best=0;for(let j=1;j<q.length;j++)if(Math.abs(q[j]-p)<Math.abs(q[best]-p))best=j;it.frame=best}else it.frame=0
 it.dir=dir;this.stepSwitches();if(!switchTimer)switchTimer=setInterval(()=>this.stepSwitches(),SW.ms)},
stepSwitches(){let moving=false;this.switches.forEach(it=>{if(it.disabled||it.frame>=SW_LAST)return;it.frame++;it.src=switchSrc(it);if(it.frame<SW_LAST)moving=true});if(!moving&&switchTimer){clearInterval(switchTimer);switchTimer=null}},
pressSwitch(i){const it=this.switches[i];if(it&&!it.disabled)this.press(it.id)},releaseSwitch(i){const it=this.switches[i];if(it)this.release(it.id)},
stopSwitches(){if(switchTimer)clearInterval(switchTimer);switchTimer=null;this.switches.forEach(it=>{it.dir=it.checked?1:0;it.frame=SW_LAST;it.src=switchSrc(it)})},
tBt(){this.bt=!this.bt;const target=this.bt?8:0;if(checkTimer)clearInterval(checkTimer);if(checkPosition===target)return;checkTimer=setInterval(()=>{checkPosition+=target>checkPosition?1:-1;this.checkSrc=CHECK[checkPosition];if(checkPosition===target){clearInterval(checkTimer);checkTimer=null}},33)},
pick(i){this.sel=i;this.radios.forEach((r,j)=>{this.animateControl('radio'+j,j===i?1:0,r.st.opacity||0)})},
onMotionFrame(id,p){if(id.indexOf('radio')===0){const i=+id.slice(5);this.radios[i].st={opacity:p,transform:JSON.stringify({scaleX:p,scaleY:p})}}},
updateSlider(){const w=$[CW-dp(pill?24:104)];this.sliderStyle={width:Math.round(w*this.lvl/5)+'px',opacity:this.lvl?1:0};this.separators=this.sliderMode===1?[1,2,3,4].map(i=>({id:i,st:{left:Math.round((w+$[dp(4)])*i/5-$[dp(2)])+'px'}})):[]},
nextSlider(){this.sliderMode=(this.sliderMode+1)%3;this.sliderName=['连续','分段','变色'][this.sliderMode];this.updateSlider()},
dec(){if(this.lvl>0){this.lvl--;this.updateSlider();this.vib()}},inc(){if(this.lvl<5){this.lvl++;this.updateSlider();this.vib()}},nWifi(e){this.wifi=e.checked},nLvl(e){this.lvl=Math.max(0,Math.min(5,Math.round(e.progress)));this.updateSlider()},
pageHide(){this.stopSwitches();if(checkTimer)clearInterval(checkTimer);checkTimer=null;checkPosition=this.bt?8:0;this.checkSrc=CHECK[checkPosition]},
