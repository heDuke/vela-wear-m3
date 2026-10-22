<!-- #set siFrac = 3 -->
<template>
  <!-- 按钮: Button (Filled / FilledTonal / Outlined / Child), icon container + secondary label, IconButton, CompactButton -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">按钮</text></div>
      </list-item>
      <list-item type="b1" class="li-56">
        <div class="btn bf {{pressId === 'f' ? 'p-in' : relId === 'f' ? 'p-out' : ''}}" ontouchstart="press('f')" ontouchend="release('f')" onclick="tap('FilledButton')">
          <image class="ic24" src="/common/img/favorite_onPrimary_24.png"></image>
          <text class="t-labelM c-onPri lab2 ml">Filled 填充</text>
        </div>
      </list-item>
      <list-item type="b2" class="li-56">
        <div class="btn bt {{pressId === 't' ? 'p-in' : relId === 't' ? 'p-out' : ''}}" ontouchstart="press('t')" ontouchend="release('t')" onclick="tap('FilledTonalButton')">
          <image class="ic24" src="/common/img/star_primary_24.png"></image>
          <text class="t-labelM c-onS lab2 ml">Tonal 色调</text>
        </div>
      </list-item>
      <list-item type="b3" class="li-56">
        <div class="btn bo {{pressId === 'o' ? 'p-in' : relId === 'o' ? 'p-out' : ''}}" ontouchstart="press('o')" ontouchend="release('o')" onclick="tap('OutlinedButton')">
          <image class="ic24" src="/common/img/alarm_primary_24.png"></image>
          <text class="t-labelM c-onS lab2 ml">Outlined 描边</text>
        </div>
      </list-item>
      <list-item type="b4" class="li-56">
        <div class="btn bc ctr {{pressId === 'c' ? 'p-in' : relId === 'c' ? 'p-out' : ''}}" ontouchstart="press('c')" ontouchend="release('c')" onclick="tap('ChildButton')">
          <text class="t-labelM c-pri labc">Child 文本按钮</text>
        </div>
      </list-item>
      <list-item type="b5" class="li-56">
        <div class="btn btn-ic bpc {{pressId === 's' ? 'p-in' : relId === 's' ? 'p-out' : ''}}" ontouchstart="press('s')" ontouchend="release('s')" onclick="tap('Button + 次级标签')">
          <div class="icc bg-pd"><image class="ic-sec" src="/common/img/li_music.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onPC lab">图标容器 + 主标签</text>
            <text class="t-labelS c-onSV lab">secondaryLabel 次级标签</text>
          </div>
        </div>
      </list-item>
      <list-item type="lbl1" class="li-hdr2">
        <text class="t-titleS c-onSV tc">IconButton</text>
      </list-item>
      <list-item type="icons" class="li-ib">
        <div class="ib bf {{pressId === 'i1' ? 'p-in' : relId === 'i1' ? 'p-out' : ''}}" ontouchstart="press('i1')" ontouchend="release('i1')" onclick="tap('FilledIconButton')">
          <image class="ic26" src="/common/img/play_onPrimary_26.png"></image>
        </div>
        <div class="ib bt {{pressId === 'i2' ? 'p-in' : relId === 'i2' ? 'p-out' : ''}}" ontouchstart="press('i2')" ontouchend="release('i2')" onclick="tap('FilledTonalIconButton')">
          <image class="ic26" src="/common/img/play_primary_26.png"></image>
        </div>
        <div class="ib bo {{pressId === 'i3' ? 'p-in' : relId === 'i3' ? 'p-out' : ''}}" ontouchstart="press('i3')" ontouchend="release('i3')" onclick="tap('OutlinedIconButton')">
          <image class="ic26" src="/common/img/play_primary_26.png"></image>
        </div>
      </list-item>
      <list-item type="lbl2" class="li-hdr2">
        <text class="t-titleS c-onSV tc">CompactButton</text>
      </list-item>
      <list-item type="compact" class="li-48">
        <div class="cbtn bf {{pressId === 'k1' ? 'p-in' : relId === 'k1' ? 'p-out' : ''}}" ontouchstart="press('k1')" ontouchend="release('k1')" onclick="tap('CompactButton')">
<!-- #if !pill -->
          <image class="cbtn-ic" src="/common/img/add_onPrimary_20.png"></image>
<!-- #endif -->
          <text class="t-labelM c-onPri">添加</text>
        </div>
        <div class="cbtn bt gap {{pressId === 'k2' ? 'p-in' : relId === 'k2' ? 'p-out' : ''}}" ontouchstart="press('k2')" ontouchend="release('k2')" onclick="tap('CompactButton Tonal')">
          <text class="t-labelM c-onS">更多</text>
        </div>
      </list-item>
      <list-item type="dis" class="li-56">
        <div class="btn bd">
          <image class="ic24 dim" src="/common/img/info_primary_24.png"></image>
          <text class="t-labelM c-dis lab2 ml">Disabled 禁用</text>
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
.ml { margin-left: $(6); }
.ctr { justify-content: center; }
.dim { opacity: 0.38; }
.gap { margin-left: $(8); }
.li-hdr2 { width: $[W]px; height: $(32); justify-content: center; align-items: flex-end; }
.li-ib { width: $[W]px; height: $(64); flex-direction: row; justify-content: center; align-items: center; }
.ib { width: $(52); height: $(52); margin-left: $(4); margin-right: $(4); border-width: 1px; border-radius: $(26); justify-content: center; align-items: center; transform-origin: $(26) $(26); }
.ic26 { width: $[png('play_primary_26')[0]]px; height: $[png('play_primary_26')[0]]px; }
</style>

<script>
// #include base_head.js
import prompt from '@system.prompt'
export default {
  private: {
// #include base_data.js
    tlcBase: -1
  },
  onInit() {
    const d = $[k]
    this.setLayout([$[VP], 48 * d, 56 * d, 56 * d, 56 * d, 56 * d, 56 * d, 32 * d, 64 * d, 32 * d, 48 * d, 56 * d, 48 * d, $[VP]])
  },
  pageShow() {
    this.exiting = false
  },
  tap(name) {
    this.vib()
    prompt.showToast({ message: name, duration: 1500 })
  },
// #include base.js
}
</script>
