# vela-wear-m3

小米 Vela 的 **Wear Material 3 生成式组件库**。编译时展开模板、状态逻辑、令牌与局部图形；生成后是普通 UX / JavaScript，不引入自定义组件 ViewModel 或第三方运行时。

当前为 `0.1.0`：round、Pro、band10、band9；`basic` 对应最低 API 1，`enhanced` 对应最低 API 2。公共接口仍可能在 1.0 前调整。AndroidX 参考提交固定为 `2f557dc1f1ec71edae73e2c16b0e446523c644b7`，官方默认、官方可选样式与本项目适配变体见组件文档。不是 Google 或小米官方组件库。

## 安装与生成

仓库外安装生成的 tarball，或通过 GitHub 检出本包后打包；本轮不自动发布 npm registry。

```sh
npm install -D ./vela-wear-m3-0.1.0.tgz
npx vela-wear-m3 gen --input template --out src --device band10 --animation enhanced
```

`template/` 是消费项目自己的源目录。完整、可独立运行的 GPL 示例位于 `examples/minimal/template/`；将它复制为消费项目的 template 后即可生成，再交给 aiot-toolkit build / release。示例不依赖本仓库的非商业 Demo。

生成器不会改动输入。输出目录必须为空或带有本工具创建的 `.vela-wear-m3-output.json` 标记；不要把手写文件放在输出目录，后续生成会替换其中内容。只编译你信任的模板，表达式在构建时执行。

```js
const { generate, componentSource, components, devices } = require('vela-wear-m3')
generate({input:'template',output:'src',device:'round',animation:'basic'})
const markup = componentSource('button', {
  id:"'save'", label:'saveLabel', variant:"'bf'", ink:"'c-onPri'",
  icon:'saveIcon', onClick:'save'
})
```

## 模板接入契约

```html
<!-- #component button {"id":"'save'","label":"saveLabel","variant":"'bf'","ink":"'c-onPri'","icon":"saveIcon","onClick":"save"} -->
```

这些字符串是**编译期绑定表达式**，不是运行时 props；文字常量需要用表达式引号，例如 `"'保存'"`。`onClick` 是消费页面声明的方法或调用表达式。`card` 的 `content` 是可信的编译期 Vela 标记，不是运行时 slot。

在页面 `<style>` 中引入 `/* #include @wear/m3.css */` 和对应组件样式；在脚本中依次引入 `// #include @wear/base_head.js`、private 对象内的 `base_data.js`、方法对象内的 `base.js`。消费页面仍负责输入数据、业务回调和 onInit 中的 `this.setLayout([])`。生成器从实际 list-item 与样式计算布局，不维护第二份高度表。

| 组件 | 样式 / 逻辑契约 |
|---|---|
| `button`, `icon-button`, `compact-button`, `button-morph`, `icon-button-morph` | `buttons.css`；形变额外引入 `buttons.head.js`、`buttons.timer.js`、`buttons.data.js`、`buttons.methods.js`，使用共享按压状态机 |
| `card` | `cards.css`，参数 `id`、`variant`（`card cs` / `card co`）、`content`；标题与 AppCard 内容由消费项目组合 |
| `switch-button`, `checkbox-button`, `radio-button`, `inline-slider` | `toggles.css`、`selection.head.js`、`selection.data.js`、`selection.methods.js`；Switch 表达式参数 `item`、`index`，每个 item 含 checked / disabled / leading / tick / src / position / label / caption |
| `stepper`, `level-indicator` | `range.css`、`range.head.js`、`range.data.js`、`range.js`；首版控制器整数范围 0–10，通过 stepValue / stepEnabled 控制 |
| `page-indicator` | `pager.css`、`pager.head.js`、`pager.data.js`、`pager.methods.js`；pageIndex / pageCount，横纵 demoMode，连续拖动与 25% 阈值 |
| `progress-indicator` | `motion.css`、`progress.head.js`、`progress.data.js`、`progress.methods.js`；pct / kind / loadingVisible，onShow / onScrolled / onHide 控制播放器 |
| `time-text`, `scroll-indicator`, `transforming-list-item` | 公共样式、base 状态与 runtime；TLC 项传 `style` 和编译期 `content`，消费列表提供 items / tlcBase / tlcOn |
| `edge-button`, `alert-dialog`, `confirmation` | edge / overlay / confirm 样式与对应 tpl；状态与回调详见 `docs/COMPONENTS.md` |

完整绑定表和生命周期组合规则见 [组件契约](docs/COMPONENTS.md)。每个页面独立展开一份基础状态；不能在同一方法对象重复引入 base 或覆盖其生命周期而不调用 cleanup。`pageShow` / `pageHide` / `pageDestroy` 是业务扩展点。默认系统路由、振动调用保留并有错误处理；图标资源使用库随包提供的绝对路径。

## 资源与兼容

包内有四设备预渲染 PNG，日常生成不需要 Python、浏览器、下载字体或 Vela SDK。重新生成资产才需要 Pillow、Chrome 及相应开发工具。独立字形由 Noto Sans SC 生成，源 URL / SHA-256 位于 `tools/font-source.json`；先运行 `node tools/fetch-font.js` 下载校验后的开发输入。字体本体不随包分发。

API 1 的连续圆角形变、对勾描画与弧段变化存在降级。API 2 使用 image-animator；原生镜像问题使其最终性能验收尚未完成。生成式组件库保持现有 Gallery 的运行结构，但不据此宣称解决了所有真机卡顿。当前完整 Demo 的包体仍超预算。

## 许可

原创实现 Copyright © 2026 heDuke，**GPL-3.0-or-later**，见 [LICENSE](LICENSE)。生成代码保留库的许可义务。GPL 允许免费或收费商用；另行闭源商业授权不是自动授予的权利。指定非商业 Demo 的组合分发见 [集成许可](DEMO-EXCEPTION.md)。本包的 minimal 示例属于 GPL 库源码，不受 Demo 非商业限制。

AndroidX、Material Symbols 与字体保留各自版权及许可，见 [第三方声明](THIRD_PARTY_NOTICES.md)。本包无权授予对 Google 设计、第三方代码或商标的独占商业权利。
