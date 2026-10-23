# 0.1 组件绑定与状态契约

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

TimeText 使用公共时间状态，默认分钟边界更新；用 onTick 扩展秒级展示时需用 clockSecondsVisible 限制可见范围。Pro 默认直排，round / band 使用 Arc。独立 Arc 可调用生成上下文的 arcTemplate(false/true)，绑定 clockGlyphs / statusGlyphs。字形度量来自随包资产记录，不可替换 PNG 却保留旧度量。

ScrollIndicator 使用 siVisible / siSt / siSrc，由 setLayout 和共享滚动调度器更新；不可滚动时隐藏。TLC 列表消费项 items 需有 id / st，tlcBase 在派生布局中自动定位 items 的重复行，tlcOn 控制启停。每项外壳使用 transforming-list-item，参数 style 为当前项样式表达式，content 为可信 Vela 子树。

进度引入 progress.head.js、progress.data.js、progress.methods.js、motion.css。kind 是 ring / ringThin / ringLarge / indeterminate / seg / segBinary / arcLoading / linear / linearThick / overflow / arc；pct 通常 0–100，overflow 允许超过 100。paintProgress 立即提交；setProgress 动画变化；updateLoading 控制当前可见播放器。模板中的 list-item type=progress 与控制器 rowBounds('progress') 对应，不可改名却不改控制器。显示、隐藏与滚动钩子由控制器管理，禁止额外自动播放循环。

## 对话框与确认层

alert-dialog 默认消费 dlgOn / dlgOut / pressId，并调用 dlgCancel / dlgOk；消费端负责打开和关闭逻辑。模板初始文案是示例文字，使用方可通过 componentSource 的结果组合或提供自己的标题/正文模板；其结构、几何和触控区来自库。

confirmation 使用 cfOn / cfOut / cfBlobOn / cfIconOn / cfTextOn，模块变量 cfTimer / confirmEpoch；增强版还需 checkFrames。引入 confirm.js、confirm.css、overlay.css，调用 showConfirm / hideConfirm / clearConfirm。默认 4 秒结束；关闭、重入和隐藏必须通过这些入口，不能另建不带代次检查的延迟回调。

edge-button 使用 ebSt、通用按压方法与 showConfirm 回调。应用不需要确认层时可绑定自己的事件处理；保持边缘几何与底部列表留白规则。任何同页组合须在消费方合并重名扩展钩子，0.1 不提供自动 mixin 冲突合并。
