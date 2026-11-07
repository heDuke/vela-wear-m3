<template>
fun VolumeLabel() {
  VolumeScreen(content = "label")
}
</template>
<script>
let watch=false
export default {
  private: { isHome: false },
  onInit(){this.volSetup({max:10,value:5,output:'headphones'})},
  pageShow(){this.volShow()},
  pageHide(){this.volHide()},
  volOnDevice(){watch=!watch;this.volSetOutput(watch?'watch':'headphones')}
}
</script>
