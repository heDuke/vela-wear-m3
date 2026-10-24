# Wear OS Material 3（Expressive）→ Xiaomi Vela JS 快应用：规范采集与可行性映射（即时记事）

> 调研时间：2026-10-22（Asia/Shanghai，UTC+8）。
> **原则**：令牌数值只取自官方来源（androidx 源码 / developer.android.com / m3.material.io），不编造。凡是推导值、自拟建议或未经真机验证的内容，一律标注 **【推导】【自拟】【未验证】**。
> Vela 能力依据：`/workspace/xiaomi-vela-docs`（下文简写为 `01/…` 表示 `01-official-quickapp-js/…`，`04/…` 表示 `04-community/…`），以及 `/workspace/vela-notes/VELA_DEV_SPEC.md`（简写 SPEC §x）。

## 0. 来源

| 代号 | 来源 | 说明 |
|---|---|---|
| **SRC** | androidx/androidx `androidx-main` @ `2f557dc1f1ec71edae73e2c16b0e446523c644b7`，目录 `wear/compose/compose-material3/src/main/java/androidx/wear/compose/material3/` | 令牌的权威数值。链接前缀：`https://github.com/androidx/androidx/blob/2f557dc1f1ec71edae73e2c16b0e446523c644b7/wear/compose/compose-material3/src/main/java/androidx/wear/compose/material3/`（下文写作 `SRC/<文件>`） |
| REL | https://developer.android.com/jetpack/androidx/releases/wear-compose-m3 | 1.5.0 稳定版，发布于 2025-08-27；组件清单 |
| API | https://developer.android.com/reference/kotlin/androidx/wear/compose/material3/package-summary （例如 [EdgeButton](https://developer.android.com/reference/kotlin/androidx/wear/compose/material3/EdgeButton.composable)、[EdgeButtonSize](https://developer.android.com/reference/kotlin/androidx/wear/compose/material3/EdgeButtonSize)） | API 语义 |
| LIST | https://developer.android.com/training/wearables/compose/lists | TransformingLazyColumn 的用法；EdgeButton 要放进 ScreenScaffold 的 edgeButton 插槽 |
| SIZE | https://developer.android.com/design/ui/wear/guides/foundations/screen-sizes | 先按 192dp 小屏设计；外边距用百分比；225dp 为大小屏断点 |
| TYPE | https://developer.android.com/design/ui/wear/guides/styles/typography | 字体角色：display / title / label / body / arc / numeral，以及可变字体轴 |
| LAYOUT | https://developer.android.com/design/ui/wear/guides/m2-5/surfaces/apps-layouts 、 https://developer.android.com/design/ui/wear/guides/m2-5/foundations/adaptive-layouts | 外边距用百分比、元素间距用固定 dp（M2.5 页面，原则在 M3 中沿用） |
| BLOG | https://android-developers.googleblog.com/2025/08/introducing-material-3-expressive-for-wear-os.html | M3 Expressive 介绍（可变字体、动态配色） |
| M3T | https://m3.material.io/styles/typography | 手机版 M3 的字体说明，提到 Google Sans Flex / Roboto Flex |

---

## 1. Wear M3 令牌采集（数值全部来自 SRC）

### 1.1 默认深色配色（`ColorScheme()` 的默认值）
来源：`SRC/tokens/ColorTokens.kt`、`SRC/tokens/PaletteTokens.kt`、`SRC/ColorScheme.kt`。Wear M3 只有深色主题；背景为纯黑，正好适合 AMOLED 省电。

| 角色 | 调色板色阶 | HEX |
|---|---|---|
| background | Neutral0 | `#000000` |
| onBackground | Neutral100 | `#FFFFFF` |
| primary | Primary90 | `#E9DDFF` |
| primaryDim | Primary80 | `#D0BCFF` |
| primaryContainer | Primary30 | `#4D3D76` |
| onPrimary | Primary10 | `#210F48` |
| onPrimaryContainer | Primary95 | `#F6EDFF` |
| secondary / secondaryDim | Secondary90 / 80 | `#DEE0FF` / `#BAC3FF` |
| secondaryContainer / onSecondary / onSecondaryContainer | Secondary30 / 10 / 95 | `#3A4376` / `#0C1649` / `#F0EFFF` |
| tertiary / tertiaryDim | Tertiary90 / 80 | `#FFDCC2` / `#FFB77A` |
| tertiaryContainer / onTertiary / onTertiaryContainer | Tertiary30 / 10 / 95 | `#6C3A03` / `#2E1500` / `#FFEEE2` |
| surfaceContainerLow | Neutral15 | `#272430` |
| surfaceContainer | Neutral20 | `#332E3C` |
| surfaceContainerHigh | Neutral30 | `#494453` |
| onSurface | Neutral95 | `#F6EDFF` |
| onSurfaceVariant | NeutralVariant80 | `#CAC4D0` |
| outline / outlineVariant | NeutralVariant60 / 40 | `#948F9A` / `#615D67` |
| error / errorDim | Error80 / 70 | `#F2B8B5` / `#EC928E` |
| errorContainer / onError / onErrorContainer | Error30 / 10 / 95 | `#8C1D18` / `#410E0B` / `#FCEEEE` |

各组件禁用态（来自 `SRC/tokens/FilledButtonTokens.kt` 等）：容器为 onSurface 叠加 **12%** 不透明度，内容为 onSurface 叠加 **38%**；OutlinedButton 禁用时边框不透明度为 **20%**；FilledButton 副标签不透明度为 **0.8**。
动态配色（跟随表盘取色）：在 REL 中有说明，但 Vela 做不到（见 §2）。

### 1.2 字体排版（`SRC/tokens/TypeScaleTokens.kt`）
单位为 sp。`wght` 是可变字体的字重轴，`wdth` 是宽度轴（%）。

| 角色 | 字号 | 行高 | 字重 | 字距 | 宽度 |
|---|---|---|---|---|---|
| displayLarge | 40 | 44 | 500 | 0.2 | 110 |
| displayMedium | 30 | 34 | 520 | 0.2 | 110 |
| displaySmall | 24 | 26 | 550 | 0.2 | 110 |
| titleLarge | 18 | 20 | 500 | 0.2 | 110 |
| titleMedium | 16 | 18 | 550 | 0.4 | 110 |
| titleSmall | 14 | 16 | 550 | 0.4 | 110 |
| labelLarge | 20 | 22 | 500 | 0.4 | 110 |
| labelMedium | 15 | 18 | 500 | 0.4 | 110 |
| labelSmall | 13 | 16 | 500 | 0.4 | 110 |
| bodyLarge | 16 | 18 | 450（加强 650） | 0.4 | 110 |
| bodyMedium | 14 | 16 | 450（加强 650） | 0.4 | 110 |
| bodySmall | 12 | 14 | 500（加强 700） | 0.4 | 110 |
| bodyExtraSmall | 10 | 12 | 500（加强 700） | 0.2 | 104 |
| arcLarge / arcMedium / arcSmall | 18 / 15 / 14 | 22 / 18 / 16 | 599 / 599 / 560 | — | 100 |
| numeralExtraLarge | 60 | 60 | 560（加强 760） | 0 | 110 |
| numeralLarge | 50 | 50 | 580（加强 780） | 0 | 110 |
| numeralMedium | 40 | 40 | 580（加强 780） | 0 | 100 |
| numeralSmall | 30 | 30 | 550（加强 750） | 0 | 100 |
| numeralExtraSmall | 24 | 24 | 550（加强 750） | 0 | 100 |

- **字体族**：在 androidx-main 的 `SRC/tokens/TypefaceTokens.kt` 中，`Brand` 和 `Plain` 都是 `DeviceFontFamilyName("roboto-flex")`。M3T 页面提到了 Google Sans Flex（可变字体，有 6 个轴），但**没有找到 Wear 官方页面写明 Wear M3 的默认字体是 Google Sans Flex** → 这一点标 **【未验证】**。这对 Vela 没有影响，因为 Vela 不支持 `font-family`（SPEC §4.5）。
- 组件对应的字体角色：Button 主标签用 labelMedium，副标签用 labelSmall；Card 标题用 titleMedium，正文用 bodyLarge，时间用 bodyMedium，副标题用 labelMedium；ListHeader 用 titleMedium；TimeText 用 arcMedium，颜色为 onBackground 把亮度调到 80（`SRC/TimeText.kt`）。

### 1.3 形状（`SRC/tokens/ShapeTokens.kt`、`SRC/Shapes.kt`）
| 令牌 | 值 | 典型用途 |
|---|---|---|
| extraSmall | 4dp | — |
| small | 8dp | — |
| medium | 18dp | CompactButton（`SRC/tokens/CompactButtonTokens.kt`） |
| large | 26dp | Button、FilledTonal、Outlined、Card、SwitchButton、Slider 的容器（高 52dp 时，26dp 圆角恰好形成胶囊形） |
| extraLarge | 36dp | — |
| full | CircleShape | IconButton |

