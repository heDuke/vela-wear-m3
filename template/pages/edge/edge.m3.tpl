<template>
fun EdgeScreen() {
  ScreenScaffold(title = "边缘操作", siFrac = 3) {
    TransformingLazyColumn {
      items(items) { item ->
        FilledTonalButton(
          onClick = { vib() },
          icon = { Icon(item.icon) },
          label = { Text(item.label) },
          secondaryLabel = { Text(item.sub) }
        )
      }
    }
    EdgeButton(onClick = { showConfirm() })
    SuccessConfirmationDialog(visible = cfOn, onDismissRequest = { hideConfirm() })
  }
}
</template>
<script>
const EBH = $[EBH]
const ROWS = [
  ['同步数据', '上次 10 分钟前', '/common/img/li_star.png', 'bg-pd'],
  ['晨跑', '07:00 · 5 公里', '/common/img/li_run.png', 'bg-td'],
  ['喝水', '还差 800 ml', '/common/img/li_water.png', 'bg-sd'],
  ['闹钟', '07:30 工作日', '/common/img/li_alarm.png', 'bg-sd'],
  ['音乐', '下载 12 首', '/common/img/li_music.png', 'bg-pd'],
  ['收藏', '已同步', '/common/img/li_star.png', 'bg-pd']
]
function ebStyle(sy, maxY) {
  let f = maxY <= 0 ? 1 : (sy - (maxY - 2 * EBH)) / EBH
  f = f < 0 ? 0 : f > 1 ? 1 : f
  return { transform: JSON.stringify({ translateY: Math.round((1 - f) * EBH) + 'px' }), opacity: Math.round(f * 100) / 100 }
}
export default {
  private: {
    tlcOn: true,
    cfOn: false,
    cfOut: false,
    ebSt: ebStyle(0, 1000),
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  pageShow() { this.exiting = false },
  pageHide() { this.clearConfirm() },
  onScrolled(y, m) {
    const st = ebStyle(y, m)
    if (st.transform !== this.ebSt.transform) this.ebSt = st
  },
  overlayBack() {
    if (this.cfOn) { this.hideConfirm(); return true }
    return false
  }
}
</script>
