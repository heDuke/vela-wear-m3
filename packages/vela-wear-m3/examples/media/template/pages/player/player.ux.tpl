<template>
<div class="page" onswipe="onPageSwipe">
<!-- #component media-player {"marquee":"true"} -->
<div class="demo-tap" onclick="demoNext"></div>
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/media.css */
/* the title area cycles the demo states (transparent overlay above the media info) */
.demo-tap{position:absolute;left:$[Math.round(W*.15)]px;top:$[mdGeo.infoTop]px;width:$[W-2*Math.round(W*.15)]px;height:$[dp(38)]px;}
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// Full PlayerScreen with simulated playback (no audio): the page owns the player state and feeds the UI components.
// Title tap cycles demo states: long title (marquee) / nothing playing / not connected / loading / back to normal.
// Output button = simulated volume step (shows the level indicator, the P3 volume screen will open here); more button
// switches the output icon headphones <-> watch.
// #include @wear/base_head.js
// #include @wear/media.head.js
const TRACKS=[{t:'晴天',a:'周杰伦 · 叶惠美',d:269},{t:'Weather with You',a:'Crowded House',d:224},{t:'很长很长的歌曲标题会以跑马灯方式滚动显示',a:'示例歌手 · 一张名字也很长的示例专辑',d:200}]
const VOL=[.5,.6,.7,.8,.9,1,0,.1,.2,.3,.4]
let simTimer=null,pos=0,track=0,playing=false,demo=0,vol=0,watch=false
export default {
private:{
// #include @wear/base_data.js
// #include @wear/media.data.js
isHome:false,tlcBase:-1
},
onInit(){this.setLayout([]);this.mdSetVolume(VOL[0],false);this.load(0,false)},
pageShow(){this.mdShow();if(playing)this.sim()},
pageHide(){this.stopSim();this.mdHide()},
load(i,keep){track=(i+TRACKS.length)%TRACKS.length;pos=0;const t=TRACKS[track];this.mdSetMeta(t.t,t.a);this.mdSetProgress(0);this.keys();if(keep&&playing)this.sim()},
keys(){this.mdSetEnabled({play:true,prev:track>0||pos>3,next:track<TRACKS.length-1})},
sim(){this.stopSim();simTimer=setInterval(()=>{pos++;const d=TRACKS[track].d;if(pos>=d){this.load(track+1,true);return}this.mdSetProgress(pos/d);if(pos===4)this.keys()},1000)},
stopSim(){if(simTimer)clearInterval(simTimer);simTimer=null},
mdOnPlay(){playing=true;this.mdSetState('playing');this.sim()},
mdOnPause(){playing=false;this.mdSetState('paused');this.stopSim()},
mdOnPrev(){if(pos>3){pos=0;this.mdSetProgress(0);this.keys()}else this.load(track-1,true)},
mdOnNext(){this.load(track+1,true)},
mdOnOutput(){vol=(vol+1)%VOL.length;this.mdShowVolume(VOL[vol])},
mdOnMore(){watch=!watch;this.mdSetOutput(watch?'watch':'headphones')},
demoNext(){demo=(demo+1)%5
 if(demo===1)this.load(2,true)
 else if(demo===2){this.stopSim();this.mdSetState('none')}
 else if(demo===3){this.mdSetState('disconnected')}
 else if(demo===4){this.mdSetState('loading')}
 else{playing=false;this.mdSetState('paused');this.load(0,false)}},
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