### 1.4 组件尺寸
| 组件 | 令牌（dp） | 来源 |
|---|---|---|
| Button / FilledTonalButton / OutlinedButton | 高 **52**；圆角 large 26；水平内边距 **14**、垂直 **6**；图标 24（Filled 为 26，大图标 32，Filled 特大图标 36）；图标与文字间距 6；Outlined 边框 **1dp**，颜色 outline。配色：Filled 为 primary / onPrimary；FilledTonal 为 surfaceContainer / onSurface（图标用 primary）；Outlined 为透明底 / onSurface | `SRC/tokens/FilledButtonTokens.kt`、`FilledTonalButtonTokens.kt`、`OutlinedButtonTokens.kt`、`SRC/Button.kt`（第 1896–2029 行） |
| CompactButton | 高 **48**；圆角 medium 18；只有图标时宽 52；水平内边距 12、垂直 0；图标 20（只有图标时 24）；标签 labelSmall | `SRC/tokens/CompactButtonTokens.kt`、`SRC/Button.kt` |
| IconButton | 默认 **52**，大号 60，小号 48，特小 32；图标 26 / 32 / 24；圆形；内容色 primary | `SRC/tokens/IconButtonTokens.kt` |
| 最小可交互尺寸 | **48** | `SRC/InteractiveComponentSize.kt` |
| EdgeButton | 高度：ExtraSmall **46** / Small **56**（默认）/ Medium **70** / Large **96**；图标 24 / 32 / 32 / 36；垂直内容内边距 6～8；与列表的间距 `EdgeButtonSpacing` **16**（最小 3）；目标侧边距 20；内部缓动 `cubic-bezier(0.25,0,0.75,1)` | `SRC/EdgeButton.kt`、`SRC/ScreenScaffold.kt` |
| Card / TitleCard | 最小高度 **64**；内边距 **12 / 12**；圆角 large 26；容器 surfaceContainer；标题 onSurface，正文 onSurfaceVariant，副标题 tertiary，时间 onSurfaceVariant；应用图标 18 | `SRC/tokens/CardTokens.kt`、`SRC/Card.kt` |
| ListHeader | 高 **48**；上内边距 16、下 12（子标题下 8）、水平 14；颜色 onBackground；字体 titleMedium | `SRC/tokens/ListHeaderTokens.kt`、`SRC/ListHeader.kt` |
| TimeText | 最大扫角 **70°**；格式 `HH:mm` / `h:mm`；上内边距 = edgePadding **2dp**；字体 arcMedium | `SRC/TimeText.kt` |
| ScrollIndicator | 指示器长 50dp，宽 5dp（大屏 6dp），间隔 3dp；滑块尺寸占比 0.3～0.7；位置动画 `tween(500ms, cubic-bezier(0,0,0,1))` | `SRC/ScrollIndicator.kt` |
| ScreenScaffold 内容内边距 | 水平 **屏宽 × 5.2%**，垂直 **屏高 × 10%**（向上取整到 dp）；edgePadding 2dp；大 / 小垂直内边距系数 0.23 / 0.13 | `SRC/Padding.kt`、`SRC/ScreenScaffold.kt` |
| TransformingLazyColumn 形变 | 小屏规格（192dp）：元素高度占比 0.2～0.6，过渡区占比 0.35～0.55；大屏规格（240dp）：0.15～0.45 / 0.4～0.6；缓动 `cubic-bezier(0.3,0,0.7,1)`；容器 alpha 0.5、内容 alpha 0.5、缩放 0.7（都是到边缘时的目标值） | `SRC/lazy/ResponsiveTransformationSpec.kt` |
| SwipeToReveal | 默认方向 **RightToLeft**；单个操作锚点宽 64dp，两个操作 130dp；大号操作按钮高 84；图标 26；左边缘区 0.15；完全滑开阈值 **0.75**；主操作色 error / onError，次操作与撤销用 surfaceContainer / onSurface；内部动画 50 / 100 / 200 / 250ms，缓动 `cubic-bezier(0.2,0,0,1)` | `SRC/SwipeToReveal.kt`（第 1121–2104 行）、`SRC/tokens/SwipeToRevealTokens.kt` |
| AlertDialog | 确认按钮 **63×54**，取消按钮 **60**；标题内边距占比 0.12，文字内边距占比 0.0416；图标与标题间距 4；按钮顶部间距 12 | `SRC/AlertDialog.kt` |
| ConfirmationDialog | 默认停留 **4000ms**；图标 52（小号 36）；线性图标容器 80；成功图标初始角度 −45° | `SRC/ConfirmationDialog.kt` |
| Dialog 进出场 | 背景缩放 0.85↔1；使用 motionScheme 的 effects spring | `SRC/Dialog.kt` |
| Picker | 渐变占比 GradientRatio 0.33（上下边缘渐隐） | `SRC/Picker.kt` |
| Stepper | fillMaxSize；按钮 60×48，按下形状 CornerFull→shapes.small（8）；按钮权重 0.35，内容权重 0.3；垂直间距 8；按钮区内边距 屏高×5.2%；图标 24；按下形状 `fastSpatialSpec().faster(200f)`（刚度 1400×9=12600，ζ=1），抬起 slowSpatial 260；按下底色 primaryContainer + 10% primary 涟漪层；长按 `repeatableClickable` 500ms 后每 60ms；触感 SegmentFrequentTick / 端点 GestureEnd；StepperLevelIndicator 用 ScrollIndicator 的弧：半径 W/2−2−3、高 2·sin36°·r、间隙 3、tween(500, cubic-bezier(0,0,0,1)) | `SRC/Stepper.kt`、`SRC/StepperDefaults`、`SRC/ScrollIndicator.kt` |
| Slider | 高 52；控制按钮 48；进度条 12（未选部分 4）；分段间隔 4；容器 surfaceContainer，圆角 large；已选部分 primary | `SRC/Slider.kt`、`SRC/tokens/SliderTokens.kt` |
| SwitchButton | 最小高度 52；内边距 14 / 8；开关控件 32×24（内高 22），轨道描边 2；滑块半径：关 6、开 9；开时容器 primaryContainer，关时 surfaceContainer；开时轨道 primary，关时轨道 surfaceContainer、描边 outline；滑块 outline→primaryContainer，对勾 primary（两段 2dp 圆头，按 1−(1−p)³ 缩放）；位置 fastEffectsSpec，颜色 slowEffectsSpec | `SRC/SwitchButton.kt`（第 2037–2047 行）、`SRC/tokens/SwitchButtonTokens.kt` |

### 1.5 动效（`SRC/tokens/MotionTokens.kt`、`SRC/MotionScheme.kt`）
- 时长：Short1–4 为 **50 / 100 / 150 / 200**；Medium1–4 为 **250 / 300 / 350 / 400**；Long1–4 为 **450 / 500 / 550 / 600**；ExtraLong1–4 为 **700 / 800 / 900 / 1000** ms。
- 缓动：Standard `(0.2,0,0,1)`；StandardAccelerate `(0.3,0,1,1)`；StandardDecelerate `(0,0,0,1)`；EmphasizedAccelerate `(0.3,0,0.8,0.15)`；EmphasizedDecelerate `(0.05,0.7,0.1,1)`；EmphasizedStandard 是两段 PathEasing（`M0,0 C0.05,0 0.133333,0.06 0.166666,0.4 C0.208333,0.82 0.25,1 1,1`）；Legacy 系列 `(0.4,0,0.2,1)` / `(0.4,0,1,1)` / `(0,0,0.2,1)`。
- Spring（MotionScheme）：主题默认 `MotionScheme.standard()`（见 `SRC/MaterialTheme.kt`、`LocalMotionScheme`）。
  | 方案 | 刚度（default / fast / slow） | 阻尼比 |
  |---|---|---|
  | standard spatial | 500 / 1400 / 260 | 1.0 |
  | effects（两种方案共用） | 500 / 1400 / 260 | 1.0（NoBouncy） |
  | expressive spatial | 350 / 800 / 200 | 0.75 / 0.7 / 0.8 |
- **【推导】** 按单位质量弹簧做数值积分（误差带 1%），得到近似的稳定时间和过冲：standard 297 / 178 / 412ms，无过冲；expressive 352 / 232 / 448ms，过冲 2.8% / 4.6% / 1.5%。Vela 没有 spring，可以用这些时长加 cubic-bezier 去近似（见 §2）。

---

## 2. 可行性映射（Wear M3 → Vela）

评级：✅ **可完整还原**；🟡 **近似还原**（写明做法）；❌ **做不到**（写明原因）。

