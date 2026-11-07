<template>
fun IndexScreen() {
  ScreenScaffold(showBack = false) {
    TransformingLazyColumn {
      item {
        Button(
          onClick = { toggle() },
          icon = { Icon(icon) },
          label = { Text(label) }
        )
      }
      item {
        Text(count)
      }
    }
  }
}
</template>
<script>
export default {
  private: {
    isHome: true,
    label: '点击计数',
    icon: '/common/img/star_primary_24.png',
    count: 0
  },
  toggle() { this.count++ }
}
</script>
