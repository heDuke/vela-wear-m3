# 组件指南 · 0.1.0

[从零接入](GETTING-STARTED.md) · [生成器 API 与模板语法](API.md)

以下先说明共享契约，再列出全部 20 个注册模板的最小插入用例。用例是插入页面的片段，必须同时准备所列状态、样式和脚本；单独粘贴一行标记不等于完整页面。基础页面可从库内 GPL 最小示例复制。

所有组件是编译期模板，不是 Vela 自定义组件实例。一个页面只展开一份共享状态和调度器。`components/registry.json` 给出模板及必需样式；`componentSource()` 只展开标记绑定，完整条件编译、dp、资源和布局处理由 `generate()` 完成。

## 公共页面控制器

`base_head.js` 声明模块级计时器、滚动和动作状态，并导入系统 router / vibrator 与 `../../common/m3.js`。因此消费模板需有 `common/m3.js` 引用 `@wear/runtime/m3.js.tpl`，页面位于 `pages/<name>/<name>.ux.tpl`。manifest 需声明 system.router / system.vibrator；不需要振动时由消费方替换 `vib` 方法适配器。

`base_data.js` 放在 private 对象内；`base.js` 放在页面方法对象内。private 至少再提供 `tlcBase:-1`，业务页在 onInit 调用 `setLayout([])`。`pageShow` / `pageHide` / `pageDestroy` 为扩展钩子，`onMotionFrame(id,position)` 接收动作更新；多个控制器共用一个页面时必须合并同名钩子。不要让业务方法覆盖 `cleanup` 或遗失基础 onHide/onDestroy。

`press(id)` / `release(id)` / `cancelPress()`、`animateControl(id,target,initial)` 和 `hold(id,callback)` 共享动作调度器。业务 disabled 状态需在触发前拒绝，Switch 和 Stepper 控制器已处理；取消后抬手不会重新触发。使用者声明所有会在模板读取的反馈键，或在 `setLayout` 后通过赋予完整 feedback 对象增加键。

## 按钮与卡片

`button` 参数：id / label / variant / ink / icon 为运行期表达式字符串，onClick 为方法或调用表达式。variant 是样式类（bf / bt / bo / bc / bpc / bd），ink 是文字类（c-onPri / c-onS / c-pri / c-dis）。禁用按钮用 bd，并由消费端阻止事件；常规按钮的图标可传已有图片 URI。

`icon-button` 同样接收 id / variant / icon / label / onClick。`compact-button`、`button-morph` 和 `icon-button-morph` 使用固定绑定状态：引入 buttons.head.js、buttons.timer.js、buttons.data.js 和 buttons.methods.js，提供点击 `tap(label)`。按压方法和 onMotionFrame 已由该控制器实现。按钮额外形变和播放暂停过渡保留适配标记，不能把它们都称作官方默认。

`card` 的 id 是编译期控件标识文字，variant 是 `card cs` 或 `card co`，content 是消费方可信 Vela 标记。该字段没有运行时 slot；卡片中的内容字体、行数与 AppCard 元信息由消费页面组合。卡片反馈调用通用 press / release / vib。

## 选择与数值

Switch / Checkbox / Radio / InlineSlider 页引入 selection.head.js（已包含 range.head.js）、selection.data.js（已包含 range.data.js）、selection.methods.js、range.js；样式为 toggles.css / range.css。Switch 接收 item / index 表达式，所有四种组合由 `variants(kind)` 创建：kind 0–3 为行首图标无/有 × 滑块状态图标无/有。每个数组项包含 id、checked、disabled、leading、tick、label、caption、position、src；使用 toggleSwitch(index)，切换页面前 stopSwitches。

Checkbox：bt、checkSrc，方法 tBt；Radio：sel、radios（id / label / st），方法 pick(index)。InlineSlider：lvl 0–5、sliderMode 0/1/2 对应连续/分段/变色、sliderStyle、separators，调用 updateSlider / dec / inc。首版控制器使用这些既定范围；扩展范围需同步控制器与资源映射，不能只改展示数字。

