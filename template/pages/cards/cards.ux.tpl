<!-- #set siFrac = 5 -->
<template>
  <!-- 卡片: Card / 标题卡片 / AppCard / 描边卡片 (CardTokens: padding 12dp, corner 26dp, surfaceContainer) -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
      <list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
      <!-- #if pill -->
<list-item onswipe="onPageSwipe" type="hdr" class="li-page-title">
        <div class="lh"><text class="t-titleM c-on tc">卡片</text></div>
      </list-item>
<!-- #endif -->
      <list-item onswipe="onPageSwipe" type="c1" class="li-c1">

<!-- #component card {"variant": "card cs", "id": "c1", "content": "\n          <text class=\"t-titleS c-onS one\">日常</text>\n          <text class=\"t-bodyM c-onSV body\">点击查看内容\nCard</text>\n        "} -->

      </list-item>
      <list-item onswipe="onPageSwipe" type="c2" class="li-c2">

<!-- #component card {"variant": "card cs", "id": "c2", "content": "\n          <div class=\"row\">\n            <text class=\"t-titleS c-onS one grow\">会议</text>\n            <text class=\"t-bodyS c-onSV\">现在</text>\n          </div>\n          <text class=\"t-bodyM c-onSV body\">15:00\n三楼会议室</text>\n        "} -->

      </list-item>
      <list-item onswipe="onPageSwipe" type="c3" class="li-c3">

<!-- #component card {"variant": "card cs", "id": "c3", "content": "\n          <div class=\"row\">\n            <image class=\"appic\" src=\"/common/img/water_primary_18.png\"></image>\n            <text class=\"t-labelS c-onSV one grow ml\">喝水</text>\n            <text class=\"t-bodyS c-onSV\">刚刚</text>\n          </div>\n          <text class=\"t-titleS c-onS one mt\">已喝 1200 ml</text>\n          <text class=\"t-bodyM c-onSV body\">目标 2000 ml\n还差 800 ml</text>\n        "} -->

      </list-item>
      <list-item onswipe="onPageSwipe" type="c4" class="li-c1">

<!-- #component card {"variant": "card co", "id": "c4", "content": "\n          <text class=\"t-titleS c-onS one\">提醒</text>\n          <text class=\"t-bodyM c-onSV body\">清晰边界\nOutlinedCard</text>\n        "} -->

      </list-item>

      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
  </div>
</template>

<style>
/* #include @wear/m3.css */
/* #include @wear/cards.css */
</style>

<script>
// #include @wear/base_head.js
export default {
  private: {
// #include @wear/base_data.js
    pageTitle:"卡片",
    tlcBase: -1
  },
  onInit(){this.setLayout([])},
  pageShow() {
    this.exiting = false
  },
// #include @wear/base.js
}
</script>
