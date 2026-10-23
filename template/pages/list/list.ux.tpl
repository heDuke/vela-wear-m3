<!-- #set siFrac = 3 -->
<template>
  <!-- 列表: ListHeader + TransformingLazyColumn (edge scale/fade, toggleable) + ScrollIndicator -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
      <list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
      <!-- #if pill -->
<list-item onswipe="onPageSwipe" type="hdr" class="li-page-title">
        <div class="lh"><text class="t-titleM c-on tc">列表</text></div>
      </list-item>
<!-- #endif -->
      <list-item onswipe="onPageSwipe" type="tog" class="li-56">
        <div class="btn {{tlcOn ? 'bpc' : 'bt'}} {{pressId === 'tg' ? 'p-in' : relId === 'tg' ? 'p-out' : ''}}" style="{{feedback['tg'] || {opacity:1}}}" ontouchstart="press('tg')" ontouchend="release('tg')" onclick="toggleTlc">
          <text class="t-labelM c-onS grow">边缘缩放</text>
          <div class="sw {{tlcOn ? 'sw-on' : 'sw-off'}}"><div class="sw-th {{tlcOn ? 'th-on' : 'th-off'}}"></div></div>
        </div>
      </list-item>
      <list-item type="level-entry" class="li-56" onswipe="onPageSwipe"><div class="btn bt" onclick="openLevel"><text class="t-labelM c-onS">数值位置</text></div></list-item>
<list-item type="hpager-entry" class="li-56" onswipe="onPageSwipe"><div class="btn bt" onclick="openHorizontalPager"><text class="t-labelM c-onS">横向分页</text></div></list-item>
<list-item type="vpager-entry" class="li-56" onswipe="onPageSwipe"><div class="btn bt" onclick="openVerticalPager"><text class="t-labelM c-onS">纵向分页</text></div></list-item>
<list-item onswipe="onPageSwipe" type="row" class="li-56" for="{{items}}" tid="id">

<!-- #component transforming-list-item {"style": "$item.st", "content": "\n          <div class=\"btn btn-ic bt {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}\" style=\"{{feedback[$item.id] || {opacity:1}}}\" ontouchstart=\"press($item.id)\" ontouchend=\"release($item.id)\" onclick=\"vib\">\n            <div class=\"icc {{$item.bg}}\"><image class=\"ic-sec\" src=\"{{$item.icon}}\"></image></div>\n            <div class=\"bcol\">\n              <text class=\"t-labelM c-onS lab\">{{$item.label}}</text>\n              <text class=\"t-labelS c-onSV lab\">{{$item.sub}}</text>\n            </div>\n          </div>\n        "} -->

      </list-item>

      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
<!-- #include @wear/range.tpl -->
<!-- #include @wear/pager.tpl -->
  </div>
</template>

<style>
/* #include @wear/m3.css */
/* #include @wear/range.css */
/* #include @wear/pager.css */
</style>

<script>
// #include @wear/base_head.js
import { pageDots, pagerState } from '../../common/m3.js'
// #include @wear/pager.head.js
// #include @wear/range.head.js
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
// #include @wear/base_data.js
    pageTitle:"列表与指示器",
    tlcOn: true,
    tlcBase: 7,

// #include @wear/range.data.js

// #include @wear/pager.data.js
    items: ROWS.map((r, i) => ({ id: 'r' + i, label: r[0], sub: r[1], icon: r[2], bg: r[3], st: IDENT }))
  },
  onInit(){this.setLayout([])},
  pageShow() {
    this.exiting = false
  },
  toggleTlc() {
    this.vib()
    this.tlcOn = !this.tlcOn
    this.applyScroll()
  },
// #include @wear/pager.methods.js
// #include @wear/range.js
// #include @wear/base.js
}
</script>
