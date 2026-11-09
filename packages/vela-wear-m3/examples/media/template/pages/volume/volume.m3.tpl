<template>
fun Volume() {
  VolumeScreen(content = "device")
}
</template>
<script>
// VolumeScreen bound to @system.volume (0-10 steps). The device button opens the output picker page (pages/output);
// Vela has no audio routing API, so the picker is UI only and the chosen name is just displayed here on return.
const NAMES={phone:'手机扬声器',buds:'Pixel Buds Pro',watch:'手表扬声器',sony:'Sony WH-1000XM5 无线降噪耳机',room:'客厅音箱'}
export default {
  private: { isHome: false },
  onInit(){this.volSetup({max:10,value:5,output:'headphones'})},
  pageShow(){this.volApplyOutput();this.volShow()},
  pageHide(){this.volHide()},
  volOnDevice(){router.push({uri:'pages/output'})},
  volApplyOutput(){const id=this.$app.$def.mediaOutput;if(!id)return;this.volSetOutput(id==='watch'?'watch':'headphones',NAMES[id])}
}
</script>
