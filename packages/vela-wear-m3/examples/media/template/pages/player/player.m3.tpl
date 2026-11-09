<template>
fun Player() {
  MediaColumn {
    PlayerScreen(marquee = true, left = "prev", right = "next")
    DemoTap()
    MediaActions()
    MediaQueue()
  }
}
</template>
<style>
.demo-tap{position:absolute;left:$[Math.round(W*.15)]px;top:$[mdGeo.infoTop]px;width:$[W-2*Math.round(W*.15)]px;height:$[dp(38)]px;}
</style>
<script>
// Full PlayerScreen with simulated playback (no audio) + the Wear OS media page below it in ONE vertical scroll:
// header, like / shuffle / repeat (MediaActions), "接下来播放" card and the queue (MediaQueue). Shuffle reorders the
// play order, repeat off / all / one decides what comes next, a queue tap plays that track, the card plays the next one.
// Title tap cycles demo states: long title (marquee) / nothing playing / not connected / loading / back to normal.
// Output button opens the VolumeScreen (pages/volume); more button switches the output icon headphones <-> watch.
const TRACKS=[{t:'Shooting Star',a:'STUPID GUYS',d:198},{t:'Blush（合作音乐人：Mylk）',a:'fusq',d:174},{t:'reflect me internet',a:'z²和DC Mizey',d:161},
 {t:'Simmer（feat. Riz La Vie）',a:'Riz La Vie',d:189},{t:'很长很长的歌曲标题会以跑马灯方式滚动显示',a:'示例歌手 · 一张名字也很长的示例专辑',d:200}]
let built=false,simTimer=null,pos=0,track=0,playing=false,demo=0,watch=false,order=[0,1,2,3,4],shuffle=false,repeat='off'
const liked={}
export default {
  private: { isHome: false },
  onInit(){this.setLayout(this.mlLayout([$[H]],TRACKS.length));this.mdSetVolume(.5,false);this.load(0,false)},
  pageShow(){this.mdShow();if(playing)this.sim()},
  pageHide(){this.stopSim();this.mdHide()},
  // play order (shuffle keeps the current track first), next track by repeat mode (one: same, all: wrap, off: stop)
  at(){return order.indexOf(track)},
  nextOf(skip){const p=this.at();if(repeat==='one'&&!skip)return track;if(p+1<order.length)return order[p+1];return repeat==='off'?-1:order[0]},
  prevOf(){const p=this.at();if(p>0)return order[p-1];return repeat==='off'?-1:order[order.length-1]},
  reorder(){const rest=TRACKS.map((x,i)=>i).filter(i=>i!==track)
    if(shuffle){for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=rest[i];rest[i]=rest[j];rest[j]=t}order=[track].concat(rest)}
    else order=TRACKS.map((x,i)=>i)},
  // the queue list is rebuilt only when the play order changes (a rebuild costs ~200 ms of JS on the emulator and
  // would stall the next/previous Lottie frames that start on the same click)
  paintList(items){const n=this.nextOf(true),t=TRACKS[track]
    this.maSet({title:t.t,artist:t.a,liked:!!liked[track],shuffle,repeat,next:n<0?'没有了':TRACKS[n].t})
    if(items)this.mqSetItems(order.map(i=>({id:i,title:TRACKS[i].t,artist:TRACKS[i].a})),track);else this.mqSetCurrent(track)},
  load(i,keep){const first=!built;built=true;track=i;pos=0;const t=TRACKS[track];this.mdSetMeta(t.t,t.a);this.mdSetProgress(0);this.keys();this.paintList(first);if(keep&&playing)this.sim()},
  keys(){this.mdSetEnabled({play:true,prev:pos>3||this.prevOf()>=0,next:this.nextOf(true)>=0})},
  sim(){this.stopSim();simTimer=setInterval(()=>{pos++;const d=TRACKS[track].d;if(pos>=d){const n=this.nextOf(false);if(n<0){playing=false;this.mdSetState('paused');this.load(track,false)}else this.load(n,true);return}this.mdSetProgress(pos/d);if(pos===4)this.keys()},1000)},
  stopSim(){if(simTimer)clearInterval(simTimer);simTimer=null},
  maOnLike(b){liked[track]=b},
  maOnShuffle(b){shuffle=b;this.reorder();this.paintList(true);this.keys()},
  maOnRepeat(m){repeat=m;this.paintList(false);this.keys()},
  maOnNext(){const n=this.nextOf(true);if(n>=0)this.load(n,true)},
  mqOnItem(id){this.load(id,true);if(!playing)this.mdOnPlay()},
  mdOnPlay(){playing=true;this.mdSetState('playing');this.sim()},
  mdOnPause(){playing=false;this.mdSetState('paused');this.stopSim()},
  mdOnPrev(){if(pos>3||this.prevOf()<0){pos=0;this.mdSetProgress(0);this.keys()}else this.load(this.prevOf(),true)},
  mdOnNext(){const n=this.nextOf(true);if(n>=0)this.load(n,true)},
  mdOnOutput(){router.push({uri:'pages/volume'})},
  mdOnMore(){watch=!watch;this.mdSetOutput(watch?'watch':'headphones')},
  demoNext(){demo=(demo+1)%5
    if(demo===1)this.load(4,true)
    else if(demo===2){this.stopSim();this.mdSetState('none')}
    else if(demo===3){this.mdSetState('disconnected')}
    else if(demo===4){this.mdSetState('loading')}
    else{playing=false;this.mdSetState('paused');this.load(0,false)}}
}
</script>
