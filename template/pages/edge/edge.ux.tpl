<!-- #set siFrac = 3 -->
<template>
  <!-- 边缘按钮: ScreenScaffold + EdgeButton (Small 56dp, 3dp from the bottom) revealed as the list reaches its end, over a scrim -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">EdgeButton</text></div>
      </list-item>
      <list-item type="row" class="li-56" for="{{items}}" tid="id">
        <div class="tlc" style="{{$item.st}}">
          <div class="btn btn-ic bt {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}" ontouchstart="press($item.id)" ontouchend="release($item.id)" onclick="vib">
            <div class="icc {{$item.bg}}"><image class="ic-sec" src="{{$item.icon}}"></image></div>
            <div class="bcol">
              <text class="t-labelM c-onS lab">{{$item.label}}</text>
              <text class="t-labelS c-onSV lab">{{$item.sub}}</text>
            </div>
          </div>
        </div>
      </list-item>
<!-- #include backbtn.tpl -->
      <list-item type="padb" class="li-ebpad"></list-item>
    </list>
<!-- #include timetext.tpl -->
<!-- #include scrollind.tpl -->
    <image class="scrim" src="/common/img/scrim.png" style="{{ebSt}}"></image>
    <div class="scrim2" style="{{ebSt}}"></div>
    <div class="eb" style="{{ebSt}}" ontouchstart="press('eb')" ontouchend="release('eb')" onclick="showConfirm">
      <image class="eb-img" src="/common/img/edge_button.png"></image>
      <image class="eb-ic" src="/common/img/check_onPrimary_32.png"></image>
    </div>
<!-- #include confirm.tpl -->
  </div>
</template>

<style>
/* #include m3.css */
/* #include overlay.css */
/* #include confirm.css */
$[ebCss()]
.li-ebpad { width: $[W]px; height: $[EBPAD]px; }
</style>

<script>
// #include base_head.js
let cfTimer = null
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
// #include base_data.js
    tlcOn: true,
    tlcBase: 2,
    cfOn: false,
    cfOut: false,
    ebSt: ebStyle(0, 1000),
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  onInit() {
    const d = $[k]
    const h = [$[VP], 48 * d]
    for (let i = 0; i < ROWS.length; i++) h.push(56 * d)
    h.push(48 * d, $[EBPAD])
    this.setLayout(h)
  },
  pageShow() {
    this.exiting = false
  },
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
// #include confirm.js
// #include base.js
}
</script>
