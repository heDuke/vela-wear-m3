// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
toggleSwitch(i){const it=this.switches[i];if(it.disabled)return;it.checked=!it.checked;this.vib();this.animateControl('switch'+i,it.checked?1:0,it.position/9)},
stopSwitches(){this.switches.forEach((it,i)=>{delete motions['switch'+i];it.position=it.checked?9:0;if(!it.disabled)it.src=SW[it.tick?1:0][it.position]})},
tBt(){this.bt=!this.bt;const target=this.bt?8:0;if(checkTimer)clearInterval(checkTimer);if(checkPosition===target)return;checkTimer=setInterval(()=>{checkPosition+=target>checkPosition?1:-1;this.checkSrc=CHECK[checkPosition];if(checkPosition===target){clearInterval(checkTimer);checkTimer=null}},33)},
pick(i){this.sel=i;this.radios.forEach((r,j)=>{this.animateControl('radio'+j,j===i?1:0,r.st.opacity||0)})},
onMotionFrame(id,p){if(id.indexOf('switch')===0){const i=+id.slice(6),it=this.switches[i],index=Math.round(p*9);if(it&&it.position!==index){it.position=index;it.src=SW[it.tick?1:0][index]}}if(id.indexOf('radio')===0){const i=+id.slice(5);this.radios[i].st={opacity:p,transform:JSON.stringify({scaleX:p,scaleY:p})}}},
updateSlider(){const w=$[CW-dp(pill?24:104)];this.sliderStyle={width:Math.round(w*this.lvl/5)+'px',opacity:this.lvl?1:0};this.separators=this.sliderMode===1?[1,2,3,4].map(i=>({id:i,st:{left:Math.round((w+$[dp(4)])*i/5-$[dp(2)])+'px'}})):[]},
nextSlider(){this.sliderMode=(this.sliderMode+1)%3;this.sliderName=['连续','分段','变色'][this.sliderMode];this.updateSlider()},
dec(){if(this.lvl>0){this.lvl--;this.updateSlider();this.vib()}},inc(){if(this.lvl<5){this.lvl++;this.updateSlider();this.vib()}},nWifi(e){this.wifi=e.checked},nLvl(e){this.lvl=Math.max(0,Math.min(5,Math.round(e.progress)));this.updateSlider()},
pageHide(){this.stopSwitches();if(checkTimer)clearInterval(checkTimer);checkTimer=null;checkPosition=this.bt?8:0;this.checkSrc=CHECK[checkPosition]},
