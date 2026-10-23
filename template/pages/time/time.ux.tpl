<template>
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
      <list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
<!-- #if pill -->
<list-item type="title" class="li-page-title"><text class="t-titleM c-on">时间</text></list-item>
<!-- #endif -->
      <list-item type="clock" class="clock-row" onswipe="onPageSwipe">
        <div class="clock-col">
          <text class="date-label">{{dateStr}}</text>
<!-- #if pill -->
          <text class="clock-digit">{{hours}}</text><text class="clock-digit">{{minutes}}</text>
<!-- #else -->
          <text class="clock-digit">{{hm}}</text>
<!-- #endif -->
          <text class="seconds-label">{{ss}} 秒 · {{ampm}}</text>
          <image class="seconds-bar" src="{{secondsImage}}"></image>
          <div class="clock-action" onclick="toggleH"><div class="cbtn bf"><text class="t-labelM c-onPri">{{h24 ? '改为 12 小时' : '改为 24 小时'}}</text></div></div>
        </div>
      </list-item>
      <list-item type="straight-title" class="li-hdr"><text class="t-titleS c-onSV">TimeText · 直排</text></list-item>
      <list-item type="straight" class="li-56"><text class="t-titleM c-time">{{hm}}</text></list-item>
      <list-item type="straight-status" class="li-56"><text class="t-titleM c-time">同步 · {{hm}}</text></list-item>
      <list-item type="arc-title" class="li-hdr"><text class="t-titleS c-onSV">TimeText · Arc</text></list-item>
      <list-item type="arc-clock" class="arc-row"><div class="arc-panel">$[arcTemplate(false)]</div></list-item>
      <list-item type="arc-status" class="arc-row"><div class="arc-panel">$[arcTemplate(true)]</div></list-item>
      <list-item type="arc-note" class="li-note"><text class="note">状态文字 · 分隔符 · 时间</text></list-item>
      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
  </div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/time.css */
</style>
<script>
// #include @wear/base_head.js
import { progressImage } from '../../common/m3.js'
const LINE = $[images('linear')]
const WEEK=['日','一','二','三','四','五','六']
export default{
  private:{
// #include @wear/base_data.js
    pageTitle:"时间",
    tlcBase:-1,clockVisible:true,hm:'10:08',hours:'10',minutes:'08',ss:'00',dateStr:'10月23日 周五',ampm:'24 小时制',secondsImage:LINE[0]
  },
  onInit(){this.setLayout([])},
  clockSecondsVisible(){return this.clockVisible},
  onScrolled(y){const row=this.rowBounds('clock'),visible=row.bottom>y&&row.top<y+DEV.H;if(this.clockVisible!==visible){this.clockVisible=visible;this.stopClock();this.startClock()}},
  onTick(d){
    let h=d.getHours()
    this.ampm=this.h24?'24 小时制':h<12?'上午':'下午'
    if(!this.h24)h=h%12||12
    this.hours=pad2(h);this.minutes=pad2(d.getMinutes())
    this.hm=this.hours+':'+this.minutes;this.ss=pad2(d.getSeconds())
    this.dateStr=(d.getMonth()+1)+'月'+d.getDate()+'日 周'+WEEK[d.getDay()]
    this.secondsImage=progressImage(LINE,d.getSeconds()/59*100)
  },
  toggleH(){this.h24=!this.h24;this.tick();this.vib()},
// #include @wear/base.js
}
</script>
