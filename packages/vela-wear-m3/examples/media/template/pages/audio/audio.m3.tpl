<template>
fun Audio() {
  PlayerScreen(left = "back5", right = "fwd5")
}
</template>
<script>
export default {
  private: { isHome: false },
  onInit(){this.mdSetMeta('测试音 440 Hz','8 秒 · 生成的正弦波');this.mdaOpen('/common/tone.mp3',{title:'测试音',artist:'vela-wear-m3'})},
  pageShow(){this.mdShow()},
  pageHide(){this.mdHide()},
  pageDestroy(){this.mdaStop()},
  mdOnEnded(){this.mdSetProgress(0)},
  mdOnOutput(){const v=mdS.vol<0?.5:mdS.vol;this.mdvSet(v>=.95?0:v+.1)}
}
</script>