Stepper / LevelIndicator 可以独立使用 range.head.js、range.data.js、range.js 和 range.css。stepValue 为整数 0–10；stepEnabled 控制禁用。层级值由 updateRange 映射到 LEVELS / DISABLED_LEVELS，与列表滚动无关。使用 openStepper / openLevel 进入演示；长按来自 rangePress / rangeRelease / stepClick；最小最大值不可越界。range.tpl 是全屏结构，level-indicator 则可作为单独图形组件使用。

## 分页、时间与进度

分页引入 pager.head.js、pager.data.js、pager.methods.js、pager.css，使用 page-indicator 模板。pageIndex 从 0 起，pageCount 至少 1；横纵模式由 demoMode 的 hpager / vpager 指定，调用 updatePages 刷新。修改 pageCount 后需夹紧索引并重置 pageWindow。页面隐藏清理 pagerTimer；分页触摸区自行消费返回方向手势，拖动超过 25% 才提交，首末页夹紧。

TimeText 使用公共时间状态，默认分钟边界更新；用 onTick 扩展秒级展示时需用 clockSecondsVisible 限制可见范围。Pro 默认直排，round / band 使用 Arc。独立 Arc 可调用生成上下文的 arcTemplate(false/true)，绑定 clockGlyphs / statusGlyphs。字形度量来自随包资产记录，不可替换 PNG 却保留旧度量。Arc 遵守 Wear M3 MaxSweepAngle 70° 与 edgePadding 2dp；状态+分隔符+时间放不下时整段丢弃状态（保留时间），不做逐字截断。Gallery 中 `.arc-row` / `.arc-panel` 为短行内高度（字形行高+边距），弧字绝对定位且 transformOrigin 仍指向表盘圆心；全页顶栏 TimeText 叠层不受影响。TimeText 不绘制实心背景底板（无弧形黑底、无黑色胶囊）；按 Wear M3 行为，页面顶部叠一张 `top_scrim.png` 渐隐遮罩（列表之上、时间字形之下），内容滚到时间下方时渐隐。遮罩由 `tools/top-scrim.py` 按设备生成（Vela 未声明 CSS 渐变支持）：时间字形区上 75% 实黑，向下 smoothstep 渐隐至字形底 +10dp；图片会吞掉该条带内的触摸，因此只覆盖顶部窄条。

ScrollIndicator 使用 siVisible / siSt / siSrc，由 setLayout 和共享滚动调度器更新；不可滚动时隐藏。TLC 列表消费项 items 需有 id / st，tlcBase 在派生布局中自动定位 items 的重复行，tlcOn 控制启停。每项外壳使用 transforming-list-item，参数 style 为当前项样式表达式，content 为可信 Vela 子树。

进度引入 progress.head.js、progress.data.js、progress.methods.js、motion.css。kind 是 ring / ringThin / ringLarge / indeterminate / seg / segBinary / arcLoading / linear / linearThick / overflow / arc；pct 通常 0–100，overflow 允许超过 100。paintProgress 立即提交；setProgress 动画变化；updateLoading 控制当前可见播放器。模板中的 list-item type=progress 与控制器 rowBounds('progress') 对应，不可改名却不改控制器。显示、隐藏与滚动钩子由控制器管理，禁止额外自动播放循环。

## 对话框与确认层

alert-dialog 默认消费 dlgOn / dlgOut / pressId，并调用 dlgCancel / dlgOk；消费端负责打开和关闭逻辑。模板初始文案是示例文字，使用方可通过 componentSource 的结果组合或提供自己的标题/正文模板；其结构、几何和触控区来自库。

confirmation 使用 cfOn / cfOut / cfBlobOn / cfIconOn / cfTextOn，模块变量 cfTimer / confirmEpoch；增强版还需 checkFrames。引入 confirm.js、confirm.css、overlay.css，调用 showConfirm / hideConfirm / clearConfirm。默认 4 秒结束；关闭、重入和隐藏必须通过这些入口，不能另建不带代次检查的延迟回调。

