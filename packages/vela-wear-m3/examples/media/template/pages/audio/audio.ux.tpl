<template>
<div class="page" onswipe="onPageSwipe">
<!-- #component media-player {"left":"'back5'","right":"'fwd5'"} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/media.css */
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// Real audio through the optional adapters: media-audio (a generated 8 s 440 Hz test tone, polled every second) and
// media-volume (@system.volume: badge from getMediaValue, level indicator on onMediaValueChanged).
// Output button steps the system media volume (setMediaValue) to exercise the volume path end to end.
// #include @wear/base_head.js
// #include @wear/media.head.js
// #include @wear/media-audio.head.js
// #include @wear/media-volume.head.js
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
mdOnOutput(){const v=mdS.vol<0?.5:mdS.vol;this.mdvSet(v>=.95?0:v+.1)},
// #include @wear/media-audio.methods.js
// #include @wear/media-volume.methods.js
// #include @wear/media.methods.js
// #include @wear/base.js
}
</script>
