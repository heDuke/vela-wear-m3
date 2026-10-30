<template>
<div class="page" onswipe="onPageSwipe">
<div class="md-at-info" >
<!-- #component media-info {} -->
</div>
<div class="md-at-ctl">
<!-- #component media-controls {"left":"'back5'","right":"'fwd5'"} -->
</div>
<!-- #component time-text {} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/media.css */
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// Real audio through the optional adapter (media-audio.*): a generated 8 s 440 Hz test tone, polled every second.
// #include @wear/base_head.js
// #include @wear/media.head.js
// #include @wear/media-audio.head.js
export default {
private:{
// #include @wear/base_data.js
// #include @wear/media.data.js
isHome:false,tlcBase:-1
},
onInit(){this.setLayout([]);this.mdSetMeta('测试音 440 Hz','8 秒 · 生成的正弦波');this.mdaOpen('/common/tone.mp3',{title:'测试音',artist:'vela-wear-m3'})},
pageShow(){this.mdShow()},
pageHide(){this.mdHide()},
pageDestroy(){this.mdaStop()},
mdOnEnded(){this.mdSetProgress(0)},
// #include @wear/media-audio.methods.js
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
