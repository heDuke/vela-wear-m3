<template>
fun CardsScreen() {
  ScreenScaffold(title = "卡片") {
    TransformingLazyColumn {
      item {
        Card(onClick = { vib() }) {
          Text("日常", typography = "title")
          Text("点击查看内容\nCard", typography = "body")
        }
      }
      item {
        TitleCard(onClick = { vib() }) {
          Row {
            Text("会议", typography = "titleSmall")
            Text("现在", typography = "time")
          }
          Text("15:00\n三楼会议室", typography = "body")
        }
      }
      item(class = "li-c3") {
        AppCard(onClick = { vib() }) {
          Row {
            Icon("water")
            Text("喝水", typography = "label")
            Text("刚刚", typography = "time")
          }
          Text("已喝 1200 ml", typography = "headline")
          Text("目标 2000 ml\n还差 800 ml", typography = "body")
        }
      }
      item {
        OutlinedCard(onClick = { vib() }) {
          Text("提醒", typography = "title")
          Text("清晰边界\nOutlinedCard", typography = "body")
        }
      }
    }
  }
}
</template>
<script>
export default {
  private: {},
  pageShow() { this.exiting = false }
}
</script>
