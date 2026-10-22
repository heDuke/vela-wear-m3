<template>
  <!-- 时间: curved TimeText (per-glyph rotation on round, straight on rect/pill), live clock, seconds arc, 12/24h CompactButton -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
<!-- #if round -->
    <progress class="sec-arc" type="arc" percent="{{secPct}}"></progress>
<!-- #endif -->
    <div class="col">
      <text class="t-titleS c-onSV">{{dateStr}}</text>
      <div class="clk">
        <text class="big c-onS">{{hm}}</text>
        <text class="sec c-pri">{{ss}}</text>
      </div>
<!-- #if !round -->
      <div class="bar"><div class="bar-f" style="{{barSt}}"></div></div>
<!-- #endif -->
      <text class="t-bodyS c-onSV ap">{{ampm}}</text>
      <div class="cslot">
        <div class="cbtn bf {{pressId === 'h' ? 'p-in' : relId === 'h' ? 'p-out' : ''}}" ontouchstart="press('h')" ontouchend="release('h')" onclick="toggleH">
          <text class="t-labelM c-onPri">{{h24 ? '12 小时' : '24 小时'}}</text>
        </div>
        <div class="cbtn bt gap {{pressId === 'back' ? 'p-in' : relId === 'back' ? 'p-out' : ''}}" ontouchstart="press('back')" ontouchend="release('back')" onclick="goBack">
          <text class="t-labelM c-onS">返回</text>
        </div>
      </div>
    </div>
<!-- #include timetext.tpl -->
  </div>
</template>

<style>
/* #include m3.css */
.col { position: absolute; left: 0px; top: $[round ? dp(60) : pill ? dp(72) : dp(56)]px; width: $[W]px; flex-direction: column; align-items: center; }
.clk { flex-direction: row; align-items: flex-end; margin-top: $(4); }
.big { font-size: $[pill ? dp(44) : dp(56)]px; line-height: $[pill ? dp(48) : dp(60)]px; font-weight: bold; }
.sec { font-size: $(22); line-height: $(30); margin-left: $(4); font-weight: bold; }
.gap { margin-left: $(8); }
.ap { margin-top: $(2); height: $(16); }
/* round: seconds as a full-circle <progress type="arc"> hugging the bezel */
.sec-arc { position: absolute; left: $(4); top: $(4); width: $[W - dp(8)]px; height: $[H - dp(8)]px; stroke-width: $(4); color: #D0BCFF; layer-color: #303030; start-angle: 0deg; total-angle: 360deg; }
.bar { width: $[CW - dp(16)]px; height: $(6); margin-top: $(6); background-color: #303030; border-width: 1px; border-color: #303030; border-radius: $(3); }
.bar-f { height: $(6); background-color: #D0BCFF; border-width: 1px; border-color: #D0BCFF; border-radius: $(3); }
</style>

<script>
// #include base_head.js
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const BARW = $[CW - dp(16)]
export default {
  private: {
// #include base_data.js
    isHome: false,
    hm: '10:08',
    ss: '00',
    ampm: '',
    dateStr: '',
    secPct: 0,
    barSt: { width: '0px' }
  },
  pageShow() {
    this.exiting = false
  },
  onTick(d) {
    let h = d.getHours()
    const s = d.getSeconds()
    this.ampm = this.h24 ? '24 小时制' : h < 12 ? '上午' : '下午'
    if (!this.h24) {
      h = h % 12
      if (h === 0) h = 12
    }
    this.hm = pad2(h) + ':' + pad2(d.getMinutes())
    this.ss = pad2(s)
    this.dateStr = d.getMonth() + 1 + '月' + d.getDate() + '日 周' + WEEK[d.getDay()]
    this.secPct = Math.round((s / 60) * 100)
    this.barSt = { width: Math.max(2, Math.round((BARW * s) / 59)) + 'px' }
  },
  toggleH() {
    this.vib()
    this.h24 = !this.h24
    this.tick()
  },
// #include base.js
}
</script>
