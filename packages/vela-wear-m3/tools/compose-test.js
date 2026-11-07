// SPDX-License-Identifier: GPL-3.0-or-later
const assert = require('assert/strict');
const { compileM3, parse } = require('./compose');

const src = `<template>
fun IndexScreen() {
  ScreenScaffold(title = "按钮", siFrac = 3) {
    TransformingLazyColumn {
      items(variants) { item ->
        Button(
          onClick = { tap(item.label) },
          icon = { Icon(item.icon) },
          label = { Text(item.label) }
        )
      }
      item {
        Button(
          onClick = { tap("播放音乐") },
          label = { Text("播放音乐") },
          secondaryLabel = { Text("我的收藏") }
        )
      }
      item {
        Button(
          onClick = { },
          enabled = false,
          label = { Text("暂不可用") }
        )
      }
      item {
        FilledIconButton(onClick = { tap("播放") }) {
          Icon("play_arrow")
        }
      }
    }
  }
}
</template>
<script>
import prompt from '@system.prompt'
export default {
  private: {
    variants: [{ id: 'filled', label: '开始', icon: '/common/img/favorite_onPrimary_24.png' }]
  },
  tap(name) { prompt.showToast({ message: name, duration: 1500 }) }
}
</script>
`;

const ast = parse(src);
assert.equal(ast.body[0].name, 'ScreenScaffold');
const ux = compileM3(src);
assert(ux.includes('tap($item.label)'), ux);
assert(ux.includes("tap('播放音乐')"), ux);
assert(ux.includes('class="btn bd"'), 'disabled');
assert(ux.includes('play_onPrimary_26.png'), ux);
assert(ux.includes('/* #include @wear/buttons.css */'));
assert(ux.includes('// #include @wear/base_head.js'));
assert(ux.includes('// #include @wear/base.js'));
assert(!ux.includes('modifier'));
assert.throws(() => compileM3(`<template>
fun X() {
  ScreenScaffold {
    TransformingLazyColumn {
      item { Button(modifier = 1, onClick = { tap() }, label = { Text("a") }) }
    }
  }
}
</template>
<script>export default { private: {} }</script>`), /unsupported parameter modifier/);

const media = compileM3(`<template>
fun Audio() { PlayerScreen(left = "back5", right = "fwd5") }
</template>
<script>
export default {
  private: { isHome: false },
  onInit(){this.mdaOpen('/common/tone.mp3',{title:'t',artist:'a'})},
  mdOnOutput(){this.mdvSet(0.2)}
}
</script>`);
assert(media.includes('#component media-player'), media);
assert(media.includes('media-audio.head.js'), media);
assert(media.includes('media-volume.head.js'), media);
assert(media.includes('onInit_user'), media);
const media2 = compileM3(`<template>
fun Volume() { VolumeScreen(content = "device") }
</template>
<script>
export default { private: { isHome: false }, onInit(){this.volSetup({max:10,value:5})} }
</script>`);
assert(media2.includes('volume-screen'), media2);
assert(!/media-audio\.head\.js/.test(media2), 'audio pack must not leak');

const home = compileM3(`<template>
fun Index() {
  ScreenScaffold(showBack = false) {
    TransformingLazyColumn {
      item { Button(onClick = { toggle() }, label = { Text(label) }) }
    }
  }
}
</template>
<script>export default { private: { isHome: true, label: 'x' }, toggle(){this.count++} }</script>`);
assert(!home.includes('type="back"'), home);
assert(home.includes('onclick="toggle"'), home);

const nl = compileM3(`<template>
fun N() {
  ScreenScaffold(showBack = false) {
    TransformingLazyColumn {
      item { Note("a\\nb") }
    }
  }
}
</template>
<script>export default { private: {} }</script>`);
assert(nl.includes('a\nb'), nl);
console.log('compose-test ok', ux.length, media.length, media2.length, home.length);
