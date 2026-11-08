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
assert(!ux.includes('transforming-list-item'), 'non-items lists must not wrap TLC');

const tlc = compileM3(`<template>
fun L() {
  ScreenScaffold {
    TransformingLazyColumn {
      items(items) { item ->
        Button(onClick = { tap(item.label) }, label = { Text(item.label) })
      }
    }
  }
}
</template>
<script>export default { private: { items: [] } }</script>`);
assert(tlc.includes('transforming-list-item'), tlc);
assert(tlc.includes('for="{{items}}"'), tlc);

const radios = compileM3(`<template>
fun T() {
  ScreenScaffold {
    TransformingLazyColumn {
      items(radios) { item ->
        RadioButton(label = { Text(item.label) })
      }
      item { NativeSlider() }
    }
  }
}
</template>
<script>export default { private: {} }</script>`);
assert(!radios.includes('transforming-list-item'), radios);
assert(radios.includes('controlStart'), radios);
assert(!/type="[^"]*" class="li-48" onswipe/.test(radios), radios);

const progress = compileM3(`<template>
fun M() {
  ScreenScaffold {
    TransformingLazyColumn {
      LinearProgressIndicator()
    }
  }
}
</template>
<script>export default { private: {} }</script>`);
assert(progress.includes('id="motionList"'), progress);

const card = compileM3(`<template>
fun C() {
  ScreenScaffold {
    TransformingLazyColumn {
      item {
        TitleCard {
          Row {
            Text("会议", typography = "titleSmall")
            Text("14:00", typography = "time")
          }
        }
      }
    }
  }
}
</template>
<script>export default { private: {} }</script>`);
assert(card.includes('t-titleS c-onS one grow'), card);

const plainCard = compileM3(`<template>
fun C() {
  ScreenScaffold {
    TransformingLazyColumn {
      item {
        Card { Text("日常", typography = "title") }
      }
    }
  }
}
</template>
<script>export default { private: {} }</script>`);
assert(plainCard.includes('t-titleS c-onS one'), plainCard);
assert(!plainCard.includes('one grow'), plainCard);

const iconNote = compileM3(`<template>
fun B() {
  ScreenScaffold {
    TransformingLazyColumn {
      items(iconVariants) { item ->
        IconButton(onClick = { tap(item.name) }) { Icon(item.icon) }
        Note(item.name)
      }
    }
  }
}
</template>
<script>export default { private: { iconVariants: [] } }</script>`);
assert(iconNote.includes('class="icon-note"'), iconNote);
assert(iconNote.includes('class="icon-group"'), iconNote);

const assign = compileM3(`<template>
fun A() {
  ScreenScaffold {
    TransformingLazyColumn {
      item { Button(onClick = { flag = true }, label = { Text("x") }) }
      item { Button(onClick = { msg = "hello" }, label = { Text("y") }) }
      items(rows) { item ->
        Button(onClick = { item.done = true }, label = { Text(item.label) })
      }
    }
  }
}
</template>
<script>export default { private: { flag: false, msg: '', rows: [] } }</script>`);
assert(assign.includes('this.flag=true'), assign);
assert(assign.includes('this.msg="hello"'), assign);
assert(!assign.includes('this.hello'), assign);
assert(assign.includes('_set2($idx)'), assign);
assert(assign.includes('(i){const a=this.rows;a[i].done=true'), assign);
assert(!assign.includes('a[$idx]'), assign);
assert.throws(() => compileM3(`<template>
fun X() {
  ScreenScaffold {
    TransformingLazyColumn {
      item { Button(onClick = { item.checked = it }, label = { Text("a") }) }
    }
  }
}
</template>
<script>export default { private: {} }</script>`), /it is not provided by onClick/);

console.log('compose-test ok', ux.length, media.length, media2.length, home.length);
