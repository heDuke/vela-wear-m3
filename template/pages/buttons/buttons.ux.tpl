<template>
<div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe"><list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
<list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
<!-- #if pill -->
<list-item type="title" class="li-page-title"><text class="t-titleM c-on">按钮</text></list-item>
<list-item type="selector" class="li-56"><div class="btn bt" onclick="nextVariant"><text class="t-labelM c-onS">{{variantName}} · 切换</text></div></list-item>
<!-- #endif -->
<list-item type="button" class="button-row" for="{{variants}}" tid="id"><text class="note">{{$item.name}}</text>
<!-- #component button {"id": "$item.id", "label": "$item.label", "variant": "$item.cls", "ink": "$item.ink", "icon": "$item.icon", "onClick": "tap($item.label)"} -->
</list-item>
<list-item type="secondary" class="button-row"><text class="note">Button · secondaryLabel</text><div class="btn bpc" style="{{feedback.secondary || {opacity:1}}}" ontouchstart="press('secondary')" ontouchend="release('secondary')" ontouchmove="cancelPress" onclick="tap('播放音乐')"><div class="bcol"><text class="t-labelM c-onPC">播放音乐</text><text class="t-labelS c-onSV">我的收藏</text></div></div></list-item>
<list-item type="icons-title" class="li-hdr"><text class="t-titleS c-onSV">图标按钮</text></list-item>
<list-item type="icons" class="icon-group" for="{{iconVariants}}" tid="id">
<!-- #component icon-button {"id": "$item.id", "variant": "$item.cls", "icon": "$item.icon", "label": "$item.name", "onClick": "tap($item.name)"} -->
<text class="icon-note">{{$item.name}}</text></list-item>
<list-item type="morph-title" class="li-note"><text class="note">IconButton · 可选形变
图标状态过渡为项目适配</text></list-item>
<list-item type="morph" class="morph-row">
<!-- #component icon-button-morph {} -->
</list-item>
<list-item type="button-motion-note" class="li-note"><text class="note">Button · 可选形变</text></list-item>
<list-item type="button-morph" class="morph-row">
<!-- #component button-morph {} -->
</list-item>
<list-item type="compact-title" class="li-note"><text class="note">CompactButton · 适配形变
可见 32dp / 触控 48dp</text></list-item>
<list-item type="compact" class="compact-row">
<!-- #component compact-button {} -->
</list-item>
<list-item type="compact-static" class="compact-row"><div class="compact-hit" style="{{feedback.compactStatic || {opacity:1}}}" ontouchstart="press('compactStatic')" ontouchend="release('compactStatic')" ontouchmove="cancelPress" onclick="tap('更多')"><div class="cbtn bt"><text class="t-labelM c-onS">更多</text></div></div></list-item>
<list-item type="disabled" class="li-56"><div class="btn bd"><text class="t-labelM c-dis">暂不可用</text></div></list-item><list-item type="padb" class="li-padb"></list-item></list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
</div></template>
<style>
/* #include @wear/m3.css */
/* #include @wear/buttons.css */
</style>
<script>
// #include @wear/base_head.js
import prompt from '@system.prompt'
// #include @wear/buttons.head.js
const VARIANTS=[{id:'filled',name:'FilledButton',label:'开始',cls:'bf',ink:'c-onPri',icon:'/common/img/favorite_onPrimary_24.png'},{id:'tonal',name:'FilledTonalButton',label:'收藏',cls:'bt',ink:'c-onS',icon:'/common/img/star_primary_24.png'},{id:'outlined',name:'OutlinedButton',label:'闹钟',cls:'bo',ink:'c-onS',icon:'/common/img/alarm_primary_24.png'},{id:'child',name:'ChildButton',label:'查看',cls:'bc',ink:'c-pri',icon:'/common/img/info_primary_24.png'}]
// #include @wear/buttons.timer.js
export default{private:{
// #include @wear/base_data.js
pageTitle:'按钮',tlcBase:-1,variantIndex:0,variantName:'填充',variants:$[pill?'[VARIANTS[0]]':'VARIANTS'],
iconVariants:[{id:'if',cls:'bf',name:'FilledIconButton',icon:'/common/img/play_onPrimary_26.png'},{id:'it',cls:'bt',name:'FilledTonalIconButton',icon:'/common/img/play_primary_26.png'},{id:'io',cls:'bo',name:'OutlinedIconButton',icon:'/common/img/play_primary_26.png'}],

// #include @wear/buttons.data.js
},
onInit(){this.setLayout([])},
nextVariant(){this.variantIndex=(this.variantIndex+1)%4;this.variantName=['填充','柔和','描边','文字'][this.variantIndex];this.variants=[VARIANTS[this.variantIndex]]},
tap(name){try{prompt.showToast({message:name,duration:1500})}catch(e){}},
// #include @wear/buttons.methods.js
// #include @wear/base.js
}
</script>
