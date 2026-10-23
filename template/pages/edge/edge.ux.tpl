<!-- #set siFrac = 3 -->
<template>
  <!-- 边缘按钮: ScreenScaffold + EdgeButton (Small 56dp, 3dp from the bottom) revealed as the list reaches its end, over a scrim -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
      <list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
      <!-- #if pill -->
<list-item onswipe="onPageSwipe" type="hdr" class="li-page-title">
        <div class="lh"><text class="t-titleM c-on tc">边缘操作</text></div>
      </list-item>
<!-- #endif -->
      <list-item onswipe="onPageSwipe" type="row" class="li-56" for="{{items}}" tid="id">

<!-- #component transforming-list-item {"style": "$item.st", "content": "\n          <div class=\"btn btn-ic bt {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}\" style=\"{{feedback[$item.id] || {opacity:1}}}\" ontouchstart=\"press($item.id)\" ontouchend=\"release($item.id)\" onclick=\"vib\">\n            <div class=\"icc {{$item.bg}}\"><image class=\"ic-sec\" src=\"{{$item.icon}}\"></image></div>\n            <div class=\"bcol\">\n              <text class=\"t-labelM c-onS lab\">{{$item.label}}</text>\n              <text class=\"t-labelS c-onSV lab\">{{$item.sub}}</text>\n            </div>\n          </div>\n        "} -->

      </list-item>

      <list-item type="padb" class="li-ebpad"></list-item>
    </list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
    <image class="scrim" src="/common/img/scrim.png" style="{{ebSt}}"></image>
    <div class="scrim2" style="{{ebSt}}"></div>

<!-- #component edge-button {} -->

<!-- #include @wear/confirm.tpl -->
  </div>
</template>

<style>
/* #include @wear/m3.css */
/* #include @wear/overlay.css */
/* #include @wear/confirm.css */
/* #include @wear/edge.css */
</style>

<script>
// #include @wear/base_head.js
let cfTimer = null
let confirmEpoch=0
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
  // reveal while scrolling through the last 2*EBH px (fully shown one EBH before the end, tolerant of list rounding): slide up from below the edge + fade in
  let f = maxY <= 0 ? 1 : (sy - (maxY - 2 * EBH)) / EBH
  f = f < 0 ? 0 : f > 1 ? 1 : f
  return { transform: JSON.stringify({ translateY: Math.round((1 - f) * EBH) + 'px' }), opacity: Math.round(f * 100) / 100 }
}
export default {
  private: {
// #include @wear/base_data.js
    pageTitle:"边缘按钮",
    tlcOn: true,
    tlcBase: 3,
    cfOn: false,
    cfOut: false,
// #if enhanced
    checkFrames: $[frames('check')],
// #endif
    ebSt: ebStyle(0, 1000),
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  onInit(){this.setLayout([])},
  pageShow() { this.exiting = false },
  pageHide() { this.clearConfirm(); },
  onScrolled(y, m) {
    const st = ebStyle(y, m)
    if (st.transform !== this.ebSt.transform) this.ebSt = st
  },
  overlayBack() {
    if (this.cfOn) {
      this.hideConfirm()
      return true
    }
    return false
  },
// #include @wear/confirm.js
// #include @wear/base.js
}
</script>
