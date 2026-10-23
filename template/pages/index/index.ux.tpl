<!-- #set siFrac = 3 -->
<template>
  <!-- Launcher: TimeText + ListHeader + TransformingLazyColumn of M3 FilledTonal buttons + ScrollIndicator -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">$[pill ? 'M3 组件' : 'M3 组件演示']</text></div>
      </list-item>
      <list-item type="sec" class="li-56" for="{{items}}" tid="id">

<!-- #component transforming-list-item {"style": "$item.st", "content": "\n          <div class=\"btn btn-ic bt {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}\" style=\"{{feedback[$item.id] || {opacity:1}}}\" ontouchstart=\"press($item.id)\" ontouchend=\"release($item.id)\" onclick=\"openSec($item.id)\">\n            <div class=\"icc {{$item.bg}}\"><image class=\"ic-sec\" src=\"{{$item.icon}}\"></image></div>\n            <div class=\"bcol\">\n              <text class=\"t-labelM c-onS lab\">{{$item.label}}</text>\n              <text class=\"t-labelS c-onSV lab\">{{$item.sub}}</text>\n            </div>\n          </div>\n        "} -->

      </list-item>
      <list-item type="padb" class="li-padb"></list-item>
    </list>
    <!-- #include @wear/timetext.tpl -->
    <!-- #include @wear/scrollind.tpl -->
    <text class="dbg" if="{{dbg}}">{{dbg}}</text>
  </div>
</template>

<style>
/* #include @wear/m3.css */
.dbg { position: absolute; left: $(40); top: $[H / 2]px; width: $[W - dp(80)]px; color: #FF8080; font-size: $(12); background-color: #000000; }
</style>

<script>
// #include @wear/base_head.js
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
// #include @wear/base_data.js
    isHome: true,
    tlcOn: true,
    tlcBase: 2,
    items: SECS.map(s => ({ id: s[0], label: s[1], sub: s[2], icon: s[3], bg: s[4], st: IDENT }))
  },
  onInit(){this.setLayout([])},
  pageShow() {
    this.exiting = false
  },
  openSec(id) {
    this.vib()
    router.push({ uri: '/pages/' + id })
  },
// #include @wear/base.js
}
</script>
