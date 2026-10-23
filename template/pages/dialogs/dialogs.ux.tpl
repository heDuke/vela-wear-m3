<!-- #set siFrac = 5 -->
<template>
  <!-- 对话框: AlertDialog + Confirmation overlays (Vela has no dialog API; prompt only has showToast) -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
      <list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
      <!-- #if pill -->
<list-item onswipe="onPageSwipe" type="hdr" class="li-page-title">
        <div class="lh"><text class="t-titleM c-on tc">对话框</text></div>
      </list-item>
<!-- #endif -->
      <list-item onswipe="onPageSwipe" type="d1" class="li-56">
        <div class="btn btn-ic bf {{pressId === 'a' ? 'p-in' : relId === 'a' ? 'p-out' : ''}}" style="{{feedback['a'] || {opacity:1}}}" ontouchstart="press('a')" ontouchend="release('a')" onclick="openDlg">
          <div class="icc bg-pc"><image class="ic-sec" src="/common/img/sec_dialogs.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onPri lab">确认操作</text>
            <text class="t-labelS c-onPri lab">确认 / 取消</text>
          </div>
        </div>
      </list-item>
      <list-item onswipe="onPageSwipe" type="d2" class="li-56">
        <div class="btn btn-ic bt {{pressId === 'b' ? 'p-in' : relId === 'b' ? 'p-out' : ''}}" style="{{feedback['b'] || {opacity:1}}}" ontouchstart="press('b')" ontouchend="release('b')" onclick="showConfirm">
          <div class="icc bg-pd"><image class="ic-sec" src="/common/img/li_star.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onS lab">保存成功</text>
            <text class="t-labelS c-onSV lab">弹出后自动消失</text>
          </div>
        </div>
      </list-item>
      <list-item onswipe="onPageSwipe" type="d3" class="li-56">
        <div class="btn btn-ic bo {{pressId === 'c' ? 'p-in' : relId === 'c' ? 'p-out' : ''}}" style="{{feedback['c'] || {opacity:1}}}" ontouchstart="press('c')" ontouchend="release('c')" onclick="toast">
          <div class="icc bg-sd"><image class="ic-sec" src="/common/img/sec_buttons.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onS lab">文字提示</text>
            <text class="t-labelS c-onSV lab">系统文字提示</text>
          </div>
        </div>
      </list-item>

      <list-item type="api-note" class="li-note"><text class="note">AlertDialog / Confirmation / Toast</text></list-item>
      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
<!-- #include @wear/dialog.tpl -->
<!-- #include @wear/confirm.tpl -->
  </div>
</template>

<style>
/* #include @wear/m3.css */
/* #include @wear/overlay.css */
$[dlgCss()]
/* #include @wear/confirm.css */
.bg-pc { background-color: #4D3D76; border-color: #4D3D76; }
</style>

<script>
// #include @wear/base_head.js
import prompt from '@system.prompt'
let cfTimer = null
let confirmEpoch=0
export default {
  private: {
// #include @wear/base_data.js
    pageTitle:"对话框",
    tlcBase: -1,
    dlgOn: false,
    dlgOut: false,
    cfOn: false,
    cfOut: false,
// #if enhanced
    checkFrames: $[frames('check')],
// #endif
  },
  onInit(){this.setLayout([])},
  pageShow() { this.exiting = false },
  pageHide() { this.clearConfirm(); this.dlgOn=false;this.dlgOut=false; },
  openDlg() {
    this.vib()
    this.dlgOut = false
    this.dlgOn = true
  },
  closeDlg(cb) {
    this.dlgOut = true
    this.later(() => {
      this.dlgOn = false
      this.dlgOut = false
      if (cb) cb()
    }, 200)
  },
  dlgCancel() {
    this.closeDlg(() => {
      prompt.showToast({ message: '已取消', duration: 1500 })
    })
  },
  dlgOk() {
    this.closeDlg(() => {
      this.showConfirm()
    })
  },
  toast() {
    this.vib()
    prompt.showToast({ message: '这是一条 Toast', duration: 1500 })
  },
  overlayBack() {
    if (this.dlgOn) {
      this.closeDlg()
      return true
    }
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
