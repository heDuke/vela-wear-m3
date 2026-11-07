<template>
fun Podcast() {
  MediaInfo()
  MediaButtonRow(left = "back5", right = "fwd30")
  TimeText()
}
</template>
<script>
let simTimer=null,pos=0,playing=false
const DUR=1800
export default {
  private: { isHome: false },
  onInit(){this.mdSetMeta('第 12 期：类型的力量','播客节目');pos=180;this.mdSetProgress(pos/DUR)},
  pageShow(){this.mdShow();if(playing)this.sim()},
  pageHide(){this.stopSim();this.mdHide()},
  sim(){this.stopSim();simTimer=setInterval(()=>{pos=Math.min(DUR,pos+1);this.mdSetProgress(pos/DUR)},1000)},
  stopSim(){if(simTimer)clearInterval(simTimer);simTimer=null},
  mdOnPlay(){playing=true;this.mdSetPlaying(true);this.sim()},
  mdOnPause(){playing=false;this.mdSetPlaying(false);this.stopSim()},
  mdOnSeek(sec){pos=Math.max(0,Math.min(DUR,pos+sec));this.mdSetProgress(pos/DUR)}
}
</script>
