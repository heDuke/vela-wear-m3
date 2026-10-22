<!-- #set siFrac = 5 -->
<template>
  <!-- 动画: CircularProgressIndicator (rotating PNG) + determinate <progress type="arc"> + @keyframes + transition -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">动画</text></div>
      </list-item>
      <list-item type="prog" class="li-row">
        <div class="cell">
          <stack class="spin">
            <image class="spin-img" src="/common/img/spin_track.png"></image>
            <image class="spin-img spin-rot" src="/common/img/spin_arc.png"></image>
          </stack>
          <text class="t-bodyS c-onSV cap">加载中</text>
        </div>
        <div class="cell">
          <stack class="spin">
            <progress class="parc" type="arc" percent="{{pct}}"></progress>
            <div class="spin-lbl"><text class="t-labelS c-onS">{{pct}}%</text></div>
          </stack>
          <text class="t-bodyS c-onSV cap">进度</text>
        </div>
      </list-item>
      <list-item type="kf" class="li-row">
        <div class="cell">
          <div class="dot bg-pd {{kfOn ? 'kf-pulse' : ''}}"></div>
          <text class="t-bodyS c-onSV cap">缩放</text>
        </div>
        <div class="cell">
          <div class="dot bg-sd {{kfOn ? 'kf-fade' : ''}}"></div>
          <text class="t-bodyS c-onSV cap">淡出</text>
        </div>
        <div class="cell">
          <div class="dot bg-td {{kfOn ? 'kf-bounce' : ''}}"></div>
          <text class="t-bodyS c-onSV cap">弹跳</text>
        </div>
      </list-item>
      <list-item type="tr" class="li-tr">
        <text class="t-bodyS c-onSV">transition: width</text>
        <div class="trk"><div class="fill {{wide ? 'fill-b' : 'fill-a'}}"></div></div>
      </list-item>
      <list-item type="col" class="li-56">
        <div class="btn tbtn {{alt ? 'cb-b' : 'cb-a'}} {{pressId === 'col' ? 'p-in' : relId === 'col' ? 'p-out' : ''}}" ontouchstart="press('col')" ontouchend="release('col')" onclick="toggleCol">
          <text class="t-labelM {{alt ? 'c-onPri' : 'c-onS'}} labc">transition: 背景色</text>
        </div>
      </list-item>
      <list-item type="replay" class="li-48">
        <div class="cbtn bf {{pressId === 'rp' ? 'p-in' : relId === 'rp' ? 'p-out' : ''}}" ontouchstart="press('rp')" ontouchend="release('rp')" onclick="replay">
          <image class="cbtn-ic" src="/common/img/play_onPrimary_26.png"></image>
          <text class="t-labelM c-onPri">重播动画</text>
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
.li-row { width: $[W]px; height: $(76); flex-direction: row; justify-content: center; align-items: center; }
.cell { width: $[Math.floor(CW / 3)]px; flex-direction: column; align-items: center; padding-top: $(10); }
.cap { margin-top: $(6); lines: 1; }
.spin { width: $[png('spin_arc')[0]]px; height: $[png('spin_arc')[0]]px; }
.spin-img { width: $[png('spin_arc')[0]]px; height: $[png('spin_arc')[0]]px; }
/* CircularProgressIndicator (indeterminate): one PNG arc spun by @keyframes (Vela has no canvas arc animation) */
.spin-rot { transform-origin: $[png('spin_arc')[0] / 2]px $[png('spin_arc')[0] / 2]px; animation-name: spinK; animation-duration: 1000ms; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes spinK { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.parc { width: $[png('spin_arc')[0]]px; height: $[png('spin_arc')[0]]px; stroke-width: $[META[id].spin.sw]px; color: #E9DDFF; layer-color: #4D3D76; start-angle: 0deg; total-angle: 360deg; }
.spin-lbl { width: $[png('spin_arc')[0]]px; height: $[png('spin_arc')[0]]px; justify-content: center; align-items: center; }
.dot { width: $(28); height: $(28); border-width: 1px; border-radius: $(14); transform-origin: $(14) $(14); }
.kf-pulse { animation-name: pulseK; animation-duration: 900ms; animation-timing-function: cubic-bezier(0.2, 0, 0, 1); animation-iteration-count: infinite; }
@keyframes pulseK { 0% { transform: scale(1); } 50% { transform: scale(0.6); } 100% { transform: scale(1); } }
.kf-fade { animation-name: fadeK; animation-duration: 1200ms; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes fadeK { 0% { opacity: 1; } 50% { opacity: 0.15; } 100% { opacity: 1; } }
.kf-bounce { animation-name: bounceK; animation-duration: 700ms; animation-timing-function: cubic-bezier(0.3, 0, 0.7, 1); animation-iteration-count: infinite; }
@keyframes bounceK { 0% { transform: translateY(0px); } 50% { transform: translateY(-$(9)); } 100% { transform: translateY(0px); } }
.li-tr { width: $[W]px; height: $(40); flex-direction: column; justify-content: center; align-items: center; }
.trk { width: $[CW - dp(20)]px; height: $(8); margin-top: $(6); background-color: #303030; border-width: 1px; border-color: #303030; border-radius: $(4); }
.fill { height: $(8); background-color: #D0BCFF; border-width: 1px; border-color: #D0BCFF; border-radius: $(4); transition-property: width; transition-duration: 500ms; transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }
.fill-a { width: $[Math.round((CW - dp(20)) * 0.25)]px; }
.fill-b { width: $[CW - dp(20)]px; }
.tbtn { justify-content: center; transition-property: background-color; transition-duration: 400ms; }
.cb-a { background-color: #332E3C; border-color: #332E3C; }
.cb-b { background-color: #FFB77A; border-color: #FFB77A; }
</style>

<script>
// #include base_head.js
let progTimer = null
let wideTimer = null
export default {
  private: {
// #include base_data.js
    tlcBase: -1,
    pct: 0,
    kfOn: true,
    wide: false,
    alt: false
  },
  onInit() {
    this.setLayout([$[VP], $[dp(48)], $[dp(76)], $[dp(76)], $[dp(40)], $[dp(56)], $[dp(48)], $[dp(48)], $[VP]])
  },
  pageShow() {
    this.exiting = false
    if (!progTimer) {
      progTimer = setInterval(() => {
        this.pct = this.pct >= 100 ? 0 : this.pct + 5
      }, 250)
    }
    if (!wideTimer) {
      wideTimer = setInterval(() => {
        this.wide = !this.wide
      }, 1400)
    }
  },
  pageHide() {
    this.stopTimers()
  },
  pageDestroy() {
    this.stopTimers()
  },
  stopTimers() {
    if (progTimer) clearInterval(progTimer)
    if (wideTimer) clearInterval(wideTimer)
    progTimer = null
    wideTimer = null
  },
  toggleCol() {
    this.alt = !this.alt
  },
  replay() {
    // restart @keyframes by removing and re-adding the animation classes
    this.kfOn = false
    this.pct = 0
    setTimeout(() => {
      this.kfOn = true
    }, 60)
  },
// #include base.js
}
</script>
