<template>
fun DialogsScreen() {
  ScreenScaffold(title = "对话框") {
    TransformingLazyColumn {
      item {
        Button(onClick = { openDlg() }, label = { Text("确认操作") }, secondaryLabel = { Text("确认 / 取消") }, icon = { Icon("/common/img/sec_dialogs.png") })
      }
      item {
        FilledTonalButton(onClick = { showConfirm() }, label = { Text("保存成功") }, secondaryLabel = { Text("弹出后自动消失") }, icon = { Icon("/common/img/li_star.png") })
      }
      item {
        OutlinedButton(onClick = { toast() }, label = { Text("文字提示") }, secondaryLabel = { Text("系统文字提示") }, icon = { Icon("/common/img/sec_buttons.png") })
      }
      item {
        Note("AlertDialog / Confirmation / Toast")
      }
    }
    AlertDialog(visible = dlgOn, onDismissRequest = { dlgCancel() }, onConfirm = { dlgOk() })
    SuccessConfirmationDialog(visible = cfOn, onDismissRequest = { hideConfirm() })
  }
}
</template>
<style>
$[dlgCss()]
.bg-pc { background-color: #4D3D76; border-color: #4D3D76; }
</style>
<script>
import prompt from '@system.prompt'
export default {
  private: {
    dlgOn: false,
    dlgOut: false,
    cfOn: false,
    cfOut: false
  },
  pageShow() { this.exiting = false },
  pageHide() { this.clearConfirm(); this.dlgOn=false;this.dlgOut=false },
  openDlg() { this.vib(); this.dlgOut=false; this.dlgOn=true },
  closeDlg(cb) { this.dlgOut=true; this.later(() => { this.dlgOn=false; this.dlgOut=false; if(cb) cb() }, 200) },
  dlgCancel() { this.closeDlg(() => { prompt.showToast({ message: '已取消', duration: 1500 }) }) },
  dlgOk() { this.closeDlg(() => { this.showConfirm() }) },
  toast() { this.vib(); prompt.showToast({ message: '这是一条 Toast', duration: 1500 }) },
  overlayBack() {
    if (this.dlgOn) { this.closeDlg(); return true }
    if (this.cfOn) { this.hideConfirm(); return true }
    return false
  }
}
</script>
