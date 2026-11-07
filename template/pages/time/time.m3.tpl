<template>
fun TimeScreen() {
  ScreenScaffold(title = "时间") {
    TransformingLazyColumn {
      item(type = "clock", class = "clock-row") {
        ClockPanel()
      }
      item {
        ListHeader { Text("TimeText · 直排") }
      }
      item {
        Text(hm)
      }
      item {
        Text(syncLine)
      }
      item {
        ListHeader { Text("TimeText · Arc") }
      }
      item {
        ArcTimeText(status = false)
      }
      item {
        ArcTimeText(status = true)
      }
      item {
        Note("状态文字 · 分隔符 · 时间")
      }
    }
  }
}
</template>
<script>
import { progressImage } from '../../common/m3.js'
const LINE = $[images('linear')]
const WEEK=['日','一','二','三','四','五','六']
export default {
  private: {
    clockVisible: true,
    hm: '10:08',
    hours: '10',
    minutes: '08',
    ss: '00',
    dateStr: '10月23日 周五',
    ampm: '24 小时制',
    secondsImage: LINE[0],
    syncLine: '同步 · 10:08'
  },
  clockSecondsVisible() { return this.clockVisible },
  onScrolled(y) { const row=this.rowBounds('clock'); const visible=row.bottom>y&&row.top<y+DEV.H; if(this.clockVisible!==visible){this.clockVisible=visible;this.stopClock();this.startClock()} },
  onTick(d) {
    let h=d.getHours()
    this.ampm=this.h24?'24 小时制':h<12?'上午':'下午'
    if(!this.h24)h=h%12||12
    this.hours=pad2(h);this.minutes=pad2(d.getMinutes())
    this.hm=this.hours+':'+this.minutes;this.ss=pad2(d.getSeconds())
    this.syncLine='同步 · '+this.hm
    this.dateStr=(d.getMonth()+1)+'月'+d.getDate()+'日 周'+WEEK[d.getDay()]
    this.secondsImage=progressImage(LINE,d.getSeconds()/59*100)
  },
  toggleH(){this.h24=!this.h24;this.tick();this.vib()}
}
</script>
