<template>
<div class="page" onswipe="onPageSwipe">
<div class="md-at-info" onclick="demoNext">
<!-- #component media-info {"marquee":"true"} -->
</div>
<div class="md-at-ctl">
<!-- #component media-controls {} -->
</div>
<!-- #component time-text {} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/media.css */
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// Simulated playback (no audio): the page owns the player state and feeds the UI-only media components.
// Tapping the title cycles example states: long title (marquee) / disabled keys / loading / nothing playing.
// #include @wear/base_head.js
// #include @wear/media.head.js
const TRACKS=[{t:'晴天',a:'周杰伦 · 叶惠美',d:269},{t:'Weather with You',a:'Crowded House',d:224},{t:'很长很长的歌曲标题会以跑马灯方式滚动显示',a:'示例歌手 · 一张名字也很长的示例专辑',d:200}]
let simTimer=null,pos=0,track=0,playing=false,demo=0
export default {
private:{
// #include @wear/base_data.js
// #include @wear/media.data.js
isHome:false,tlcBase:-1
},
onInit(){this.setLayout([]);this.load(0,false)},
pageShow(){this.mdShow();if(playing)this.sim()},
pageHide(){this.stopSim();this.mdHide()},
load(i,keep){track=(i+TRACKS.length)%TRACKS.length;pos=0;const t=TRACKS[track];this.mdSetMeta(t.t,t.a);this.mdSetProgress(0);this.keys();if(keep&&playing)this.sim()},
keys(){this.mdSetEnabled({play:true,prev:track>0||pos>3,next:track<TRACKS.length-1})},
sim(){this.stopSim();simTimer=setInterval(()=>{pos++;const d=TRACKS[track].d;if(pos>=d){this.load(track+1,true);return}this.mdSetProgress(pos/d);if(pos===4)this.keys()},1000)},
stopSim(){if(simTimer)clearInterval(simTimer);simTimer=null},
mdOnPlay(){playing=true;this.mdSetPlaying(true);this.sim()},
mdOnPause(){playing=false;this.mdSetPlaying(false);this.stopSim()},
mdOnPrev(){if(pos>3){pos=0;this.mdSetProgress(0);this.keys()}else this.load(track-1,true)},
mdOnNext(){this.load(track+1,true)},
demoNext(){demo=(demo+1)%5
 if(demo===1)this.load(2,true)
 else if(demo===2){this.load(0,true);this.mdSetEnabled({prev:false,next:false})}
 else if(demo===3){this.keys();this.mdSetInfo('loading');this.mdSetLoading(true)}
 else if(demo===4){this.mdSetLoading(false);this.mdOnPause();this.mdSetInfo('none')}
 else this.load(0,true)},
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