### 2.1 Vela 能力底线（摘录，含出处）
| 能力 | Vela 状态 | 出处 |
|---|---|---|
| 布局 | 只有 flex；`flex-direction` 默认为 row；有 `position:absolute`，但在 list / swiper 的子元素上不生效；有 `stack` 层叠容器 | `01/components/general/style.md`、`01/components/container/stack.md` |
| 圆角 | 四个角只能统一设置；**必须同时设置 border-width 和 border-color**；不能超过短边的一半；border-style 只有 solid | `01/components/general/style.md` |
| 阴影 | `box-shadow` 需要 API 3+ | `01/guide/version/APILevel3.md` |
| 渐变 | ❌ 没有 linear/radial-gradient（只有 chart 组件的 `gradient` 参数） | `01/components/general/style.md`、`01/components/basic/chart.md` |
| 透明度 | `opacity` 可用，可以 transition | `01/components/general/animation-style.md` |
| transform | 只有 2D（translate / scale / rotate）；**不能 transition**，只能用 @keyframes；@keyframes 必须写 0% 和 100%；没有 fill-mode | 同上 |
| 可 transition 的属性 | width、height、opacity、visibility、border-width、border-color、background-color、background-position | 同上 |
| 缓动 | linear / ease 系列；cubic-bezier 的 x 限定在 [0,1]，**y 不限**（因此可以做过冲）；steps | 同上 |
| 字体 | ❌ 没有 font-family；`font-weight` 实际只有 normal / bold 两档（<550 按 normal）；字距 letter-spacing 未列出 | `01/components/basic/text.md` |
| 曲线文字 | ❌ JS 快应用没有；只有 Lua 的 `curvedlabel` 控件 | `02-official-lua/lvgl/widgets/curvedlabel.md` |
| 弧形进度 | `progress type="arc"`，可设 start-angle / total-angle / radius / stroke-width | `01/components/basic/progress.md` |
| 触摸事件 | touchstart / touchmove / touchend（含坐标）、click、longpress、swipe（四个方向；**在有滚动条的方向上不触发**） | `01/components/general/events.md` |
| 列表 | `list` 有 scroll 事件 {scrollX, scrollY, scrollState}，还有 scrolltop、scrollbottom、scrollend、scrolltouchup；方法 scrollTo / scrollBy。scrollY 是累计值还是增量，文档没写 **【未验证】** | `01/components/container/list.md` |
| scroll 吸附 | 需要 API 3+ | `01/components/container/scroll.md` |
| 返回键 | 页面生命周期 `onBackPress()`（右滑返回 / 实体键），返回 true 表示拦截；系统会拦截距左边缘 0～20px 的右滑 | `01/guide/framework/script/lifecycle.md`、`04/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md` |
| 表冠 / 旋钮 | ❌ JS 文档里没有任何表冠或旋转事件（只有 Lua 的 vibrator 枚举里有 `CROWN`）**【未文档化】**；手表上 list 能否被表冠原生滚动 **【未验证】** | 全库 rg 无结果；`02-official-lua/vibrator/overview.md` |
| canvas | ❌ JS 文档里没有 canvas 组件 | 全库 rg 无结果 |
| 文本输入 | ❌ `input` 只有 button / checkbox / radio 三种类型；需要使用扩展组件 input-method | `01/components/form/input.md`、`01/guide/developer-materials/extension-components.md` |
| 原生表单组件 | picker（text / time）、slider、switch | `01/components/form/*` |
| 振动 | 所有设备都只能用 `vibrator.vibrate({mode:'short'\|'long'})` | `01/features/system/vibrator.md` |

### 2.2 令牌与组件映射表
| M3 项 | 评级 | Vela 实现 / 原因 |
|---|---|---|
| 深色配色（静态 HEX） | ✅ | 直接写 HEX；纯黑背景。**一定要给每个 `<text>` 显式设置 color**，因为默认色 rgba(0,0,0,.54) 在黑底上看不见（SPEC §4.5） |
| 动态配色（跟随表盘） | ❌ | 没有获取表盘色的接口 |
| 透明度叠加（禁用态 12% / 38%） | ✅ | 用 rgba 颜色或 `opacity` |
| 字号与行高 | ✅ | `font-size`、`line-height` 按 dp 乘以 DPR 换算成 px（§3.3） |
| 字重 450 / 500 / 550 / 599 | 🟡 | 只有 normal / bold 两档：<550 用 normal，≥550 用 bold（所以 titleMedium、arc 系列显示为粗体，label 和 body 为常规） |
| 字距 / 宽度轴 / 可变字体动画 | ❌ | 没有 letter-spacing，也没有 font-variation |
| Google Sans Flex / Roboto Flex | ❌ | 没有 font-family；内嵌字体也超出包体预算 |
| 形状 4 / 8 / 18 / 26 / 36 / 圆形 | ✅ | `border-radius` 加 `border-width:1px` 加 `border-color`（与底色相同）；26dp 加 52dp 高即胶囊形 |
| 按压时形状变形（shape morph） | 🟡 | border-radius 既不能 transition 也不能做 keyframes → touchstart 时切换 class，圆角瞬间改变；再配合 `@keyframes` 做 transform scale（约 0.95）的按压回弹（**动态切换 animation 能否重新触发 【未验证】**） |
| Ripple / 按压态 | 🟡 | 没有伪类 → touchstart / touchend 切换 class，改 background-color（可以 transition，150ms） |
| Spring 动效 | 🟡 | 用 §1.5 推导出的时长，加 `cubic-bezier`：standard 用 `(0.2,0,0,1)`；expressive 带过冲时用 y>1 的曲线 **【自拟】**，例如 `cubic-bezier(0.3,1.4,0.6,1)`，需要真机调参 |
| EmphasizedStandard（两段 PathEasing） | 🟡 | Vela 只支持单段 cubic-bezier；可以用 EmphasizedDecelerate 替代，或者用两段 keyframes 拼接 |
| AppScaffold / ScreenScaffold | 🟡 | 根 `stack`：底层是 list，上层是 TimeText 和 EdgeButton 的绝对定位层；内容内边距按 §3 设置 |
| TimeText（曲线时间） | 🟡 / ❌ | 曲线文字做不到 → 顶部居中显示直排的 `HH:mm`（arcMedium 15sp，粗体）。onShow 时启动每分钟 setInterval，onHide / onDestroy 时清除。滚动时淡出：list 的 scroll 事件触发后，用 opacity transition 实现 |
| ScrollIndicator | 🟡 | 圆屏：底层一个 `progress type=arc` 作轨道。滑块需要的“滑动的一段弧”，做法是两条弧叠放（上层画到 pos+size，再盖一层画到 pos 的背景色弧）**【未验证】**；退一步可以只画从起点开始填充的弧，作为进度条。矩形 / 胶囊屏：右侧放一个绝对定位的 div 作滑块，按 scroll 事件改 top（不能 transition，会一帧一帧跳） |
| EdgeButton | 🟡 | 圆屏：全宽 div 贴着底边，圆角四角统一，底部两个角正好被圆形屏幕本身裁掉，视觉上接近 M3 的贴边形状。高度用 56dp（Small）。随滚动变高 / 变矮：height 可以 transition，结合 scrollbottom 事件 **【未验证流畅度】**。矩形 / 胶囊屏：没有曲面，退化为底部全宽胶囊形 FilledButton（52dp） |
| Button / FilledTonal / Outlined / Compact | ✅ | div + text，或 div + image（图标）；尺寸与配色照搬 §1.4 |
| IconButton | ✅ | 圆形 div，图标用 PNG（Material Symbols 导出为 PNG8，**单个体积 【未验证】**） |
| Card / TitleCard | ✅ | div 圆角 26；标题、时间、正文用三个 `<text>`；`lines` 加 `text-overflow:ellipsis`；不要用带样式的 `<span>`（社区反馈手环上会渲染错乱） |
| ListHeader | ✅ | `<text>`，48dp 高，titleMedium |
| TransformingLazyColumn 缩放与渐隐 | 🟡 | 理论上可行：根据 scroll 事件和每一项的位置，逐项改 inline 的 transform:scale 和 opacity。但 transform 不能 transition，每帧改样式在手环上性能风险很高 **【未验证】**。MVP 建议：只在圆屏上，用静态的顶部和底部遮罩来模拟渐隐；Vela 没有渐变，只能用 `<image>` 叠一张半透明渐变 PNG；不做逐项缩放 |
| SwipeToReveal | 🟡 | 简化版：列表项上的 `swipe` left 事件直接切换为露出状态（宽度 64 / 130dp 的操作区）。跟手版：touchmove 时实时改 translateX（性能 **【未验证】**；list 的滚动方向上不触发 swipe 事件，横向滑动 **【未验证】**）。右往左滑不会和系统的左边缘右滑返回冲突 |
| AlertDialog | ✅ / 🟡 | 用 stack 全屏遮罩加圆形按钮（63×54 / 60）；**prompt 只有 showToast，没有原生对话框**，只能自己画；背景从 1 缩到 0.85 用 keyframes 的 scale 实现 |
| ConfirmationDialog | 🟡 | 用自己画的覆盖层加 setTimeout 自动关闭；成功图标从 −45° 旋入用 keyframes rotate；M3 的弧形文字做不到，改用直排文字 |
| Picker（时间 / 数字） | 🟡 | 原生 `picker type=time / text` 可以改 selected-color、font-size，但没有渐隐遮罩，也没有 numeral 字体；自绘版用 `scroll` 加 scroll-snap（3+），渐隐同样只能用 PNG |
| Stepper | ✅ / 🟡 | 全屏、无返回头部（右滑返回），0.35/0.3/0.35 三段，两个 60×48 按钮夹数字和标签；按下底色 #4D3D76→#5D4D84 与形状 24→8dp 用临界阻尼精确解（12600 / 260）按 33ms 定时器采样，首帧在按下时；长按 500ms 后每 60ms；禁用时按钮、数值、标签都为 #5D5A61 系。层级指示器：两张整弧 PNG 绕屏幕中心 `rotate` + 两张静态黑色遮罩 + 两个圆点 div（扫角 ≤ 间隙时 0→3dp、alpha 0→1），所有设备都在屏宽圆上；tween 500ms 每次变化从当前位置重启。**无法消除的差异**：33ms 定时器而非 60Hz（vela-watch-5.0 模拟器 round／band10 实测 avg 66–77ms／tick，旋转比换图快：换图对照组 91–100ms）；没有涟漪扩散，只有颜色淡入；触感用 `vibrator` short 近似，没有 SegmentFrequentTick / GestureEnd 区分；遮罩假设黑底；模拟器上长按重复实测约 70–78ms（定时器被渲染拖慢）【真机未验证】 |
| Slider（M3 分段条） | ✅（自绘） / 🟡（原生） | 自绘：52dp 高的 div 容器，两侧放 −/+ 按钮，中间用 div 画分段条；原生 slider 只能改颜色，属于近似 |
| SwitchButton | ✅（自绘） | 52dp 胶囊按钮，右侧 32×24 开关为按方向/时间索引的 PNG 序列（滑块 fastEffects 1400、颜色 slowEffects 260、滑块内官方对勾）；容器背景 CSS transition 420ms；文字颜色瞬时（Vela 不能过渡 color）；手环纵向堆叠、开关右对齐 |
| 触感反馈 | ✅ | `vibrator.vibrate({mode:'short'})`，外面包 try/catch |
| 表冠滚动（Wear 依赖 rotary） | ❌ | 未文档化 |
| 返回（SwipeToDismissBox） | 🟡 | 系统右滑通过 `onBackPress` 处理；没有跟手的页面拖拽动画 |
| 阴影 | 🟡 | box-shadow 需要 3+；Wear M3 本身基本不用阴影，**建议不用** |

