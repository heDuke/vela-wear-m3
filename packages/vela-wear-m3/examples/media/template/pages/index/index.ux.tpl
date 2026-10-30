<template>
<div class="page" onswipe="onPageSwipe"><list class="lst" onscroll="onScroll">
<list-item class="li-padt" type="padding"></list-item>
<list-item class="li-56" type="player">
<!-- #component button {"id":"'player'","label":"'音乐'","variant":"'bf'","ink":"'c-onPri'","icon":"icon","onClick":"openPlayer"} -->
</list-item>
<list-item class="li-56" type="podcast">
<!-- #component button {"id":"'podcast'","label":"'播客'","variant":"'bf'","ink":"'c-onPri'","icon":"icon2","onClick":"openPodcast"} -->
</list-item>
<list-item class="li-56" type="audio">
<!-- #component button {"id":"'audio'","label":"'测试音'","variant":"'bf'","ink":"'c-onPri'","icon":"icon2","onClick":"openAudio"} -->
</list-item>
</list>
<!-- #component time-text {} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/buttons.css */
</style>
<script>
// SPDX-License-Identifier: GPL-3.0-or-later
// #include @wear/base_head.js
export default {
private:{
// #include @wear/base_data.js
isHome:true,tlcBase:-1,icon:'/common/img/li_music.png',icon2:'/common/img/li_music.png'
},
onInit(){this.setLayout([])},
openPlayer(){router.push({uri:'pages/player'})},
openPodcast(){router.push({uri:'pages/podcast'})},
openAudio(){router.push({uri:'pages/audio'})},
// #include @wear/base.js
}
</script>