edge-button 使用 ebSt、通用按压方法与 showConfirm 回调。应用不需要确认层时可绑定自己的事件处理；保持边缘几何与底部列表留白规则。任何同页组合须在消费方合并重名扩展钩子，0.1 不提供自动 mixin 冲突合并。

## 基础页面与依赖的插入位置

所有用例共同依赖以下结构；页面位于 `pages/<name>/<name>.ux.tpl`，项目同时保留最小示例的 app、manifest 和 `common/m3.js`：

```html
<template>
<div class="page">
  <list class="lst" onscroll="onScroll">
    <list-item type="padt" class="li-padt"></list-item>
    <list-item type="example" class="li-56">
      <!-- 在这里插入普通列表组件；全屏／覆盖层放在 list 外 -->
    </list-item>
  </list>
</div>
</template>
<style>
/* #include @wear/m3.css */
/* 在这里引入组件 CSS 或插入生成几何 */
</style>
<script>
// #include @wear/base_head.js
// 组件 head、模块计时器放在这里
export default {
  private:{
// #include @wear/base_data.js
    tlcBase:-1,isHome:true,label:'保存',icon:'/common/img/star_primary_24.png'
    // 组件 data 片段放在这里；注意属性间逗号
  },
  onInit(){this.setLayout([])},
  save(){this.vib()},
  // 组件 methods 与业务回调放在这里
// #include @wear/base.js
}
</script>
```

组件 `id` 应在同页唯一。所有被模板读取的字段应预先在 private 中声明；禁用、事件和业务数据由页面维护。基础状态含滚动、时间与按压字段，不代替组件专属 data。

### 控制器组合清单

| 组合 | CSS / 几何 | 模块级片段 | private 片段 | 方法片段 / 初始化 |
|---|---|---|---|---|
| 普通按钮、卡片 | `buttons.css` / `cards.css` | 基础 head | 基础 data + 业务字段 | 基础方法 + 点击回调 |
| 形变按钮族 | `buttons.css` | `buttons.head.js`、`buttons.timer.js` | `buttons.data.js` | `buttons.methods.js`，另提供 `tap(label)` |
| 选择与 Slider | `toggles.css`、`range.css` | `selection.head.js`（已含 range head） | `selection.data.js`（已含 range data） | `selection.methods.js`、`range.js`；onInit 调用 `updateSlider()`、`updateRange()` |
| Stepper / Level | `range.css` | `range.head.js` | `range.data.js` | `range.js`；onInit 调用 `updateRange()` |
| 分页 | `pager.css` | `pager.head.js` | `pager.data.js`，模块另导入 pageDots / pagerState | `pager.methods.js`；打开演示或调用 `updatePages()` |
| 进度 | `motion.css` | `progress.head.js`，模块另导入 progressImage | `progress.data.js` | `progress.methods.js`；onInit 调用 `paintProgress(50)` |
| 时间 / Scroll / TLC | `m3.css` 已含基础几何 | 基础 head | 基础 data，TLC 另提供 items | 基础方法与 `setLayout([])` |
| Confirmation | `overlay.css`、`confirm.css` | 业务声明 cfTimer / confirmEpoch | 下文列出的 cf 状态与增强帧 | `confirm.js` |
| AlertDialog | `overlay.css`、`$[dlgCss()]` | 基础 head | dlgOn / dlgOut | 业务开关与取消／确认回调 |
| EdgeButton | `edge.css`（已含 ebCss） | 基础 head | 业务声明 ebSt:{} | 默认调用业务 `showConfirm()` |

上表中的片段全部通过 `@wear/` 引入。控制器方法结尾通常带逗号，按 JS 对象成员插入。`head` 和计时器不放入 private；`data` 不放入模块作用域。

### 多控制器同页

