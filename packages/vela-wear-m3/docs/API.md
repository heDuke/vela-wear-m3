# API 参考 · 0.1.0

[快速上手](GETTING-STARTED.md) · [组件与控制器](COMPONENTS.md)

本库使用 CommonJS，导出 `generate`、`componentSource`、`components`、`devices`。CLI 调用同一个生成器。这里记录当前接口，不代表 1.0 稳定性承诺。

## generate(options)

同步生成文件，成功返回结果对象；失败抛出 Error 或底层文件／模板异常。

```js
const { generate } = require('vela-wear-m3')
const result = generate({
  input: 'template', output: 'src', device: 'round', animation: 'basic'
})
// { device: 'round', animation: 'basic', output: '<绝对路径>', images: <数量> }
```

| 选项 | 类型 | 默认值 | 含义 |
|---|---|---|---|
| `input` | string | `'template'` | 源目录，相对路径从当前工作目录解析 |
| `output` | string | `'src'` | 输出目录，同样从当前工作目录解析 |
| `device` | string | `'round'` | `round` / `pro` / `band10` / `band9` |
| `animation` | string | `'basic'` | `basic` / `enhanced`；模板上下文对应 API 1 / API 2 |
| `replace` | boolean | `false` | 仅 JS API 提供；严格等于 `true` 时允许替换未标记的非空输出目录 |

### 覆盖行为与信任边界

**不要把手写文件放在输出目录**。空目录可以使用；非空目录默认需要包含 `.vela-wear-m3-output.json` 标记。存在标记，或显式传 `replace: true` 时，整个输出目录会被删除重建，而不只是覆盖同名文件。标记仅判断是否存在，不校验其中内容。

生成器拒绝文件系统根目录、包含输入目录的输出目录，以及位于安装库内部的输出目录。这些检查不替代调用者的路径确认；请使用独立目录，不使用符号链接作为输入／输出边界。`replace` 不是沙箱或数据备份机制，CLI 不提供这个开关。

模板表达式通过 JavaScript `Function` 在构建进程中执行，**只编译可信模板和绑定**。模板生成可能在写入部分结果之后失败；修复源文件再重新生成，不将失败目录视为可用产物。

### 返回值

| 字段 | 类型 | 含义 |
|---|---|---|
| `device` | string | 本次布局配置名 |
| `animation` | string | 本次动画配置名 |
| `output` | string | 输出绝对路径 |
| `images` | number | 从生成文本的 `/common/img/*.png` 引用中去重后复制的图片数；不含 logo 与许可文件 |

输入中的普通文件会复制到输出；`.ux.tpl` 转为 `.ux`，`manifest.tpl.json` 转为 `manifest.json`。顶层 `partials` 作为片段目录不直接输出。生成器按实际引用复制库图片，并在 `common/legal/vela-wear-m3/` 放置许可材料。

常见异常包括 `Unknown device`、非法动画配置、`Unsafe output directory`、`Output is not owned by this generator`、越界 include、未知组件、绑定缺失、资源缺失、条件指令不平衡，以及 JSON／表达式语法和文件读取错误。错误文本不是稳定的机器错误码。

## componentSource(name, bindings)

```js
const { componentSource } = require('vela-wear-m3')
const markup = componentSource('button', {
  id: "'save'", label: "'保存'", variant: "'bf'", ink: "'c-onPri'",
  icon: "'/common/img/star_primary_24.png'", onClick: 'save'
})
```

| 参数 | 类型 | 默认值 | 含义 |
|---|---|---|---|
| `name` | string | 无 | 注册表中的组件名 |
| `bindings` | object | `{}` | 覆盖该模板默认绑定的键值；被占位符使用的值必须是 string |

返回 **string**：读取模板、合并默认绑定并替换 `@{key}` 后的标记。未知组件抛出 `Unknown component`；缺失或非字符串的占位符值抛出 `Missing string binding`。没有占位符的模板不因缺少运行时状态而报错。

该函数**不**生成样式、逻辑或图片，也不展开条件编译和 `$[expr]`。返回内容应交给 `generate()` 所处理的模板，而不是当成完整的独立 UX 页面。它不会替你校验消费页面的方法是否存在。

绑定按模板具体位置解释：Button 的 `label: "'保存'"` 是字符串常量表达式，`label: 'saveLabel'` 是运行时字段表达式；`onClick: 'save'` 是方法名。Card 的 `content` 和 TLC 的 `content` 是可信标记子树，不是运行时 slot；Card 的 `id` 是静态属性文字。各项见[组件指南](COMPONENTS.md)。

## components / devices

```js
const { components, devices } = require('vela-wear-m3')
console.log(Object.keys(components))
console.log(devices.band10.W, devices.band10.H)
```

`components` 是 `components/registry.json` 的对象：键为组件名，值含 `template`（包内模板路径）、`defaults`（默认绑定对象）、`styles`（登记的样式片段数组）。空 `styles` **不表示组件无需样式**，有些几何样式由构建上下文生成；以组件指南为准。共 23 个注册模板。

`devices` 是布局配置对象，各项字段包含 `name`（描述文字）、`W`、`H`（物理像素）、`shape`（`circle` / `rect` / `pill`）和 `k`（每 dp 的像素数）。这不是运行时设备探测或兼容机型表。

| 键 | W × H | shape | k |
|---|---|---|---|
| round | 466 × 466 | circle | 2 |
| pro | 336 × 480 | rect | 2 |
| band10 | 212 × 520 | pill | 1.625 |
| band9 | 192 × 490 | pill | 1.625 |

两个导出当前均为共享对象，没有冻结。调用方应只读使用；修改它们会影响同一进程中的后续生成，不是受支持的主题或设备扩展 API。