### 2.3 “圆屏优先”的 M3 布局在矩形 / 胶囊屏上的取舍
1. Wear 默认按圆屏设计（SIZE：先做 192dp 圆屏）。Vela 的手环是**高而窄的矩形**：
   - 胶囊屏只有 96～106dp 宽，**比 Wear 最小屏 192dp 还窄一半**；
   - Pro 款矩形屏为 168dp 宽。
   因此 M3 的绝对宽度令牌（例如双操作锚点 130dp、AlertDialog 两个按钮并排）在手环上放不下，要改为**单列竖排**。
2. 百分比外边距（水平 5.2%、垂直 10%）在矩形屏上照样适用。但矩形屏四角没有裁切，垂直外边距可以收小（社区：Pro 款顶部 ≥10px、底部 ≥12px；胶囊屏上下 ≥24px）。
3. TimeText 在矩形和胶囊屏上就是顶部居中的直排文字，与 Wear 方屏的退化形态一致。EdgeButton 在矩形和胶囊屏上退化为底部常驻的全宽胶囊按钮。
4. 高度方面：手环纵向空间充裕（490～520px），按钮和卡片高度保留 M3 的 dp 值，以保证触控面积；宽度方面用 flex 和百分比自适应。

---

## 3. 多屏布局策略（覆盖全部 Vela 手环与手表）

### 3.1 设备分组（官方规格表：`01/guide/multi-screens/specs.md`、`01/guide/design/multi-screens.md`；S5 的数据取自 `01/tools/dev/official-site-tutorial.md`）
| 组 | 设备 | 形状 | 分辨率 | DPR | 宽度（dp） | 媒体查询 | 备注 |
|---|---|---|---|---|---|---|---|
| P 胶囊 | 小米手环 9 | 胶囊 | 192×490 | 2.0 | 96 | 只支持 2+ 的 `shape`（不支持 `pill-shaped`，那是 3+） | — |
| P 胶囊 | 小米手环 10 | 胶囊 | 212×520 | 2.0 | 106 | 全部支持 | — |
| R 矩形手环 | 小米手环 8 Pro | 矩形 | 336×480 | 2.1 | 168 | ❌ 不支持 | — |
| R 矩形手环 | 小米手环 9 Pro | 矩形 | 336×480 | 2.1 | 168 | 只支持 shape | — |
| R 矩形手环 | 小米手环 10 Pro | — | **官方规格表中没有** | — | — | — | 用户给出的 336×480 **【未验证】** |
| W 矩形手表 | REDMI Watch 5 | 矩形 | 432×514 | 2.0 | 216 | 全部支持 | — |
| W 矩形手表 | REDMI Watch 6 / Watch 4 | — | 规格表中**没有分辨率** | — | — | RW4 不支持；RW6 支持 | **【未验证】** |
| C 圆屏 | Watch S3 / S4 / H1 | 圆 | 466×466 | 2.0 | 233 | S3 只支持 shape；S4 全部支持 | — |
| C 圆屏 | Watch S1 Pro | 圆 | 480×480 | 2.0 | 240 | ❌ 不支持 | — |
| C 圆屏 | Watch S5 | 圆 | 480×480 | — | — | — | 数据来自官方 AI 工作流表 |
| ✗ | **小米手环 8 标准版** | — | — | — | — | — | 社区称其**不是 Vela 平台，没有开放应用框架**（`04/xiaomi-band-dev-guide/docs/01-platform-and-engine.md` 第 12 行）→ JS 快应用无法覆盖，**需要告知用户** |

### 3.2 designWidth、媒体查询与条件编译
- 媒体查询的问题：S1 Pro、手环 8 Pro、RW4 完全不支持；手环 9 / 9 Pro / S3 只支持 shape，而且手环 9 上 `pill-shaped` 属于 3+ 特性，用不了；`dp` 单位也要 3+（`01/guide/framework/style/media-query.md`、`01/guide/version/APILevel3.md`）。→ **不能靠媒体查询把所有设备区分开。**
- **推荐：按设备组条件编译，每组出一个 rpk**（`01/guide/multi-screens/conditional-compilation.md`，支持 ux、js 文件；ux 里的 `<style>` 可以写 `/* if */`）：
  - 用 `cross-env SHAPE=PILL|RECT|CIRCLE W=192|212|336|432|466|480` 区分。
  - 每个包的 `designWidth` 等于该设备的物理宽度，这样 1px 就等于 1 个物理像素，避免缩放带来的模糊和 ±1px 误差（SPEC §7.2）。
  - `manifest.json` 是 JSON，不能写条件注释 → 需要在构建前用一个 node 脚本替换 designWidth 和 deviceTypeList **【自拟，文档未覆盖】**。
  - 好处：每个包**只打进本形状需要的输入法图片和词库**，包体显著变小（§4）。
- 运行时兜底：用 `device.getInfo` 读 `screenShape` / `screenWidth`，做次要分支，并显示“该包不适配本机”的提示。

### 3.3 令牌换算（dp → Vela px，designWidth = 物理宽度时，px = dp × DPR）【推导】
| 令牌 | dp | 圆屏 466（×2） | 矩形手环 336（×2.1） | 胶囊 192 / 212（×2） |
|---|---|---|---|---|
| 水平内边距 5.2% | — | 26px | 18px（社区建议 14px） | 10～12px（社区建议 8px） |
| 垂直内边距 10% | — | 48px（官方 AI 规则：上下 50、左右 36） | 48px → 矩形屏可减到 24px | 50 / 52px → 可减到 24～28px（社区 ≥24） |
| Button 高 | 52 | 104 | 109 | 104（手环建议 88～96 **【自拟】**） |
| 最小触控 | 48 | 96 | 101 | 96（社区：≥80px，盲按 88～96） |
| Card 内边距 / 圆角 | 12 / 26 | 24 / 52 | 25 / 55 | 20 / 44 **【自拟收缩】** |
| titleMedium / bodyLarge / bodyMedium | 16 / 16 / 14 | 32 / 32 / 28 | 34 / 34 / 29 | 28 / 28 / 24 **【自拟约 0.875 倍】** |
| TimeText（arcMedium 15sp） | 15 | 30 | 30 | 26 |
| EdgeButton Small | 56 | 112 | —（改用 Button 104） | —（改用 Button） |

> 胶囊屏只有 96dp 宽，如果严格按 dp 换算，一行只能放 5～6 个汉字。这里 0.875 倍的缩放属于设计取舍，**需要真机确认可读性**。

