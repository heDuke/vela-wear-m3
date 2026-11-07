<template>
fun IndexScreen() {
  ScreenScaffold(showBack = false, siFrac = 3) {
    TransformingLazyColumn {
      item {
        ListHeader { Text("M3 组件演示") }
      }
      items(items) { item ->
        FilledTonalButton(
          onClick = { openSec(item.id) },
          icon = { Icon(item.icon) },
          label = { Text(item.label) },
          secondaryLabel = { Text(item.sub) }
        )
      }
    }
  }
}
</template>
<style>
.dbg { position: absolute; left: $(40); top: $[H / 2]px; width: $[W - dp(80)]px; color: #FF8080; font-size: $(12); background-color: #000000; }
</style>
<script>
const SECS = [
  ['buttons', '按钮', '样式与按压', '/common/img/sec_buttons.png', 'bg-pd'],
  ['cards', '卡片', '标题与内容', '/common/img/sec_cards.png', 'bg-sd'],
  ['list', '列表', '缩放与位置', '/common/img/sec_list.png', 'bg-td'],
  ['edge', '边缘', '底部操作', '/common/img/sec_edge.png', 'bg-pd'],
  ['time', '时间', '时钟与弧形文字', '/common/img/sec_time.png', 'bg-sd'],
  ['toggles', '开关', '选择与数值', '/common/img/sec_toggles.png', 'bg-td'],
  ['dialogs', '确认', '对话与反馈', '/common/img/sec_dialogs.png', 'bg-pd'],
  ['motion', '动画', '进度与动效', '/common/img/sec_motion.png', 'bg-sd']
]
export default {
  private: {
    isHome: true,
    tlcOn: true,
    items: SECS.map(s => ({ id: s[0], label: s[1], sub: s[2], icon: s[3], bg: s[4], st: IDENT }))
  },
  pageShow() { this.exiting = false },
  openSec(id) {
    this.vib()
    router.push({ uri: '/pages/' + id })
  }
}
</script>
