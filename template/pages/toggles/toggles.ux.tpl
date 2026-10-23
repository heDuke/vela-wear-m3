<template><div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe"><list class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">
<list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
<!-- #if pill -->
<list-item type="title" class="li-page-title"><text class="t-titleM c-on">开关选择</text></list-item>
<!-- #endif -->
<list-item type="selector" class="li-56"><div class="btn bt" onclick="nextSwitchVariant"><text class="t-labelM c-onS">{{switchVariant+1}} / 4 · 切换组合</text></div></list-item>
<list-item type="description" class="li-note"><text class="note">{{switchNote}}</text></list-item>
<list-item type="switch" class="switch-row" for="{{switches}}" tid="id">
<!-- #component switch-button {"item": "$item", "index": "$idx"} -->
</list-item>
<list-item type="step-title" class="li-hdr"><text class="t-titleS c-onSV">步进器</text></list-item><list-item type="step-entry" class="li-56"><div class="btn bf" onclick="openStepper"><text class="t-labelM c-onPri">全屏调节音量</text></div></list-item>
<list-item type="check-title" class="li-hdr"><text class="t-titleS c-onSV">勾选</text></list-item><list-item type="check" class="li-56">
<!-- #component checkbox-button {} -->
</list-item>
<list-item type="radio-title" class="li-hdr"><text class="t-titleS c-onSV">选择</text></list-item><list-item type="radio" class="li-56" for="{{radios}}" tid="id">
<!-- #component radio-button {"item": "$item", "index": "$idx"} -->
</list-item>
<list-item type="slider-title" class="li-hdr"><text class="t-titleS c-onSV">滑块</text></list-item><list-item type="slider-select" class="li-56"><div class="btn bt" onclick="nextSlider"><text class="t-labelM c-onS">{{sliderName}} · 切换</text></div></list-item>
<list-item type="slider" class="slider-row">
<!-- #component inline-slider {} -->
</list-item>
<list-item type="slider-note" class="li-note"><text class="note">Slider · 连续／分段／变色
$[pill?'轨道独占一行：窄屏适配':'选中 12dp / 未选中 4dp']</text></list-item>
<list-item type="native-title" class="li-hdr"><text class="t-titleS c-onSV">原生对照</text></list-item><list-item type="native-switch" class="li-48"><switch checked="{{wifi}}" onchange="nWifi"></switch></list-item><list-item type="native-slider" class="li-48" ontouchstart="controlStart" ontouchend="controlEnd"><slider class="nsl" min="0" max="5" step="1" value="{{lvl}}" onchange="nLvl"></slider></list-item><list-item type="padb" class="li-padb"></list-item></list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
<!-- #include @wear/range.tpl -->
</div></template><style>
/* #include @wear/m3.css */
/* #include @wear/range.css */
/* #include @wear/toggles.css */
</style><script>
// #include @wear/base_head.js
// #include @wear/selection.head.js
export default{private:{
// #include @wear/base_data.js
pageTitle:'开关选择',tlcBase:-1,
// #include @wear/selection.data.js
},
onInit(){this.updateSlider();this.setLayout([])},
nextSwitchVariant(){this.stopSwitches();this.switchVariant=(this.switchVariant+1)%4;this.switches=variants(this.switchVariant);this.switchNote=(this.switchVariant>=2?'行首图标':'纯文字')+'／'+(this.switchVariant%2?'状态图标 · 官方默认':'无状态图标 · 适配变体')},
// #include @wear/selection.methods.js
// #include @wear/range.js
// #include @wear/base.js
}
</script>