例如形变按钮和选择控件都定义 `onMotionFrame`、`pageHide`。不能连续 include 两份 methods 然后期待自动合并。应在消费模板的本地片段中组合两者的分支和清理逻辑；不要修改安装包内文件。类似地，基础 `onHide`、`onDestroy` 应保持，业务使用 `pageHide`、`pageDestroy` 扩展。

本版本没有自动 mixin 或多实例命名空间。首次接入建议每页先使用一个控制器组合；需要组合时逐项检查同名方法、模块变量和 private 字段。

## 全部模板与最小用例

### button

```html
<!-- #component button {"id":"'save'","label":"label","variant":"'bf'","ink":"'c-onPri'","icon":"icon","onClick":"save"} -->
```

参数全部为字符串，默认分别为 `$item.id`、`$item.label`、`$item.cls`、`$item.ink`、`$item.icon`、`onButtonClick`。`bf` Filled、`bt` Tonal、`bo` Outlined、`bc` Child、`bpc` 项目颜色变体、`bd` Disabled；选择匹配的文字颜色类。依赖 buttons.css 与基础控制器。`bd` 只控制外观，消费端回调仍必须拒绝禁用操作。基础反馈两种 API 均可用。

### icon-button

```html
<!-- #component icon-button {"id":"'star'","variant":"'bf'","icon":"icon","label":"'收藏'","onClick":"save"} -->
```

默认 id / variant / icon / label / onClick 为 `$item.id` / `$item.cls` / `$item.icon` / `$item.name` / `onButtonClick`。依赖 buttons.css、基础控制器和匹配的图标图片；当前模板未使用 label 参数，不显示标签，也不创建额外的无障碍 API。颜色类可用 `bf`、`bt`、`bo`、`bd`；禁用业务由回调拦截。这里是静态容器，不包含形变播放器。

### compact-button

```html
<!-- #component compact-button {} -->
```

无可替换占位参数。使用形变按钮族组合，固定读 `compactSrc`、调用 `press('compact')`／`release('compact')`／`tap('添加')`。当前文字为“添加”，可在消费模板组合自己的标记。可见高度 32dp、触控区至少 48dp；额外形变是项目适配，basic 端点切换、enhanced 补中间帧。

### button-morph

```html
<!-- #component button-morph {} -->
```

无占位参数。使用形变按钮族组合，读 `buttonMorphStatic`，调用 `buttonMorphPress`／`buttonMorphRelease`；模板只演示按压形变，没有业务 onclick。文字固定“按住体验”。basic 为端点变化，enhanced 使用中间资源帧。

### icon-button-morph

```html
<!-- #component icon-button-morph {} -->
```

无占位参数。使用形变按钮族组合，读 `morphStatic`、`playSrc`，调用 `morphPress`／`morphRelease`／`togglePlaying`。播放／暂停过渡为项目适配；该状态过渡使用逐帧状态更新，容器中间形变帧由 enhanced 提供。页面隐藏要停止 playTimer 并恢复容器。

### card

```html
<!-- #component card {"id":"info","variant":"card cs","content":"<text class=\"t-titleM c-on\">提示</text>"} -->
```

id / variant / content 均必须提供字符串；没有默认值。`id` 是静态标记文字，`variant` 是静态类串，`content` 是可信 Vela 标记。使用 cards.css、基础按压控制器，点击固定调用基础 `vib()`，不是通用 onClick 参数。`card cs` 为填充，`card co` 为描边。标题、AppCard 元信息等由内容子树组合，两种 API 均可用。

### switch-button

```html
<div class="switch-list" for="{{switches}}">
<!-- #component switch-button {"item":"$item","index":"$idx"} -->
</div>
```

使用选择与 Slider 组合。item / index 默认 `$item` / `$idx`；item 字段见上文。`variants(0..3)` 分别是无前置图标无状态图标、无前置有状态、有前置无状态、有前置有状态，包含开启／关闭／禁用两态。调用 `toggleSwitch(index)`，禁用直接返回；反向切换从当前 position 接续。无滑块状态图标属于项目适配变体。两种 API 共享静态几何和当前状态过渡资源。

### checkbox-button

