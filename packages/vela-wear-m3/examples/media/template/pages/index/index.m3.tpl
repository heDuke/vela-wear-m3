<template>
fun MediaIndex() {
  ScreenScaffold(showBack = false, scrollIndicator = false) {
    TransformingLazyColumn {
      item {
        Button(onClick = { openPlayer() }, icon = { Icon(icon) }, label = { Text("音乐") })
      }
      item {
        Button(onClick = { openPodcast() }, icon = { Icon(icon2) }, label = { Text("播客") })
      }
      item {
        Button(onClick = { openAudio() }, icon = { Icon(icon2) }, label = { Text("测试音") })
      }
      item {
        Button(onClick = { openVolume() }, icon = { Icon(icon2) }, label = { Text("音量") })
      }
      item {
        Button(onClick = { openVolumeLabel() }, icon = { Icon(icon2) }, label = { Text("音量（标签）") })
      }
    }
  }
}
</template>
<script>
export default {
  private: {
    isHome: true,
    icon: '/common/img/li_music.png',
    icon2: '/common/img/li_music.png'
  },
  openPlayer(){router.push({uri:'pages/player'})},
  openPodcast(){router.push({uri:'pages/podcast'})},
  openAudio(){router.push({uri:'pages/audio'})},
  openVolume(){router.push({uri:'pages/volume'})},
  openVolumeLabel(){router.push({uri:'pages/volumelabel'})}
}
</script>
