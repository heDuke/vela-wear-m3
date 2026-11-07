<template>
fun ButtonsScreen() {
  ScreenScaffold(title = "按钮") {
    TransformingLazyColumn {
      if (pill) {
        item {
          FilledTonalButton(onClick = { nextVariant() }, label = { Text(variantLine) })
        }
      }
      items(variants) { item ->
        Note(item.name)
        Button(
          onClick = { tap(item.label) },
          variant = item.cls,
          ink = item.ink,
          icon = { Icon(item.icon) },
          label = { Text(item.label) }
        )
      }
      item {
        Note("Button · secondaryLabel")
        Button(
          onClick = { tap("播放音乐") },
          label = { Text("播放音乐") },
          secondaryLabel = { Text("我的收藏") }
        )
      }
      item {
        ListHeader { Text("图标按钮") }
      }
      items(iconVariants) { item ->
        IconButton(onClick = { tap(item.name) }, variant = item.cls) { Icon(item.icon) }
        Note(item.name)
      }
      item {
        Note("IconButton · 可选形变\n图标状态过渡为项目适配")
      }
      item {
        IconButtonMorph()
      }
      item {
        Note("Button · 可选形变")
      }
      item {
        ButtonMorph()
      }
      item {
        Note("CompactButton · 适配形变\n可见 32dp / 触控 48dp")
      }
      item {
        CompactButton()
      }
      item {
        CompactButton(onClick = { tap("更多") }, label = { Text("更多") })
      }
      item {
        Button(onClick = { }, enabled = false, label = { Text("暂不可用") })
      }
    }
  }
}
</template>
<script>
import prompt from '@system.prompt'
const VARIANTS=[{id:'filled',name:'FilledButton',label:'开始',cls:'bf',ink:'c-onPri',icon:'/common/img/favorite_onPrimary_24.png'},{id:'tonal',name:'FilledTonalButton',label:'收藏',cls:'bt',ink:'c-onS',icon:'/common/img/star_primary_24.png'},{id:'outlined',name:'OutlinedButton',label:'闹钟',cls:'bo',ink:'c-onS',icon:'/common/img/alarm_primary_24.png'},{id:'child',name:'ChildButton',label:'查看',cls:'bc',ink:'c-pri',icon:'/common/img/info_primary_24.png'}]
export default {
  private: {
    variantIndex: 0,
    variantName: '填充',
    variantLine: '填充 · 切换',
    variants: $[pill?'[VARIANTS[0]]':'VARIANTS'],
    iconVariants: [{id:'if',cls:'bf',name:'FilledIconButton',icon:'/common/img/play_onPrimary_26.png'},{id:'it',cls:'bt',name:'FilledTonalIconButton',icon:'/common/img/play_primary_26.png'},{id:'io',cls:'bo',name:'OutlinedIconButton',icon:'/common/img/play_primary_26.png'}]
  },
  nextVariant(){this.variantIndex=(this.variantIndex+1)%4;this.variantName=['填充','柔和','描边','文字'][this.variantIndex];this.variantLine=this.variantName+' · 切换';this.variants=[VARIANTS[this.variantIndex]]},
  tap(name){try{prompt.showToast({message:name,duration:1500})}catch(e){}}
}
</script>
