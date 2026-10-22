<!-- #set siFrac = 3 -->
<template>
  <!-- 开关与选择: SwitchButton, CheckboxButton, RadioButton, InlineSlider (+ native <switch>/<slider> for comparison) -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">开关与选择</text></div>
      </list-item>
      <list-item type="sw1" class="li-56">
        <div class="btn {{wifi ? 'bpc' : 'bt'}} {{pressId === 'w' ? 'p-in' : relId === 'w' ? 'p-out' : ''}}" ontouchstart="press('w')" ontouchend="release('w')" onclick="tWifi">
<!-- #if !pill -->
          <image class="ic24" src="{{wifi ? '/common/img/wifi_onPrimaryC_24.png' : '/common/img/wifi_onSurface_24.png'}}"></image>
<!-- #endif -->
          <div class="bcol grow">
            <text class="t-labelM c-onS lab3">Wi-Fi</text>
            <text class="t-labelS c-onSV lab3">{{wifi ? '已连接' : '已关闭'}}</text>
          </div>
          <div class="sw {{wifi ? 'sw-on' : 'sw-off'}}"><div class="sw-th {{wifi ? 'th-on' : 'th-off'}}"></div></div>
        </div>
      </list-item>
      <list-item type="sw2" class="li-56">
        <div class="btn {{bell ? 'bpc' : 'bt'}} {{pressId === 'n' ? 'p-in' : relId === 'n' ? 'p-out' : ''}}" ontouchstart="press('n')" ontouchend="release('n')" onclick="tBell">
<!-- #if !pill -->
          <image class="ic24" src="{{bell ? '/common/img/bell_onPrimaryC_24.png' : '/common/img/bell_onSurface_24.png'}}"></image>
<!-- #endif -->
          <div class="bcol grow">
            <text class="t-labelM c-onS lab3">通知</text>
            <text class="t-labelS c-onSV lab3">{{bell ? '开' : '关'}}</text>
          </div>
          <div class="sw {{bell ? 'sw-on' : 'sw-off'}}"><div class="sw-th {{bell ? 'th-on' : 'th-off'}}"></div></div>
        </div>
      </list-item>
      <list-item type="chk" class="li-56">
        <div class="btn {{bt ? 'bpc' : 'bt'}} {{pressId === 'b' ? 'p-in' : relId === 'b' ? 'p-out' : ''}}" ontouchstart="press('b')" ontouchend="release('b')" onclick="tBt">
<!-- #if !pill -->
          <image class="ic24" src="{{bt ? '/common/img/bt_onPrimaryC_24.png' : '/common/img/bt_onSurface_24.png'}}"></image>
