<template><div class="page {{exiting ? 'pg-exit' : 'pg-enter'}}" onswipe="onPageSwipe"><list id="motionList" class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe"><list-item type="padt" class="li-padt"></list-item>
<!-- #include backbtn.tpl -->
<!-- #if pill -->
<list-item type="title" class="li-page-title"><text class="t-titleM c-on">进度动效</text></list-item>
<!-- #endif -->
<list-item type="selector" class="li-56"><div class="btn bt" onclick="nextKind"><text class="t-labelM c-onS">{{kindIndex+1}} / 11 · 切换样式</text></div></list-item>
<list-item type="name" class="li-note"><text class="note">{{kindLabel}}</text></list-item>

<!-- #component progress-indicator {} -->

<list-item type="presets" class="preset-row"><div class="preset" for="{{presets}}" onclick="setProgress($item)"><text class="preset-text">{{$item}}%</text></div></list-item>
<list-item type="auto" class="li-56"><div class="btn bt" onclick="toggleAuto"><text class="t-labelM c-onS">{{auto ? '暂停' : '自动演示'}}</text></div></list-item>
<list-item type="note" class="li-note"><text class="note">{{kind==='arc' ? '局部确定弧形：项目适配' : '官方组件几何 · API 1 动效降级'}}
{{kind==='overflow' ? '溢出轨道颜色 · 最高 150%' : '一次只播放一个演示'}}</text></list-item>
<list-item type="padb" class="li-padb"></list-item></list>
<!-- #include @wear/timetext.tpl -->
<!-- #include @wear/scrollind.tpl -->
</div></template><style>
/* #include @wear/m3.css */
/* #include @wear/motion.css */
</style><script>
// #include @wear/base_head.js
import {progressImage} from '../../common/m3.js'
// #include @wear/progress.head.js
export default{private:{
// #include @wear/base_data.js
pageTitle:'进度动效',tlcBase:-1,
// #include @wear/progress.data.js
},
onInit(){this.setLayout([])},
// #include @wear/progress.methods.js
// #include @wear/base.js
}
</script>