### 3.4 各设备的组件与接口差异（记事 App 相关）
| 能力 | 胶囊（手环 9 / 10） | 矩形手环（8P / 9P / 10P） | 矩形手表 RW5 | 圆屏 S3 / S4 / S5 / S1P | 出处 |
|---|---|---|---|---|---|
| 输入法 screentype | `pill-shaped`，**只有 QWERTY**，键盘区 100%×305px | `rect`，100%×255px | `rect`（designWidth ≥336 即可） | `circle`，480×321，**要求 designWidth 480**（466 屏需要验证） | NEORUAA README；`04/vela-doc-guide/input-method-guide.md` |
| storage / file / router / prompt / vibrate | ✅ | ✅ | ✅ | ✅ | SPEC §6.3 |
| battery、event（4+） | 只有手环 10 | ❌ | ✅ | S4 / S5 ✅（在线文档列出 S5）；S3 / S1P ❌ | `01/features/system/event.md`；https://iot.mi.com/vela/quickapp/zh/features/system/event.html |
| fetch / network | ❌ | ❌ | ✅ | ✅ | `01/features/network/fetch.md` |
| interconnect（手机同步） | 需要配套的安卓 App | 同左 | 同左 | 同左 | `01/features/network/interconnect.md` |
| record（语音） | ❌ | ❌ | ❌ | ❌（支持表中全部不支持） | `01/features/system/record.md` |
| 媒体查询 | 手环 9 只有 shape | 8P 不支持 | ✅ | S1P 不支持 | 同 §3.2 |

### 3.5 包体与内存约束
- **官方没有给出 rpk 体积或内存上限的数字**。官方的要求是：不用 axios / lodash 等第三方库、页面数量要少、多用 `static`、不要频繁调用 runGC（`01/guide/best-practice/memory.md`）。
- 社区经验：手环包 **≤50KB**，**超过 100KB 时 AstroBox 传输失败或启动闪退**（`04/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md`）；手环内存为“几百 KB 到数 MB”（同目录 `01-platform-and-engine.md`）；社区建议用单页状态机，不要频繁调用 router.push。
- 另一个社区信息：除手环 10 Pro 和 S5 外，每台设备最多装 20 个快应用（`/workspace/vela-notes/directions.md` 转引米坛知识库）。
- 手表的包体和内存限制：**没有任何文档依据**。保守做法是所有设备都按手环标准控制。

---

## 4. 即时记事的输入方案

| 方案 | 可行性 | 包体（压缩后，**【推导】**：用 zip -9 压缩源文件实测，实际 rpk 会因编译成 JS 字节码而不同） | 评价 |
|---|---|---|---|
| A. NEORUAA `Vela_input_method` 组件 | ✅ 官方扩展组件页面引用了它。GitHub https://github.com/NEORUAA/Vela_input_method ，**MIT** 许可，90★，最后 push 为 2026-09-18 23:37（UTC+8）。支持中文拼音、英文、日文罗马字；QWERTY 和 T9；圆 / 矩形 / 胶囊三种屏幕。需要 `system.file` 声明，构建时加 `--enable-custom-component`。词库按首字母分片（`words-*.txt`），通过 `file.readText` 按需读取 | 整个组件 **≈198KB**；胶囊屏只保留 arc 图片和单字库 cn.txt **≈49.7KB**；胶囊屏加词组分片（不含 jp）**≈96KB**；矩形屏加 cn **≈63KB**；圆屏 QWERTY+T9 加 cn **≈94KB**。只有代码时 ≈16.8KB，cn.txt ≈19.4KB，全部词组分片 ≈46.7KB | 功能最完整，但会吃掉大部分包体预算。去掉 words 分片后组件还能否正常工作 **【未验证】**，因为 loader 会去读 `words-x`，缺文件时的容错行为未知 |
| B. 自研 T9 或拼音键盘 | ✅ 可行 | 键盘 UI 约 5～10KB **【估】**，再加字库（至少要 6763 字的拼音表，约 20KB 起） | 工作量大，体验难以超过 A；不推荐 |
| C. 模板 / 快捷短语，加 Picker 插入时间和数字 | ✅ | 约 2～5KB **【估】** | 零打字、速度最快，适合“买牛奶”“停车 B2-115”这类短记；可以完全照 M3 的 Button / Chip 风格做 |
| D. 手写（触摸画布） | ❌ / 🟡 | — | JS 文档里**没有 canvas**；只能用 touchmove 坐标加大量绝对定位的 div 来模拟笔迹，内存开销大，而且**没有手写识别引擎**；最多只能保存为“涂鸦”，不推荐 |
| E. 语音 | ❌ | — | `record` 在支持表的所有设备上都不支持；手环也没有网络来做识别 |

**推荐**：以 **C（快捷短语、模板、时间和数字 Picker）为主入口，A（NEORUAA）为“自由输入”的二级入口**，并按设备组条件编译裁剪：
- 胶囊包：arc 图片 + QWERTY + cn 单字库 → 组件约 50KB，加上 App 本体约 15～25KB **【估】**，总共约 65～75KB。超过社区的 50KB 红线，但低于 100KB 的失败线。**需要先在手环 9 / 10 上真机实测安装和启动。**
- 如果实测失败，降级方案：去掉 T9 和 jp，用 PNG8 重新压缩键盘图片，或者把键盘改成纯 div 加 text 渲染、去掉图片（自研改造）。
- 圆屏包体积最大（QWERTY+T9 ≈94KB），建议只保留 QWERTY。
- 米坛上已有先例：“Vela 双拼输入法”基于 NEORUAA 二次开发（https://www.bandbbs.cn/resources/7771/）；“狼人杀工具”作者说明“引入输入法组件，体量较大”（https://www.bandbbs.cn/resources/7290/）。

---

## 5. 系统通知 / 定时提醒调查（待办pro，https://www.bandbbs.cn/resources/8677/ ）

**有文档的（官方）**
- Vela JS 接口里**没有 `@system.notification`，也没有 `@system.alarm`**（离线文档全库 rg 均无结果；在线接口总览 https://iot.mi.com/vela/quickapp/zh/features/ 也没有）。
- 后台运行只允许 `system.audio`、`system.request`、`system.geolocation` 三类接口，而且要过上架审核（`01/guide/framework/other/background-running.md`）→ 应用切到后台就会停止运行，**没有定时唤醒**。
- `@system.event`（4+）只是应用间的发布 / 订阅，系统事件只有电量相关的三个，**不能做定时调度**（`01/features/system/event.md`）。
- 注意区分：网上搜到的 `@system.alarm`（`setAlarm({hour, minute, message, days})`）来自**车机快应用文档 cardoc.quickapp.cn**，**不是 Vela**，不能照搬。
- 小米穿戴“第三方 APP 能力开放”PDF 里的 `NotifyApi.sendNotify` 是**手机端 Android SDK**，用来从手机往手表推送通知，表端快应用感知不到。这一点可以作为“手机配套 App 代发提醒”的路径，但需要另写 Android App。

**没有文档的（待办pro 的实现）**——资源页原文要点（v18，手环 10 Pro 固件 3.101.043）：
- 作者自述它是“**非官方原生**待办提醒应用”，“接入目标固件的官方待办记录与调度流程”，提醒中有“完成 / 忽略 / 10 分钟后提醒”。
- “提醒服务与应用页面分离……**安装表盘中提供安装及自启动配置入口**”；作者还承认这些行为“依赖固件内部机制，不能理解为……得到官方支持或完整真机认证”。
- 在 `work/items.json` 中，它的分类是 cat 108、前缀 86，与一般“小程序”条目的前缀 82 不同（前缀含义 **【未核实】**）。
- **结论【推断】**：它不是通过 JS 快应用接口实现的提醒。很可能是借助表盘或 Lua 运行环境（官方 Lua 文档显示 `os.execute` 可以调用 NuttX shell，表盘里也运行 Lua，见 `02-official-lua/intro/overview.md`、`lvgl/widgets/analogtime.md`）去写入固件自带的待办数据库，属于**特定机型、特定固件的私有机制**。可移植性差，固件升级后可能失效，也有上架和安全风险。**不建议在记事 App 里依赖这种做法。**
- 记事 App 可行的“提醒”替代方案：
  1. 打开 App 时在首页标出到期事项；
  2. 引导用户使用系统闹钟；
  3. 将来做手机配套 App，通过 interconnect 同步，再由手机侧通过 NotifyApi 推送。

---

## 6. MVP 建议

### 6.1 功能
1. 新建、编辑、删除记事。每次改动立即写入 `storage`（每条记事一个 key，另有一个索引 key），onHide 时再兜底保存一次。
2. 快捷短语和模板（预设约 20 条，用户可以把常用内容收藏为模板），可插入当前时间、日期、数字（Picker / Stepper）。
3. 自由输入：使用 NEORUAA 输入法（按设备组裁剪）。
4. 列表按更新时间倒序排列，支持置顶；每页 ≤20 条，触底再加载更多（官方建议）。
5. 左滑露出删除和置顶按钮（SwipeToReveal 简化版），删除后可以撤销；长按进入多选（v1.1）。
6. 删除确认用 AlertDialog，保存成功用 Confirmation（1.5～2s **【自拟】**，比 M3 默认的 4000ms 短）。
7. 设置：振动反馈开关（SwitchButton）、字号（Stepper）、键盘类型（圆屏可选 T9 / QWERTY）、清空全部、关于。
8. **不做**：定时提醒、语音、手写、云同步（留到 v2，届时再考虑 interconnect）。