```html
<!-- #component checkbox-button {} -->
```

无占位参数。选择组合提供 bt（boolean）、checkSrc 和 `tBt()`；固定文案、图标与点击结构来自模板。默认勾选，8 帧位置映射，隐藏时停止 checkTimer。不提供独立 disabled 绑定；需要禁用时消费方同时控制外观与事件。

### radio-button

```html
<div class="radio-list" for="{{radios}}">
<!-- #component radio-button {"item":"$item","index":"$idx"} -->
</div>
```

选择组合提供 sel、radios 和 `pick(index)`；item / index 默认 `$item` / `$idx`，每项含 id、label、st。使用共享状态动画更新选中点透明度与缩放；无单独 disabled 参数，需业务适配。

### inline-slider

```html
<!-- #component inline-slider {} -->
```

无占位参数。选择组合提供 lvl（0–5）、sliderMode（0 连续／1 分段／2 变色）、sliderStyle、separators，以及 `dec()`、`inc()`、`nextSlider()`。初始化 `updateSlider()`；到边界不增减。窄屏轨道独占一行属于项目适配。它不是任意 min/max/step 的通用 Slider；两种 API 的几何一致。

### stepper

```html
<!-- 放在 list 外，业务通过 openStepper() 进入 -->
<!-- #component stepper {} -->
```

无占位参数。独立 range 组合，demoMode 初始空串；`openStepper()` 设为 stepper，`openLevel()` 设为 level，两者当前复用同一全屏结构。stepValue 为 0–10 整数，stepEnabled 为 boolean；调用 `stepClick('plus'/'minus')` 或长按入口。`toggleStepEnabled()` 切换禁用；手势与基础返回处理退出 demoMode。圆屏无导航头部，其余布局含返回。两种 API 均可用。

### level-indicator

```html
<!-- #component level-indicator {} -->
```

无占位参数。range 组合提供 levelSrc，调用 `updateRange()` 将 stepValue 与禁用态映射成图片。可以不使用全屏 stepper，只在你自己的数值布局中插入图形；外层仍须提供布局空间。圆屏弧形，其他配置直条；不是滚动条，两种 API 均可用。

### page-indicator

```html
<!-- 放在 list 外，业务通过 openHorizontalPager() 进入 -->
<!-- #component page-indicator {} -->
```

无占位参数；模块需另加 `import { pageDots, pagerState } from '../../common/m3.js'`。当前模板是包含示例内容的完整分页演示，不是仅一排圆点。pager 组合负责 pageIndex（从 0 起）、pageCount（至少 1）、dots、worm、窗口与内容过渡字段。横向调用 openHorizontalPager，纵向调用 openVerticalPager；改页数后夹紧索引、重置 pageWindow 并 updatePages。最多六点窗口，拖动达到 25% 提交，区域内分页优先；隐藏清理 pagerTimer。两种 API 均可用。

### time-text

```html
<!-- 放在 list 外，作为页面顶部时间 -->
<!-- #component time-text {} -->
```

无占位参数。基础状态与时钟提供 tt0–tt4 和顶部字形数据；Pro 直排、round / band Arc。分钟更新，不应另建每秒循环。组件示例 Arc 可在 list-item 内放 `<div class="arc-panel">$[arcTemplate(false)]</div>`；true 版本带状态，使用 clockGlyphs / statusGlyphs。两个 API 均可用；普通字体仍依设备系统。

### scroll-indicator

```html
<!-- 放在 list 外 -->
<!-- #component scroll-indicator {} -->
```

无占位参数。基础 setLayout、onScroll 调度负责 siVisible、siSt、siSrc；thumb 长度取内容和视口比例，不可滚动时隐藏。列表必须保留明确高度和 onscroll，不能手写第二份高度表。圆屏弧形、其他直条；两种 API 均可用。

### transforming-list-item

```html
<list-item type="tlc" class="li-56" for="{{items}}">
<!-- #component transforming-list-item {"style":"$item.st","content":"<text class=\"t-labelM c-on\">{{$item.label}}</text>"} -->
</list-item>
```

