<template>
<div class="page"><list class="lst" onscroll="onScroll">
<list-item class="li-padt" type="padding"></list-item>
<list-item class="li-56" type="button">
<!-- #component button {"id":"'sample'","label":"label","variant":"'bf'","ink":"'c-onPri'","icon":"icon","onClick":"toggle"} -->
</list-item>
<list-item class="li-56" type="count"><text class="t-labelM c-onS">{{count}}</text></list-item>
</list>
<!-- #component time-text {} -->
</div>
</template>
<style>
/* #include @wear/m3.css */
/* #include @wear/buttons.css */
</style>
<script>
// #include @wear/base_head.js
export default {
private:{
// #include @wear/base_data.js
isHome:true,tlcBase:-1,label:'点击计数',icon:'/common/img/star_primary_24.png',count:0
},
onInit(){this.setLayout([])},
toggle(){this.count++},
// #include @wear/base.js
}
</script>