### 6.2 页面（建议做成单页状态机，`viewMode` 切换，避免页面栈占用内存）
| # | 页面 | M3 组件 |
|---|---|---|
| 1 | 首页列表 | TimeText、ListHeader“即时记事”、TitleCard 列表、ScrollIndicator、EdgeButton（圆屏）/ 底部 FilledButton（矩形）“新建” |
| 2 | 编辑页 | 顶部是输入预览卡（surfaceContainerLow），下方是快捷短语 Chip 行（FilledTonal / Compact），最下方是 NEORUAA 键盘；右上角放保存用的 IconButton（✓） |
| 3 | 快捷短语页 | ListHeader 加 FilledTonalButton 列表 |
| 4 | 详情页 | 全文可滚动，底部是“编辑 / 置顶 / 删除”三个 IconButton（胶囊屏上竖排） |
| 5 | 删除确认 | AlertDialog：标题、正文、取消（60dp）与确认（63×54dp，error 色） |
| 6 | 完成反馈 | ConfirmationDialog（✓ 图标从 −45° 旋入） |
| 7 | 设置 | SwitchButton、Stepper、OutlinedButton |

---

## 7. 补充令牌（ScrollIndicator / TimeText 颜色）
- 来源 `SRC/ScrollIndicator.kt`：指示器颜色为 onBackground 调亮度到 L\*80，轨道颜色为 onBackground 调到 L\*20。TimeText 的文字颜色同为 onBackground 调到 L\*80（`SRC/TimeText.kt`）。
- **【推导】** onBackground 是白色（没有色相），按 CIE L\* 反算成 sRGB，结果约为 `#C6C6C6`（L\*80）和 `#303030`（L\*20）。

## 8. 预览图（静态 HTML 模拟，只用 Vela 能渲染的效果）
- 目录：`/workspace/vela-notes/preview/`
  - 生成脚本：`src/gen.js`（HTML）、`src/shoot.js`（截图：playwright-core + 系统 google-chrome，deviceScaleFactor 2）
  - HTML 源文件：`html/`
- 各设备的缩放系数：
  - 胶囊屏：dp × 1.625 **【自拟】**（比 §3.3 表里的 0.875 × 2 = 1.75 更紧凑，是为了在 192px 宽的屏上放下标题）；
  - Pro 款与圆屏：dp × 2。
- 模拟时遵守的约束：
  - 只用 flex 和 absolute 布局、纯色、统一圆角（加 1px 同色边框）、opacity，字重只有 normal 和 bold；
  - 不用渐变、阴影、字距，也不用曲线文字；
  - 唯一例外：圆屏 ScrollIndicator 用 SVG 画出，表示 Vela 原生 `progress type=arc` 的效果。

### 8.1 预览图中的近似项（与原生 M3 的差异）
1. **TimeText**：直排居中显示 `10:08`，不是弧形文字。编辑页在手环上隐藏了 TimeText，以腾出空间。
2. **圆屏 EdgeButton**：普通的统一圆角 div，由圆形屏幕本身裁掉底部，近似贴边形状；不会随滚动伸缩。
3. **矩形 / 胶囊屏“新建”按钮**：底部常驻的全宽胶囊形 FilledButton。M3 的 EdgeButton 是为圆屏设计的，这里是退化形态。按钮上方是 92% 不透明度的黑色纯色条，用来代替渐隐（Vela 没有渐变）。
4. **ScrollIndicator**：
   - 圆屏用 progress arc 表示，滑块是从 60° 处开始的一段弧；
   - 矩形和胶囊屏是右侧的 div 条；
   - 端点形状与真机是否一致 **【未验证】**。
5. **TitleCard**：窄屏上把时间放在第一行、标题放在第二行（这是对 M3 布局的改动）。“置顶”标识用 tertiary 色文字表示。
6. **没有 TransformingLazyColumn 的缩放和渐隐**：列表项是静态的。
7. **字体**：截图用 Noto Sans CJK SC 代替设备系统字体；字重只有 normal 和 bold 两档，可变字重 450 / 550 都不能表现。
8. **键盘**：仿照 NEORUAA 的布局，圆屏为整行 QWERTY；矩形和胶囊屏为横向滚动的圆键，边缘被裁切。配色改成了 M3 的 surfaceContainer。**原组件用的是 PNG 图片按键，要换成这套配色需要修改组件**（MIT 许可允许修改）。
9. **图标**：✓、✕、⌫、🗑 在截图中用字符或 emoji 代替，真机上应换成 PNG 图标。
10. **设备外形遮罩**（胶囊、圆角矩形、圆形）只是示意，并不是真实的屏幕圆角数值。
11. **AlertDialog**：在胶囊屏上，两个按钮改成竖排（M3 原生是横排）。

### 8.2 v2 预览图（2026-10-22，按“还不够像 Wear M3”的反馈重做；v1 文件保留不动）
- 目录：`/workspace/vela-notes/preview/v2/`
  - 总览：`v2_overview_all_screens_all_devices@2x.png`（5 个界面 × 4 种屏幕）
  - 对照图：`v2_compare_m3_reference_vs_round@2x.png`（M3 官方参考 vs v2 圆屏：首页、AlertDialog、Confirmation）
  - 单屏：`v2_{home|editor|ime|dialog|confirm}_{band9_192x490|band10_212x520|pro_336x480|round_466x466}@2x.png`，共 20 张
  - 脚本：
    - `src/assets.js`：把 Material Symbols Rounded SVG 栅格化为各设备物理像素的 PNG；
    - `src/shapes.py`：从 androidx golden 描摹 M3 形状、生成渐隐 PNG，并量化为 PNG8；
    - `src/gen2.js`：生成 HTML；`src/shoot2.js`：2x 截图；`src/boards.py`：拼总览图和对照图。
  - 资源：`assets/<设备>/*.png`；体积清单：`assets/sizes.json`
- 参考图存放在 `/workspace/vela-notes/preview/ref/`，来源：
  - androidx golden：`https://android.googlesource.com/platform/frameworks/support-golden/+/refs/heads/androidx-main/wear/compose/compose-material3/<文件名>`
  - devsite 配图：`https://developer.android.com/static/wear/images/...`
  - 设计指南：`https://developer.android.com/design/ui/wear/guides/components/{lists,cards,time-text}`

#### 8.2.1 v1 与官方参考的差异，以及 v2 的修正
| 项 | v1 的问题 | 参考依据 | v2 的做法 |
|---|---|---|---|
| ListHeader | 窄屏左对齐，旁边加了“N 条” | listheader golden、lists-hero：居中、单行 | 所有屏幕都居中，48dp 高，titleMedium、onBackground，去掉计数 |
| TimeText | 文字直接浮在内容上方 | timetext golden：顶部居中，底下有黑色底 | 直排实时文字放在黑色胶囊上，下面垫一张顶部渐隐 PNG |
| 列表项 | 全部是 Card | lists-hero：tonal 胶囊按钮，左侧图标 + 粗体 label + secondaryLabel | 普通记事改为 FilledTonalButton（52dp、全圆角、内边距 14/6dp、24dp primary 图标、间距 6dp）；只有置顶记事用 TitleCard（26dp 圆角、12dp 内边距，标题粗体、时间 onSurfaceVariant、正文两行） |
| 左右边距 | 凭经验取值 | ScreenScaffold 水平 5.2% | `hp = round(W × 0.052)` |
| 圆屏 EdgeButton | 统一圆角 div，靠圆屏裁出形状 | edge_button golden：顶边较平、大圆角，底部随屏幕弧线鼓出 | 用 golden 描摹出的形状 PNG（primary 色），上面叠 32dp onPrimary 的 add 图标 |
| 渐隐（scrim） | 92% 不透明度的纯色条 | apps-overview：内容在顶部和底部渐隐 | 顶部、底部各一张黑色 alpha 渐变 PNG8 |
| ScrollIndicator | 圆屏是 progress arc，长度不对 | position_indicator golden：右侧短竖胶囊，滑块与轨道分段 | 5dp 宽、总长 50dp、间隔 3dp，由滑块和轨道两段圆角 div 组成（颜色 #C6C6C6 / #303030）；不再用弧 |
| AlertDialog | 图标是 emoji，胶囊屏按钮竖排，确认按钮用 error 色 | alertContent golden：顶部白色图标，标题居中，取消按钮是 60dp 圆角方块（surfaceContainer，primary 色图标），确认按钮是 primary 色的形变异形 | 按 golden 还原。确认按钮形状用描摹的 PNG；胶囊屏保持横排，按钮缩小到 0.8 倍 |
| Confirmation | 没有 | successConfirmation golden | 新增“已保存”界面：描摹的异形 PNG（#210F48）加 52dp 的 check 图标；文字直排 |
| 编辑器 | 页面里直接放键盘 | Wear 的 RemoteInput 模式：先看输入预览，输入时进入全屏 IME | 拆成两个界面。编辑页：OutlinedCard 风格的输入预览，下面是“键盘输入 / 快捷短语 / 插入时间”三个 tonal 按钮，加保存按钮。全屏输入法页：NEORUAA 布局，候选词用 primary 胶囊表示，功能键用 surfaceContainerHigh |
| 图标 | 字符和 emoji | Material Symbols Rounded（Apache-2.0） | 全部换成 PNG8 图标 |

