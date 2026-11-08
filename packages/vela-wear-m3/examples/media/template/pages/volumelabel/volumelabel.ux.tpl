<template>
<div class="page" onswipe="onPageSwipe">
<!-- #component volume-screen {"content":"'label'"} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/media.css */
/* #include @wear/range.css */
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// VolumeScreen bound to @system.volume (0-10 steps). The device button switches headphones <-> watch speaker
// (Vela has no audio routing API, so the official output picker is simulated).
// #include @wear/base_head.js
// #include @wear/media.head.js
// #include @wear/range.head.js
// #include @wear/volume-screen.head.js
let watch=false
export default {
private:{
// #include @wear/base_data.js
// #include @wear/media.data.js
// #include @wear/range.data.js
// #include @wear/volume-screen.data.js
isHome:false,tlcBase:-1
},
onInit(){this.setLayout([]);this.volSetup({max:10,value:5,output:'headphones'})},
pageShow(){this.volShow()},
pageHide(){this.volHide()},
volOnDevice(){watch=!watch;this.volSetOutput(watch?'watch':'headphones')},
// #include @wear/volume-screen.methods.js
// #include @wear/range.js
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
