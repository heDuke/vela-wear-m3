<template>
fun TogglesScreen() {
  ScreenScaffold(title = "开关选择") {
    TransformingLazyColumn {
      item {
        FilledTonalButton(onClick = { nextSwitchVariant() }, label = { Text(switchLine) })
      }
      item {
        Note(switchNote)
      }
      items(switches) { item ->
        SwitchButton(
          checked = item.checked,
          onCheckedChange = { item.checked = it },
          enabled = item.enabled,
          label = { Text(item.label) },
          secondaryLabel = { Text(item.caption) }
        )
      }
      item {
        ListHeader { Text("步进器") }
      }
      item {
        Button(onClick = { openStepper() }, label = { Text("全屏调节音量") })
      }
      item {
        ListHeader { Text("勾选") }
      }
      item {
        CheckboxButton()
      }
      item {
        ListHeader { Text("选择") }
      }
      items(radios) { item ->
        RadioButton(selected = item.id, onClick = { pick() }, label = { Text(item.label) })
      }
      item {
        ListHeader { Text("滑块") }
      }
      item {
        FilledTonalButton(onClick = { nextSlider() }, label = { Text(sliderLine) })
      }
      item {
        Slider(value = lvl, onValueChange = { lvl = it }, steps = 6)
      }
      item {
        Note("Slider · 连续／分段／变色")
      }
      item {
        ListHeader { Text("原生对照") }
      }
      item {
        NativeSwitch()
      }
      item {
        NativeSlider()
      }
    }
    Stepper()
  }
}
</template>
<script>
export default {
  private: {
    switchLine: '1 / 2 · 切换行首图标',
    sliderLine: '分段 · 切换'
  },
  nextSwitchVariant(){this.stopSwitches();this.switchVariant=(this.switchVariant+1)%2;this.switches=variants(this.switchVariant);this.switchNote=(this.switchVariant?'行首图标':'无行首图标')+' · 滑块内对勾（官方默认）';this.switchLine=(this.switchVariant+1)+' / 2 · 切换行首图标'}
}
</script>