## 命令行

```sh
npx vela-wear-m3 --help
npx vela-wear-m3 gen --input template --out src --device band10 --animation enhanced
```

| 参数 | 默认值 | 对应 JS 选项 |
|---|---|---|
| `--input <目录>` | template | input |
| `--out <目录>` | src | output |
| `--device <名称>` | round | device |
| `--animation <名称>` | basic | animation |

成功向 stdout 打印生成结果 JSON，退出码 0；生成异常向 stderr 打印消息，退出码 1。单独 `--help` 打印用法并退出 0；无命令或不受支持的子命令打印用法并退出 1。帮助用上述独立形式，不使用 `gen --help`。不支持 `--key=value`、CLI `--replace` 或额外子命令；当前解析器不严格拒绝所有未知参数，请按列出的形式使用。

## 模板语法

指令占据单独一行，使用 HTML、CSS 或 JS 注释包装。模板文件为 UTF-8；脚本片段插入位置必须符合 Vela 页面的语法。

```html
<!-- #component button {"id":"'save'","label":"'保存'","variant":"'bf'","ink":"'c-onPri'","icon":"saveIcon","onClick":"save"} -->
<!-- #include local-fragment.tpl -->
<!-- #include @wear/timetext.tpl -->
<!-- #if round -->
<text class="title">圆屏</text>
<!-- #elif pill -->
<text class="title">手环</text>
<!-- #else -->
<text class="title">矩形屏</text>
<!-- #endif -->
```

- `#component <name> <JSON>`：合并默认绑定、展开组件，再处理其中指令。JSON 值仍是编译期字符串，不会自动转换成运行时 props。
- `#include <路径>`：普通路径以消费项目的 `input/partials/` 为基准；`@wear/` 指向库内 `components/shared/`，`@wear/runtime/...` 指向包内 runtime。路径不能越出各自基准目录，不是相对当前片段解析。
- `#if` / `#elif` / `#else` / `#endif`：按生成上下文执行 JavaScript 条件，必须配对。
- `#set name = expression`：修改当前文件的生成上下文；不作为跨页面或跨文件的全局配置接口。
- `$(16)` → 按 `k` 换算并取整的 `px` 文本；支持非负整数及小数。
- `$[expression]` → 计算后转为文本。常用上下文有 `W`、`H`、`k`、`dp(n)`、`round`、`pill`、`rect`、`enhanced`、`api`、颜色 `C` 和几何辅助函数。辅助函数依具体模板而定，不把全部内部上下文视为稳定公共 API。
- `{{value}}` 保留给 Vela 运行时处理，不由构建表达式替代。

例如：

```css
/* #include @wear/m3.css */
/* #set gap = dp(8) */
.example { width:$[W]px; height:$(48); margin-top:$[gap]px; }
```

## 页面与控制器

完整基础结构见库内 `examples/minimal/template/`。生成器自动从实际列表结构提取布局，业务页调用 `setLayout([])`；不要另建高度表。

基础控制器提供 `press(id)`、`release(id)`、`cancelPress()`、`animateControl(id,target,initial,stiffness)`、`hold(id,callback,every=120)`、`later(fn,ms)`、返回处理及时钟／滚动调度。可选扩展点 `pressSpring(id)`（返回 `[kIn,kOut]` 时该 id 用临界阻尼精确解）与 `pressStyle(id,p)`（返回按压进度 p∈[0,1] 对应的样式，代替默认透明度反馈）。它们依赖 `base_head.js`、`base_data.js`、`base.js`，不是可脱离页面任意实例化的服务。

`pageShow`、`pageHide`、`pageDestroy`、`onMotionFrame`、`stopLevel` 等名称是组合扩展点（`stopLevel` 由 range 组合提供，基础 `cleanup()` 会调用它）。多个控制器同时使用时须人工合并调用，不要让后一个同名方法覆盖前一个。基础 `onHide`／`onDestroy` 必须保留清理路径；具体组合、状态字段和组件用例见[组件指南](COMPONENTS.md)。

## Stepper / LevelIndicator（range 组合）

| 名称 | 说明 |
|---|---|
| `updateRange(snap)` | 让层级指示器跟随 `stepValue`（0–10）与 `stepEnabled`。`snap` 为真或首次显示时直接到位；目标未变只重绘；否则 tween 500 ms、CubicBezier(0,0,0,1)，从当前动画位置重新开始（不继承速度），33 ms 定时器。 |
| `stopLevel()` | 停止层级动画定时器；`cleanup()` 自动调用。 |
| `rangePress(id)` / `rangeRelease(id)` / `stepClick(id)` | `id` 为 `'plus'` / `'minus'`。按下后 500 ms 开始每 60 ms 重复；发生重复后抬手的 click 不再步进。 |
| `stepUp()` / `stepDown()` / `toggleStepEnabled()` | 单步（越界忽略）与禁用切换。 |
| `levelFill` | 当前绘制的填充比例 0–1（只读，供调试 / 测试）。 |
| `lvIndSrc` / `lvTrkSrc` / `lvInd` / `lvTrk` / `lvDotInd` / `lvDotTrk` | `level-indicator` 片段绑定的图片与样式；由 `paintLevel(f)` 写入，业务不要直接改。 |

几何（`animations.json` → `<device>.level`）：`cx`/`cy` 屏幕中心，`r` 弧半径 px，`o` 描边半宽 px，`start`/`sweep`/`gap` 为角度（ScrollIndicator.kt：sweep = 2·asin(h/2/Ru) + gap，gap = 2·asin(4.5 dp/Ru)，Ru = W/2−2 dp），`ind`/`trk`/`indDis`/`trkDis`/`maskLow`/`maskHigh` 为 `{src,x,y,w,h}`。

