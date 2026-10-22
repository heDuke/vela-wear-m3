<!-- #set siFrac = 5 -->
<template>
  <!-- 卡片: Card / TitleCard / AppCard / OutlinedCard (CardTokens: padding 12dp, corner 26dp, surfaceContainer) -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">卡片</text></div>
      </list-item>
      <list-item type="c1" class="li-c1">
        <div class="card cs {{pressId === 'c1' ? 'p-in' : relId === 'c1' ? 'p-out' : ''}}" ontouchstart="press('c1')" ontouchend="release('c1')" onclick="vib">
          <text class="t-titleS c-onS one">Card</text>
          <text class="t-bodyM c-onSV body">基础卡片，可放任意内容，点击有按压反馈。</text>
        </div>
      </list-item>
      <list-item type="c2" class="li-c2">
        <div class="card cs {{pressId === 'c2' ? 'p-in' : relId === 'c2' ? 'p-out' : ''}}" ontouchstart="press('c2')" ontouchend="release('c2')" onclick="vib">
          <div class="row">
            <text class="t-titleS c-onS one grow">TitleCard</text>
            <text class="t-bodyS c-onSV">现在</text>
          </div>
          <text class="t-bodyM c-onSV body">标题 + 时间 + 正文：会议 15:00 在 3 楼。</text>
        </div>
      </list-item>
      <list-item type="c3" class="li-c3">
        <div class="card cs {{pressId === 'c3' ? 'p-in' : relId === 'c3' ? 'p-out' : ''}}" ontouchstart="press('c3')" ontouchend="release('c3')" onclick="vib">
          <div class="row">
            <image class="appic" src="/common/img/water_primary_18.png"></image>
            <text class="t-labelS c-onSV one grow ml">喝水提醒</text>
            <text class="t-bodyS c-onSV">5 分钟前</text>
          </div>
          <text class="t-titleS c-onS one mt">已喝 1200 ml</text>
          <text class="t-bodyM c-onSV body">今日目标 2000 ml，还差 800 ml。</text>
        </div>
      </list-item>
      <list-item type="c4" class="li-c1">
        <div class="card co {{pressId === 'c4' ? 'p-in' : relId === 'c4' ? 'p-out' : ''}}" ontouchstart="press('c4')" ontouchend="release('c4')" onclick="vib">
          <text class="t-titleS c-onS one">OutlinedCard</text>
          <text class="t-bodyM c-onSV body">描边卡片：透明背景 + outline 边框。</text>
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
.li-c1 { width: $[W]px; height: $(84); flex-direction: column; align-items: center; justify-content: center; }
.li-c2 { width: $[W]px; height: $(84); flex-direction: column; align-items: center; justify-content: center; }
.li-c3 { width: $[W]px; height: $(104); flex-direction: column; align-items: center; justify-content: center; }
.card { width: $[CW]px; flex-direction: column; padding: $(12); border-width: 1px; border-radius: $(26); transform-origin: $[CW / 2]px $(40); }
.cs { background-color: #332E3C; border-color: #332E3C; }
.co { background-color: #000000; border-color: #948F9A; }
.row { width: $[CW - dp(24)]px; flex-direction: row; align-items: center; }
.grow { flex: 1; }
.ml { margin-left: $(4); }
.mt { margin-top: $(4); }
.body { width: $[CW - dp(24)]px; margin-top: $(4); lines: 2; text-overflow: ellipsis; }
.appic { width: $[png('water_primary_18')[0]]px; height: $[png('water_primary_18')[0]]px; }
</style>

<script>
// #include base_head.js
export default {
  private: {
// #include base_data.js
    tlcBase: -1
  },
  onInit() {
    const d = $[k]
    this.setLayout([$[VP], 48 * d, 84 * d, 84 * d, 104 * d, 84 * d, 48 * d, $[VP]])
  },
  pageShow() {
    this.exiting = false
  },
// #include base.js
}
</script>
