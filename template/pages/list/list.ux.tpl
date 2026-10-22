<!-- #set siFrac = 3 -->
<template>
  <!-- 列表: ListHeader + TransformingLazyColumn (edge scale/fade, toggleable) + ScrollIndicator -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">列表 · TLC</text></div>
      </list-item>
      <list-item type="tog" class="li-56">
        <div class="btn {{tlcOn ? 'bpc' : 'bt'}} {{pressId === 'tg' ? 'p-in' : relId === 'tg' ? 'p-out' : ''}}" ontouchstart="press('tg')" ontouchend="release('tg')" onclick="toggleTlc">
          <text class="t-labelM c-onS grow">边缘缩放/淡出</text>
          <div class="sw {{tlcOn ? 'sw-on' : 'sw-off'}}"><div class="sw-th {{tlcOn ? 'th-on' : 'th-off'}}"></div></div>
        </div>
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
      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include timetext.tpl -->
<!-- #include scrollind.tpl -->
  </div>
</template>

<style>
/* #include m3.css */
</style>

<script>
// #include base_head.js
const ROWS = [
  ['跑步', '5.2 公里 · 32 分钟', '/common/img/li_run.png', 'bg-td'],
  ['音乐', '正在播放 · 晴天', '/common/img/li_music.png', 'bg-pd'],
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
// #include base_data.js
    tlcOn: true,
    tlcBase: 3,
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  onInit() {
    const d = $[k]
    const h = [$[VP], 48 * d, 56 * d]
    for (let i = 0; i < ROWS.length; i++) h.push(56 * d)
    h.push(48 * d, $[VP])
    this.setLayout(h)
  },
  pageShow() {
    this.exiting = false
  },
  toggleTlc() {
    this.vib()
    this.tlcOn = !this.tlcOn
    this.applyScroll()
  },
// #include base.js
}
</script>