#### 8.2.2 v2 仍然无法消除的差异（Vela 限制）
1. **TimeText 是直排的**：Vela JS 没有曲线文字。
   - 评估过“数字精灵图”方案：0–9 和冒号共 11 个字形，按 5 个字位分别预先旋转，约 55 张 PNG，每台设备约 8–14KB，每分钟更新 5 个 image。
   - 70° 以内的弧度在 5 个字符上几乎看不出来，所以**不推荐**，保持实时直排文字。
2. **Confirmation 的文字也是直排的**：官方是沿底部弧线排列的 curved text。
3. **EdgeButton 不能伸缩**：形状 PNG 是从 192dp 屏幕的 golden 描摹后非等比缩放得到的，与 M3 按屏幕宽度实时计算的形状有细微差别 **【近似】**。
   - 不会随滚动缩放或展开；
   - 按压时的形变动画可以用 @keyframes 做 scale 近似 **【未验证】**。
4. **没有 TransformingLazyColumn 的效果**：列表项在边缘不缩小、不形变；圆屏底部的项会被屏幕裁切，再由底部渐隐 PNG 遮住。
5. **AlertDialog 确认按钮**：静态 PNG，不能做按压时的形状变形（M3 Expressive 的 shape morph）。
6. **字重和字体**：只有 normal 和 bold，设计稿中 450、550、599 等字重都会退化；截图里的字体是 Noto Sans CJK SC。
7. **图标不能染色**：Vela `image` 没有 tint，每种颜色都要单独一张 PNG（这也是资源按颜色区分命名的原因）。透明通道 PNG8 在真机上的显示 **【未验证】**；文档只说明支持 png / jpg（`components/basic/image.md`），并建议使用 PNG8（`guide/best-practice/business.md`）。
8. **ScrollIndicator 是直的**：M3 圆屏上是一段沿屏幕边缘的弧。50dp 长的弧矢高约 3dp，这里用直胶囊近似。
9. **列表项图标**：用 primary 单色图标；官方示例中的彩色圆底应用图标不适用于本应用。
10. **颜色取舍**：
    - devsite 设计图里的 ListHeader 是灰色，但 golden 和令牌是 onBackground 白色，以令牌为准；
    - devsite 卡片的浅渐变也没有还原：令牌是纯色 surfaceContainer，而且 Vela 不支持渐变。
11. **设备外形遮罩只是示意。**
12. **胶囊屏空间不足**：
    - 按钮内边距缩到 10dp、图标与文字间距缩到 4dp；
    - label 仍会截断成 3–4 个汉字；
    - TitleCard 改成“图钉 + 时间”一行、标题单独一行。

#### 8.2.3 PNG 资源体积预算（PNG8，按设备物理像素绘制，实测）
| 设备组 | 文件数 | 原始字节 | 打包为 zip（deflate，含条目头） |
|---|---|---|---|
| band9（192×490） | 22 | 9,163 B | ≈ 11.0 KB |
| band10（212×520） | 22 | 9,324 B | ≈ 11.2 KB |
| pro（336×480） | 22 | 10,453 B | ≈ 12.1 KB |
| round（466×466） | 23（多出 edge_button） | 12,446 B | ≈ 14.3 KB |

- 单个文件在 207 B（add 图标）到 2,408 B（圆屏成功异形）之间。各文件明细见 `assets/sizes.json`。
- 每个分组的 rpk 只打包本组资源（条件编译，见 §3），增量约 **11–14 KB**。在 §4 推荐方案（模板加裁剪版 NEORUAA，胶囊屏约 49.7 KB）的基础上，胶囊屏合计约 61 KB，略超 50 KB 的建议值。
- 可以压缩的地方：
  - 去掉 Confirmation 异形，改用纯色圆形 div，可省 1–2.4 KB；
  - 图标改成 8 色，可再省约 10–20% **【估算】**；
  - 如果多个分组共用同一个 rpk、打入全部 4 套资源，约 41 KB 原始字节，**不推荐**。

### 8.3 v3 预览图（2026-10-22，按“这设计不够 wear material 3”反馈重做；v1/v2 文件保留不动）
- 目录：`/workspace/vela-notes/preview/v3/`
  - 对照图：`v3_compare_m3_reference_vs_round@2x.png`（官方参考 vs v3 圆屏：首页、EdgeButton、AlertDialog、Confirmation，外加 50% 叠图和 TimeText / 滚动条 / EdgeButton 外形细节）
  - 总览：`v3_overview_all_screens_all_devices@2x.png`（6 个界面 × 4 种屏幕）
  - 单屏：`v3_{home|home_end|editor|ime|dialog|confirm}_{band9_192x490|band10_212x520|pro_336x480|round_466x466}@2x.png`，共 24 张。`home` 是列表顶部状态，`home_end` 是滑到底部、EdgeButton 完整展开的状态
  - 脚本（`src/`）：
    - `tokens.js`：颜色和字体令牌原值
    - `geom.js`：EdgeButton 外形、内边距、TLC 形变公式（照抄源码）
    - `assets3.js`：生成 PNG 资源；`quant.py`：量化为 PNG8，并输出 `assets/sizes.json`
    - `gen3.js`：生成 HTML；`shoot3.js`：2x 截图；`boards3.py`：拼对照图和总览图
    - `edgebutton_vs_golden.js`：EdgeButton 外形与 golden 的叠图校验
  - 参考图：`ref/`，来源和下载地址见 `ref/SOURCES.md`
  - 源码快照：`tokens/`，均为 androidx-main 的 .kt 文件，2026-10-22 读取
  - 字体：`fonts/`，Google Sans Flex 和 Roboto Flex，均为 OFL 许可

#### 8.3.1 v3 使用的令牌（全部来自 androidx-main 源码；与 §1 相同的项不再重复，这里只列 v3 新用到或校准过的）
| 项 | 值 | 来源 |
|---|---|---|
| 配色 | 与 §1.1 完全一致（逐项对过 `ColorTokens.kt` / `PaletteTokens.kt`）。**v2 的颜色本来就是官方原值**：默认中性色阶 Neutral15/20/30 = `#272430` / `#332E3C` / `#494453`，本身就带紫色调，并不是我们调出来的。devsite 配图显示灰色或绿色，是因为用了表盘动态取色（Dynamic Color），Vela 做不到 | ColorTokens.kt |
| 列表项 Button | FilledTonal：surfaceContainer `#332E3C`，高度 ≥52，圆角 CornerLarge 26（即胶囊形），水平内边距 14、垂直 6，图标与文字间距 6；大图标起始内边距 12（`ButtonLargeIconStartPadding`）；主标签 labelMedium 15/18 onSurface；副标签 labelSmall 13/16 onSurfaceVariant `#CAC4D0` | FilledTonalButtonTokens.kt、Button.kt 第 1896–2029 行 |
| 彩色圆形图标容器 | 圆屏：32dp 圆（`IconLargeSize`）内放 20dp 图标；矩形 / 胶囊屏：24dp 圆内放 16dp 图标。底色用 tertiaryDim `#FFB77A` / secondaryDim `#BAC3FF` / primaryDim `#D0BCFF`，图标色用对应的 onTertiary / onSecondary / onPrimary **【自拟配色，令牌值为官方原值】** | 参照 devsite lists-hero |
| ListHeader | 最小高度 48，内边距 上 16 / 下 12 / 左右 14，titleMedium 16/18（550 → 粗体），onBackground，居中 | ListHeader.kt、ListHeaderTokens.kt |
| ScreenScaffold 内边距 | 水平 = ceil(屏宽 dp × 5.2%)，垂直 = ceil(屏高 dp × 10%)：圆屏 13/24dp；Pro 9/24dp；手环 10 为 7/32dp；手环 9 为 7/31dp | Padding.kt |
| TransformingLazyColumn | 项间距 4dp【未在源码中逐字核对，取自 golden 实测】；ResponsiveTransformationSpec：192dp 屏 minElem/maxElem/minTrans/maxTrans/scale/alpha = 0.2/0.6/0.35/0.55/0.7/0.5，240dp 屏 = 0.15/0.45/0.4/0.6/0.6/0.5，屏幕尺寸在两者之间时线性插值；缓动 cubic-bezier(0.3,0,0.7,1)；缩放以顶部为锚点，占位高度 = ceil(scale × h) | lazy/ResponsiveTransformationSpec.kt、TransitionAreaProgress.kt |
| EdgeButton | 用 Small 尺寸，高 56；椭圆高 = 58 + (56−46) × 1.42 = 72.2；rx = √(36.1 × (屏宽/2 − 3))；顶部两个圆角半径 r = 56 − 36.1 = 19.9；距屏幕底边 3dp；与列表间距 16dp（列表底部内边距 = 62 + 13）；图标 32dp；内容区上下内边距 6 / 8（图标中心在按钮顶部往下 27dp 处）。得出的宽度：圆屏 128dp、Pro 108dp、手环 10 约 95dp、手环 9 约 90dp。**按源码公式算出的外形与 golden 的 IoU 为 98.4%（不一致的像素只在图标处）** | EdgeButton.kt（ShapeHelper / EdgeButtonShape） |
| EdgeButton 何时显示 | 高度 = 列表最后一项下方剩余的空间；列表在顶部时按钮收起，滑到底部时完全展开 | ScreenScaffold.kt 第 1203–1290 行 |
| TimeText | arcMedium 15/18、599 → 粗体；颜色 onBackground 调到 L\*80 = `#C6C6C6`（golden 里是白色，以源码为准）；距屏幕边缘 2dp；底部有黑色曲线底板；最大扫角 70°；编辑页带状态文字“新记事 · ”，用 primary 色 | TimeText.kt、CurvedText.kt |
| ScrollIndicator | 宽 6dp（屏宽 ≥225dp，否则 5dp），长 50dp，滑块与轨道间隔 3dp，距屏幕边缘 2dp；滑块长度占比 0.3–0.7；颜色 L\*80 `#C6C6C6` 和 L\*20 `#303030`（golden 实测为 `#C6C6C7` / `#2F3131`） | ScrollIndicator.kt |
| AlertDialog | 图标 24dp onBackground；图标距标题 4；标题 titleMedium，onBackground，左右留白 12% 屏宽；正文 bodyMedium，onBackground（v2 用的 onSurfaceVariant 是错的），左右留白 4.16%，正文上方间距 4；按钮行依次为：6dp 空白、取消按钮 60dp（FilledTonal，shapes.medium 18dp，图标 close 28dp primary）、3% 屏宽间隔、确认按钮 63×54（CircleShape，**旋转 −45°**，primary 底，图标 check 28dp onPrimary）、2dp 空白；按钮距屏幕底边 = 10% 屏高 | AlertDialog.kt 第 1334–1576、1870–2013 行 |
| SuccessConfirmation | 容器宽 = (1 − 2 × 0.2315) × 屏宽，高 = (1 − 2 × 0.176) × 屏高，CircleShape（胶囊形），**旋转 45°**，颜色 `#210F48`（golden 实测）；图标 check 52dp primary；曲线文字 arcLarge 18/22、599 → 粗体，onBackground，距边缘 2dp，最大扫角 120° | ConfirmationDialog.kt 第 590–640、943–1062 行 |
| 字体 | 源码 `TypefaceTokens` 指定 Brand / Plain 均为 "roboto-flex"；截图用 Google Sans Flex（Wear OS 6 系统字体）加 Noto Sans SC。Vela 没有 font-family，真机显示系统字体 | TypefaceTokens.kt |

