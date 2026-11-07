<template>
fun MotionScreen() {
  ScreenScaffold(title = "进度动效") {
    TransformingLazyColumn {
      item {
        FilledTonalButton(onClick = { nextKind() }, label = { Text("{{kindIndex+1}} / 11 · 切换样式") })
      }
      item {
        Note(kindLabel)
      }
      CircularProgressIndicator()
      PresetRow()
      item {
        FilledTonalButton(onClick = { toggleAuto() }, label = { Text("{{auto ? '暂停' : '自动演示'}}") })
      }
      item {
        Note("官方组件几何 · API 1 动效降级")
      }
    }
  }
}
</template>
<script>
import {progressImage} from '../../common/m3.js'
export default {
  private: {}
}
</script>