style 默认 `$item.st`；content 必须提供可信标记字符串。基础状态另声明 `items:[{id:'one',label:'一',st:{}}]`、`tlcOn:true`、`tlcBase:-1`。生成布局识别 items 重复项；基础 onScroll 更新可见项的样式。相同 type 的 list-item 需相同结构，两种 API 均可用。

### progress-indicator

```html
<!-- 直接放在 list 内：模板本身已包含 list-item -->
<!-- #component progress-indicator {} -->
```

无占位参数。模块另加 `import { progressImage } from '../../common/m3.js'`。progress 组合要求列表 `id="motionList"`，并保留 type="progress" 供 rowBounds 定位。kind 为 ring、ringThin、ringLarge、indeterminate、seg、segBinary、arcLoading、linear、linearThick、overflow、arc；kindIndex 与 kindLabel 应同步。`setProgress(v)` 触发过渡，`paintProgress(v)` 直接提交，常规值传 0–100，overflow 可传 150。`nextKind()` 切换类型，`toggleAuto()` 开关演示。

滚动／显示钩子负责可见播放；离开页面停止计时器。API 1 弧形加载采用降级，API 2 显式启动 image-animator；部分确定局部弧为项目适配。具体资源采样不是通用 Canvas API。

### alert-dialog

```html
<!-- 放在 list 外 -->
<!-- #component alert-dialog {} -->
```

无占位参数。overlay.css 加 `$[dlgCss()]`；private 声明 `dlgOn:false,dlgOut:false`。业务打开时设 dlgOn，`dlgCancel()`／`dlgOk()` 中完成业务并关闭；退出设 dlgOut，200ms 后撤去 dlgOn 并恢复 dlgOut。overlayBack 优先处理弹层。文案来自固定模板，需要改变时由消费方组合标记，不存在 title/message props。两种 API 均可用。

### confirmation

```html
<!-- 放在 list 外 -->
<!-- #component confirmation {} -->
```

无占位参数。overlay.css、confirm.css、confirm.js；模块声明 `let cfTimer=null,confirmEpoch=0`，private 声明 cfOn / cfOut 为 false；cfBlobOn / cfIconOn / cfTextOn 已由基础 data 提供。enhanced 时额外提供 `checkFrames:$[frames('check')]`（用 #if enhanced 包围）。

调用 showConfirm；4 秒后自动进入退出，hideConfirm 退出、clearConfirm 立即清理。基础 cleanup 会调用 clearConfirm。容器、图标、文字分阶段，重入有代次检查；basic 对勾淡入，enhanced 使用描画帧。右滑关闭需业务 overlayBack 在 cfOn 时调用 hideConfirm 并返回 true。

### edge-button

```html
<!-- 放在 list 外；列表底部留出 EBH 对应空间 -->
<!-- #component edge-button {} -->
```

无占位参数。edge.css（已含 ebCss）、业务 ebSt（初始可为 `{}`）／基础按压方法；业务须提供 showConfirm（可作为自己的回调适配器，不必实际启用确认层）。模板固定对勾图标。列表留白与 scrim 可参照库的 ebCss / EBH / EBPAD，避免末项被覆盖；两种 API 均可用。

## 常见接入问题

- **只显示静态图，没有状态变化**：确认 head／data／methods 都已引入，且业务状态已声明；确认没有覆盖 onMotionFrame。
- **返回或退出后仍播放**：保留基础清理，并合并组件 pageHide／pageDestroy；播放器显式 stop，不能仅隐藏图片。
- **生成成功但运行时报字段不存在**：生成器不检查运行时字段；按本页契约检查 private、回调和 list type。
- **想修改数值范围或固定文案**：0.1 部分模板是既定控制器结构，需要在消费端组合自己的标记与状态逻辑；不是只改一个属性就获得通用组件。
- **看见原始 `$[...]` 或 `#include`**：你可能只调用了 componentSource，或没有对消费模板执行 generate。
