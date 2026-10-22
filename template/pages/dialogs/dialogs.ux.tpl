<!-- #set siFrac = 5 -->
<template>
  <!-- 对话框: AlertDialog + Confirmation overlays (Vela has no dialog API; prompt only has showToast) -->
  <div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}">
    <list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom">
      <list-item type="padt" class="li-padt"></list-item>
      <list-item type="hdr" class="li-hdr">
        <div class="lh"><text class="t-titleM c-on tc">对话框</text></div>
      </list-item>
      <list-item type="d1" class="li-56">
        <div class="btn btn-ic bf {{pressId === 'a' ? 'p-in' : relId === 'a' ? 'p-out' : ''}}" ontouchstart="press('a')" ontouchend="release('a')" onclick="openDlg">
          <div class="icc bg-pc"><image class="ic-sec" src="/common/img/sec_dialogs.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onPri lab">AlertDialog</text>
            <text class="t-labelS c-onPri lab">确认 / 取消</text>
          </div>
        </div>
      </list-item>
      <list-item type="d2" class="li-56">
        <div class="btn btn-ic bt {{pressId === 'b' ? 'p-in' : relId === 'b' ? 'p-out' : ''}}" ontouchstart="press('b')" ontouchend="release('b')" onclick="showConfirm">
          <div class="icc bg-pd"><image class="ic-sec" src="/common/img/li_star.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onS lab">Confirmation</text>
            <text class="t-labelS c-onSV lab">弹出后自动消失</text>
          </div>
        </div>
      </list-item>
      <list-item type="d3" class="li-56">
        <div class="btn btn-ic bo {{pressId === 'c' ? 'p-in' : relId === 'c' ? 'p-out' : ''}}" ontouchstart="press('c')" ontouchend="release('c')" onclick="toast">
          <div class="icc bg-sd"><image class="ic-sec" src="/common/img/sec_buttons.png"></image></div>
          <div class="bcol">
            <text class="t-labelM c-onS lab">Toast</text>
            <text class="t-labelS c-onSV lab">系统 prompt.showToast</text>
          </div>
        </div>
      </list-item>
<!-- #include backbtn.tpl -->
      <list-item type="padb" class="li-padb"></list-item>
    </list>
<!-- #include timetext.tpl -->
<!-- #include scrollind.tpl -->
<!-- #include dialog.tpl -->
<!-- #include confirm.tpl -->
  </div>
</template>

<style>
/* #include m3.css */
/* #include overlay.css */
$[dlgCss()]
/* #include confirm.css */
.bg-pc { background-color: #4D3D76; border-color: #4D3D76; }
</style>

<script>
// #include base_head.js
import prompt from '@system.prompt'
let cfTimer = null
export default {
  private: {
// #include base_data.js
    tlcBase: -1,
    dlgOn: false,
    dlgOut: false,
    cfOn: false,
    cfOut: false
  },
  onInit() {
    const d = $[k]
    this.setLayout([$[VP], 48 * d, 56 * d, 56 * d, 56 * d, 48 * d, $[VP]])
  },
  pageShow() {
    this.exiting = false
  },
  openDlg() {
    this.vib()
    this.dlgOut = false
    this.dlgOn = true
  },
  closeDlg(cb) {
    this.dlgOut = true
    setTimeout(() => {
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
// #include confirm.js
// #include base.js
}
</script>
