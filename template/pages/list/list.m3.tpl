<template>
fun ListScreen() {
  ScreenScaffold(title = "列表", siFrac = 3) {
    TransformingLazyColumn {
      item {
        FilledTonalButton(onClick = { toggleTlc() }, label = { Text("边缘缩放") })
      }
      item {
        FilledTonalButton(onClick = { openLevel() }, label = { Text("数值位置") })
      }
      item {
        FilledTonalButton(onClick = { openHorizontalPager() }, label = { Text("横向分页") })
      }
      item {
        FilledTonalButton(onClick = { openVerticalPager() }, label = { Text("纵向分页") })
      }
      items(items) { item ->
        FilledTonalButton(
          onClick = { vib() },
          icon = { Icon(item.icon) },
          label = { Text(item.label) },
          secondaryLabel = { Text(item.sub) }
        )
      }
    }
    Stepper()
    HorizontalPager()
    VerticalPager()
  }
}
</template>
<script>
import { pageDots, pagerState } from '../../common/m3.js'
const ROWS = [
  ['跑步', '5.2 公里\n32 分钟', '/common/img/li_run.png', 'bg-td'],
  ['音乐', '正在播放\n晴天', '/common/img/li_music.png', 'bg-pd'],
  ['闹钟', '明天 07:30', '/common/img/li_alarm.png', 'bg-sd'],
  ['喝水', '1200 / 2000 ml', '/common/img/li_water.png', 'bg-sd'],
  ['收藏', '12 项', '/common/img/li_star.png', 'bg-pd'],
  ['骑行', '18.4 公里', '/common/img/li_run.png', 'bg-td'],
  ['播客', '第 42 期', '/common/img/li_music.png', 'bg-pd'],
  ['计时器', '05:00', '/common/img/li_alarm.png', 'bg-sd'],
  ['游泳', '1500 米', '/common/img/li_water.png', 'bg-sd'],
  ['精选', '3 条新内容', '/common/img/li_star.png', 'bg-pd']
]
export default {
  private: {
    tlcOn: true,
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  pageShow() { this.exiting = false },
  toggleTlc() { this.vib(); this.tlcOn = !this.tlcOn; this.applyScroll() }
}
</script>