<!-- #endif -->
          <div class="bcol grow">
            <text class="t-labelM c-onS lab3">蓝牙</text>
            <text class="t-labelS c-onSV lab3">CheckboxButton</text>
          </div>
          <div class="cb {{bt ? 'cb-on' : 'cb-off'}}"><image class="cb-ic" if="{{bt}}" src="/common/img/check_onPrimary_16.png"></image></div>
        </div>
      </list-item>
      <list-item type="lbl" class="li-sub">
        <text class="t-titleS c-onSV">单选按钮 · 字号</text>
      </list-item>
      <list-item type="radio" class="li-56" for="{{radios}}" tid="id">
        <div class="btn {{sel === $idx ? 'bpc' : 'bt'}} {{pressId === $item.id ? 'p-in' : relId === $item.id ? 'p-out' : ''}}" ontouchstart="press($item.id)" ontouchend="release($item.id)" onclick="pick($idx)">
          <text class="t-labelM c-onS grow">{{$item.label}}</text>
          <div class="rb {{sel === $idx ? 'rb-on' : 'rb-off'}}"><div class="rb-dot" if="{{sel === $idx}}"></div></div>
        </div>
      </list-item>
      <list-item type="lbl2" class="li-sub">
        <text class="t-titleS c-onSV">滑块 · 亮度 {{lvl}}</text>
      </list-item>
      <list-item type="slider" class="li-56">
        <div class="btn bt sl">
          <div class="sl-b" onclick="dec"><image class="ic24" src="/common/img/remove_primary_24.png"></image></div>
          <div class="segs">
            <div class="seg {{lvl > 0 ? 'seg-on' : 'seg-off'}}"></div>
            <div class="seg {{lvl > 1 ? 'seg-on' : 'seg-off'}}"></div>
            <div class="seg {{lvl > 2 ? 'seg-on' : 'seg-off'}}"></div>
            <div class="seg {{lvl > 3 ? 'seg-on' : 'seg-off'}}"></div>
            <div class="seg {{lvl > 4 ? 'seg-on' : 'seg-off'}}"></div>
          </div>
          <div class="sl-b" onclick="inc"><image class="ic24" src="/common/img/add_primary_24.png"></image></div>
        </div>
      </list-item>
      <list-item type="lbl3" class="li-sub">
        <text class="t-titleS c-onSV">原生组件对比</text>
      </list-item>
      <list-item type="nsw" class="li-48">
        <text class="t-bodyM c-onS">switch</text>
        <switch class="nsw" checked="{{wifi}}" onchange="nWifi"></switch>
      </list-item>
      <list-item type="nsl" class="li-48">
        <slider class="nsl" min="0" max="5" step="1" value="{{lvl}}" onchange="nLvl"></slider>
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
.li-sub { width: $[W]px; height: $(32); justify-content: center; align-items: flex-end; }
.lab3 { width: $[CW - 2 * dp(pill ? 10 : 14) - (pill ? 0 : dp(24) + dp(6)) - dp(32) - dp(6) - 2]px; lines: 1; text-overflow: ellipsis; }
/* checkbox 18dp (CheckboxButtonTokens): checked = primary fill + check, unchecked = 2dp outline */
.cb { width: $(20); height: $(20); border-width: $(2); border-radius: $(4); justify-content: center; align-items: center; margin-right: $(6); transition-property: background-color; transition-duration: 200ms; }
.cb-on { background-color: #E9DDFF; border-color: #E9DDFF; }
.cb-off { background-color: #332E3C; border-color: #948F9A; }
.cb-ic { width: $[png('check_onPrimary_16')[0]]px; height: $[png('check_onPrimary_16')[0]]px; }
/* radio 20dp: ring + 10dp dot */
.rb { width: $(20); height: $(20); border-width: $(2); border-radius: $(10); justify-content: center; align-items: center; margin-right: $(6); }
.rb-on { border-color: #E9DDFF; }
.rb-off { border-color: #948F9A; }
.rb-dot { width: $(10); height: $(10); background-color: #E9DDFF; border-width: 1px; border-color: #E9DDFF; border-radius: $(5); }
/* InlineSlider: decrease / 5 segments / increase */
.sl { padding-left: $(4); padding-right: $(4); justify-content: space-between; }
.sl-b { width: $[pill ? dp(30) : dp(44)]px; height: $(44); justify-content: center; align-items: center; }
.segs { flex: 1; height: $(8); flex-direction: row; }
.seg { flex: 1; height: $(8); margin-left: $(1); margin-right: $(1); border-width: 1px; border-radius: $(4); transition-property: background-color; transition-duration: 250ms; }
.seg-on { background-color: #E9DDFF; border-color: #E9DDFF; }
.seg-off { background-color: #4A4458; border-color: #4A4458; }
.nsw { margin-left: $(12); thumb-color: #210F48; track-color: #E9DDFF; }
.nsl { width: $[CW - dp(20)]px; color: #4A4458; selected-color: #E9DDFF; block-color: #E9DDFF; }
</style>

<script>
// #include base_head.js
export default {
  private: {
// #include base_data.js
    tlcBase: -1,
    wifi: true,
    bell: false,
    bt: true,
    sel: 1,
    lvl: 3,
    radios: [{ id: 'r0', label: '小' }, { id: 'r1', label: '中' }, { id: 'r2', label: '大' }]
  },
  onInit() {
    const d = $[k]
    this.setLayout([$[VP], 48 * d, 56 * d, 56 * d, 56 * d, 32 * d, 56 * d, 56 * d, 56 * d, 32 * d, 56 * d, 32 * d, 48 * d, 48 * d, 48 * d, $[VP]])
  },
  pageShow() {
    this.exiting = false
  },
  tWifi() {
    this.vib()
    this.wifi = !this.wifi
  },
  tBell() {
    this.vib()
    this.bell = !this.bell
  },
  tBt() {
    this.vib()
    this.bt = !this.bt
  },
  pick(i) {
    this.vib()
    this.sel = i
  },
  dec() {
    if (this.lvl > 0) this.lvl--
  },
  inc() {
    if (this.lvl < 5) this.lvl++
  },
  nWifi(e) {
    this.wifi = e.checked
  },
  nLvl(e) {
    this.lvl = e.progress
  },
// #include base.js
}
</script>
