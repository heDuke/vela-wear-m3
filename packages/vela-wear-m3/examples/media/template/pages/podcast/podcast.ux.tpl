<template>
<div class="page" onswipe="onPageSwipe">
<div class="md-at-info" >
<!-- #component media-info {} -->
</div>
<div class="md-at-ctl">
<!-- #component media-controls {"left":"'back5'","right":"'fwd30'"} -->
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
// Podcast variant (SeekBackButton 5 s / SeekForwardButton 30 s) with simulated playback; mdOnSeek receives seconds.
// #include @wear/base_head.js
// #include @wear/media.head.js
let simTimer=null,pos=0,playing=false
const DUR=1800
export default {
private:{
// #include @wear/base_data.js
// #include @wear/media.data.js
isHome:false,tlcBase:-1
},
onInit(){this.setLayout([]);this.mdSetMeta('第 12 期：类型的力量','播客节目');pos=180;this.mdSetProgress(pos/DUR)},
pageShow(){this.mdShow();if(playing)this.sim()},
pageHide(){this.stopSim();this.mdHide()},
sim(){this.stopSim();simTimer=setInterval(()=>{pos=Math.min(DUR,pos+1);this.mdSetProgress(pos/DUR)},1000)},
stopSim(){if(simTimer)clearInterval(simTimer);simTimer=null},
mdOnPlay(){playing=true;this.mdSetPlaying(true);this.sim()},
mdOnPause(){playing=false;this.mdSetPlaying(false);this.stopSim()},
mdOnSeek(sec){pos=Math.max(0,Math.min(DUR,pos+sec));this.mdSetProgress(pos/DUR)},
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