#### 8.3.2 v3 相对 v2 的改动
1. **首页列表改成 M3 Button 列表**：每条记事一个 FilledTonal 胶囊按钮，从左到右是彩色圆形图标、粗体标题、灰色副标题（时间 · 第二行内容）。去掉 TitleCard，置顶记事改用图钉图标来表示。
2. **列表边缘缩放（TransformingLazyColumn）**：按源码公式逐项计算 scale 和 alpha，靠近上下边缘的项会缩小、变淡。Vela 中的做法是在 list 的 scroll 事件里改 `transform: scale()` 和 `opacity`（性能 **【未验证】**；退化方案是只在静止时计算一次）。
3. **首页分两个状态**：顶部状态（`home`）不显示 EdgeButton；滑到底部（`home_end`）时 EdgeButton 完整展开。这与 M3 原生行为一致，参考 ScreenScaffold 源码和 devsite 视频截帧。
4. **EdgeButton 外形改为按源码公式逐设备生成**：v2 是从 golden 描摹后再拉伸的。手环和 Pro 也用同一公式（M3 在方屏上同样使用这个形状），不再退化为普通胶囊按钮。
5. **TimeText 改为曲线文字**（圆屏和胶囊屏顶部）：每个字符一个 `<text>`，用 `transform: rotate()` 加 `transform-origin`（px）绕屏幕圆心旋转，下面垫一张曲线黑底 PNG。时间仍是实时文字，**不需要数字精灵图**。矩形屏保持直排，与官方 non-round golden 一致。
6. **ScrollIndicator**：圆屏改为弧形，用轨道 PNG 加滑块 PNG 组合；滑块 PNG 两端预留 3dp 黑边，用来切出与轨道之间的间隔；运行时用 rotate 绕屏幕圆心移动。矩形和胶囊屏保持直条。
7. **AlertDialog 的确认按钮和 Confirmation 的异形容器不再用 PNG**：源码里它们就是“胶囊形加旋转”（−45° / 45°），Vela 用 `border-radius` 加 `transform: rotate` 就能画出来。与 golden 50% 叠图，几乎完全重合。
8. **“已保存”在圆屏上沿底边弯曲**（PNG，1.0KB）。胶囊屏和矩形屏改为 M3 的直排文字（titleMedium），因为胶囊屏底部半径太小，弯曲后难以辨认。
9. **编辑页改成 M3 Expressive 风格**：上方居中显示正文预览，中间是 3 个 FilledTonal 图标按钮组（键盘 / 短语 / 时间），底部是 EdgeButton（✓ 保存）。手环屏太窄，改为 2 个带文字的按钮，“插入时间”并入快捷短语。
10. 其他：
    - 删除确认的标题缩短为“删除记事？”；
    - 正文颜色改为 onBackground；
    - 列表主标签用粗体（详见 §8.3.3 第 5 条）；
    - 所有尺寸都按 dp × 系数换算：圆屏和 Pro 为 2，胶囊屏为 1.625 **【沿用 v2 的自拟值】**。

#### 8.3.3 仍然无法消除的差异（Vela 限制或取舍）
1. **动态配色做不到**：只能使用默认的紫色系令牌。官方宣传图里的灰色或绿色，都是表盘动态取色的效果。
2. **字体与字重**：
   - 没有 font-family，真机显示系统字体；
   - 字重只有 normal / bold 两档，M3 的 500 / 550 / 599 都无法表现；
   - 没有 letter-spacing 和宽度轴（wdth 110）；
   - 列表主标签令牌是 500，我们选择用 bold 显示（中文在 normal 下显得太轻），属于取舍。
3. **形状变形动画（shape morph）和弹簧动效做不到**：按压时只能瞬间切换圆角，或用 keyframes 做 scale 近似。
4. **EdgeButton 不能随滚动平滑伸缩**：可以在 scrollbottom 时用 height transition 展开整张 PNG，但做不到源码里椭圆随高度连续变形的效果（PNG 只有 56dp 一种形状）。
5. **TLC 逐帧形变的性能 【未验证】**：手环上逐项改 transform 可能掉帧，退化方案是关闭形变。
6. **曲线文字依赖 Vela 对 `<text>` 旋转和 transform-origin（px，且原点在元素外部）的支持 【未验证】**。如果真机不支持，TimeText 退化为直排（与 v2 相同）。
7. **滚动条滑块绕屏幕圆心旋转同样依赖 transform-origin 【未验证】**。退化方案是预生成 5 个位置的滑块 PNG（每个约 0.4KB）。
8. **圆屏“已保存”是静态 PNG**：换文案需要重新出图。也可以改用逐字旋转 `<text>`，与 TimeText 同一方案。
9. **图标不能染色**：每种颜色要一张 PNG；彩色圆形容器是 div，可以随意换色，不额外占用资源。
10. **IME 键盘**：仍是 NEORUAA 布局套 M3 配色，需要改组件源码（MIT 许可允许修改）；官方 Wear IME 由系统提供，无法对标。
11. **胶囊屏宽度只有 96–106dp**，远小于 Wear 最小屏 192dp：列表标签需要折成两行，按钮内边距缩小，AlertDialog 按钮缩小到 0.8 倍。这些都是适配取舍，不是 M3 规范内容。
12. **设备外形遮罩只是示意。**

#### 8.3.4 PNG 资源体积（PNG8，按设备物理像素绘制，实测；明细见 `preview/v3/assets/sizes.json`）
| 设备组 | 文件数 | 原始字节 | zip（deflate） | 最大的几个文件 |
|---|---|---|---|---|
| band9（192×490） | 21 | 7,908 B | ≈ 9.6 KB | edge_button 765 B、check 52dp 497 B、timetext_bg 447 B |
| band10（212×520） | 21 | 7,931 B | ≈ 9.6 KB | edge_button 775 B |
| pro（336×480） | 20 | 8,462 B | ≈ 10.2 KB | edge_button 981 B |
| round（466×466） | 25 | 11,761 B | ≈ 13.7 KB | curved_saved 1,040 B、edge_button 1,013 B、滚动条弧 3 张约 0.9 KB |

- 比 v2 更小：v2 为 9.2–12.4 KB 原始字节。原因是 AlertDialog 确认按钮和 Confirmation 异形改用 div 加 rotate 绘制，不再需要 PNG；顶部和底部渐隐 PNG 也被 TLC 形变取代。
- 胶囊屏在 §4 输入法方案（约 49.7 KB）的基础上，合计约 60 KB。
