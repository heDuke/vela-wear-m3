<template>
fun Output() {
  MediaColumn {
    MediaOutputPicker()
  }
}
</template>
<script>
// Output picker opened from the VolumeScreen device button. UI only: Vela has no audio routing API, so the list is
// supplied by the app and a selection only calls opOnSelect (here: remembered in the app's global data and shown on
// the volume page as the device name).
const DEVICES=[{id:'phone',name:'手机扬声器',type:'phone'},{id:'buds',name:'Pixel Buds Pro',type:'headphones'},{id:'watch',name:'手表扬声器',type:'watch'},
 {id:'sony',name:'Sony WH-1000XM5 无线降噪耳机',type:'bluetooth'},{id:'room',name:'客厅音箱',type:'speaker'}]
export default {
  private: { isHome: false },
  onInit(){const cur=(this.$app.$def.mediaOutput||'phone');const devices=DEVICES.map(d=>Object.assign({},d,{current:d.id===cur}))
    // rough row heights for the ScrollIndicator: header 48dp+VP, items 56dp, footnote ~3 lines, bottom padding
    // (setLayout resets the press feedback map, so it runs before opSetup registers the item ids)
    this.setLayout([$[VP+dp(56)]].concat(DEVICES.map(()=>$[dp(56)])).concat([$[dp(60)],$[Math.round(H*.18)]]))
    this.opSetup({devices,footnote:'媒体内容将从 Pixel 8 Pro 传输到所选音频输出设备上播放'})},
  opOnSelect(id){this.$app.$def.mediaOutput=id}
}
</script>
