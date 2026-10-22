<!-- #set siFrac = 3 -->
<template>
  <!-- Launcher: TimeText + ListHeader + TransformingLazyColumn of M3 FilledTonal buttons + ScrollIndicator -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">$[pill ? 'M3 组件' : 'M3 组件演示']</text></div>
      </list-item>
      <list-item type="sec" class="li-56" for="{{items}}" tid="id">
        <div class="tlc" style="{{$item.st}}">
          <div class="btn btn-ic bt {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}" ontouchstart="press($item.id)" ontouchend="release($item.id)" onclick="openSec($item.id)">
            <div class="icc {{$item.bg}}"><image class="ic-sec" src="{{$item.icon}}"></image></div>
            <div class="bcol">
              <text class="t-labelM c-onS lab">{{$item.label}}</text>
              <text class="t-labelS c-onSV lab">{{$item.sub}}</text>
            </div>
          </div>
        </div>
      </list-item>
      <list-item type="padb" class="li-padb"></list-item>
    </list>
    <!-- #include timetext.tpl -->
    <!-- #include scrollind.tpl -->
    <text class="dbg" if="{{dbg}}">{{dbg}}</text>
  </div>
</template>

<style>
/* #include m3.css */
.dbg { position: absolute; left: $(40); top: $[H / 2]px; width: $[W - dp(80)]px; color: #FF8080; font-size: $(12); background-color: #000000; }
</style>

<script>
// #include base_head.js
const SECS = [
  ['buttons', '按钮', 'Filled · Tonal · Outlined', '/common/img/sec_buttons.png', 'bg-pd'],
  ['cards', '卡片', 'Card · TitleCard · AppCard', '/common/img/sec_cards.png', 'bg-sd'],
  ['list', '列表', 'TLC 边缘缩放 · 滚动条', '/common/img/sec_list.png', 'bg-td'],
  ['edge', '边缘按钮', 'EdgeButton · 滑到底部展开', '/common/img/sec_edge.png', 'bg-pd'],
  ['time', '时间', 'TimeText · 实时时钟', '/common/img/sec_time.png', 'bg-sd'],
  ['toggles', '开关与选择', 'Switch · Checkbox · Radio · Slider', '/common/img/sec_toggles.png', 'bg-td'],
  ['dialogs', '对话框', 'AlertDialog · Confirmation', '/common/img/sec_dialogs.png', 'bg-pd'],
  ['motion', '动画', '进度 · 关键帧 · 过渡', '/common/img/sec_motion.png', 'bg-sd']
]
export default {
  private: {
// #include base_data.js
    isHome: true,
    tlcOn: true,
    tlcBase: 2,
    items: SECS.map(s => ({ id: s[0], label: s[1], sub: s[2], icon: s[3], bg: s[4], st: IDENT }))
  },
  onInit() {
    const h = [$[VP], $[dp(48)]]
    for (let i = 0; i < SECS.length; i++) h.push($[dp(56)])
    h.push($[VP])
    this.setLayout(h)
  },
  pageShow() {
    this.exiting = false
  },
  openSec(id) {
    this.vib()
    router.push({ uri: '/pages/' + id })
  },
// #include base.js
}
</script>
