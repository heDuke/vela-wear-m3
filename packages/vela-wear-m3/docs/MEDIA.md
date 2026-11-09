# 媒体控件规格（P0 冻结 · P1 / P2 / P3 实现）

[组件指南](COMPONENTS.md#媒体控件) · [生成器 API](API.md)

`.m3.tpl` 里用下面的 Compose 名；规格仍按 Horologist 组件对照。独立函数 `PlayPauseButton` / `SettingsRow` / `VolumeLevelIndicator` 当前会报 unknown component，经 `PlayerScreen` 内部展开。

| Compose | 注册模板 | 常用参数 |
|---|---|---|
| `PlayerScreen` | media-player | `marquee`、`left`、`right` |
| `MediaButtonRow` | media-controls | `left`、`right` |
| `MediaInfo` | media-info | `marquee` |
| `VolumeScreen` | volume-screen | `content`（`'device'` / `'label'`） |

复刻对象：Horologist `media/ui-material3` 的 **Animated** 组合（官方 golden 截图所用：scallop 播放键 + 波浪进度环 + 胶囊侧键 + 标题/副标题），固定版本 `google/horologist@cdf245ceee02549a16d2da519a55e1e4d96777c3`；ButtonGroup / MotionScheme 取自本库已固定的 `androidx/androidx@2f557dc1f1ec71edae73e2c16b0e446523c644b7`。全部常量集中在 `tools/media-geom.js`（`SPEC`），资源由 `tools/media-assets.js`（Chrome 渲染）+ `tools/media-quant.py`（PNG8）生成。

标注：**【源码】** Kotlin 常量；**【推导】** 由源码公式计算；**【适配】** Vela / 非圆屏自拟；**【降级】** 官方行为做不到时的替代。

## 1. 冻结常量

| 项 | 值 | 来源 |
|---|---|---|
| 播放键格 | 80 dp（大屏；小屏 64 dp）。四种布局按 `screenHeightDp > 224` 均为大屏 | 【源码】`Constants.kt` / `LargeScreen.kt` |
| 内 scallop | `pillStar(10, innerRadiusRatio 0.82)`，圆角 8 dp，`normalized()` 后最大边 = 80−2·8 = 64 dp | 【源码】`AnimatedPlayPauseButton.kt` |
| 波浪进度环 | 官方：独立的 `pillStar(10, 0.8)`，圆角 12 dp，最大边 80−4 = 76 dp，描边 4 dp 圆头。本库：环中心线 = 按钮 scallop **向外平移 6 dp**（同一多边形、同心、同相，12 点钟为波谷），宽 76 dp、高 73.5 dp，与按钮的黑色间隙恒为 4 dp；官方两条独立曲线的间隙在 2.8–4.0 dp 间起伏 | 【源码】`RotatingWavyProgressIndicator.kt` +【适配】 |
| 指示/轨道间隙 | gap = 0.006 × 周长 + 描边（周长 240.4 dp → 5.44 dp） | 【源码】同上 |
| 归一化 | RoundedPolygon `normalized()` 按**较大边**缩放并居中：10 瓣、12 点为波谷 → 宽（波峰到波峰）= 64 / 76 dp，高（波谷到波谷）= 61.5 dp（环 73.5 dp）。golden 实测 scallop 63×61 dp、环外径 80 dp | 【源码】+ golden 测量 |
| 颜色 | 键 primary、图标 onPrimary、侧键 primaryDim、指示 onSecondaryContainer、轨道 surfaceContainerLow、禁用容器 onSurface **16 %** / 内容 38 %（DisabledContainerAlpha；进度环无禁用态） | 【源码】`MediaButtonDefaults` / `ProgressIndicatorDefaults` |
| 图标 | 播放/暂停/下一首 32 dp（`LottiePlaceholders.kt` 静态帧路径，上一首为镜像）；±5/10/30 s 24 dp（Material Symbols replay_N / forward_N） | 【源码】 |
| ButtonGroup | 侧格 `weight(1)`、中格 `weight(.5)+minWidth 80`；侧键内边距 外 7.1 % H、内 3 % H、上下 5.2 % H；按压扩展 12 dp（中格被按时两侧各 −6） | 【源码】`ButtonGroupLayout.kt` / `ButtonGroup.kt` |
| 按压动效 | 按下 fastSpatial ×2 = 刚度 5600、抬起 slowSpatial 260，临界阻尼；Vela 用 `transition: width` + 拟合三次贝塞尔（100 ms `cubic-bezier(.18,0,.06,1)`，450 ms `cubic-bezier(.18,0,.08,1)`，最大误差 2.8 % / 2.4 %） | 【源码】+【推导】 |
| 文字 | 标题 titleMedium 16 dp / 行高 20，副标题 bodyMedium 14 dp / 18；round 宽 66.72 % / 71 % W；溢出省略号 + 右侧 8 dp 渐隐 | 【源码】`TextMediaDisplay` |
| 跑马灯 | 64 dp/s、每轮停 4000 ms、首尾间距 96 dp、两侧 8 dp 渐隐 | 【源码】`MarqueeText` |
| 加载占位 | 40×12 dp、80×10 dp outlineVariant 圆角条 | 【源码】`LoadingMediaDisplay` |
| 旋转 | 播放时 scallop 与环每 3000 ms 转 −36°（12°/s），环起点反向补偿。本库默认关闭；`rotate:true` 只能配 `ring:'circle'` 或 `'none'`（波浪环为原位预渲染，不能同相旋转，组合时编译报错） | 【源码】+【降级】 |

## 2. 布局（dp）

| 布局 | 方向 | 信息区顶 | 播放键顶 | 侧键（宽×高） | 标题宽 |
|---|---|---|---|---|---|
| round 233 | 横排 `[侧][80][侧]` | 32.5 | 76.5 | 52.5 × 54，外 17 / 内 7 | 155.5（66.72 % W） |
| pro 168×240 | 横排 | 36 | 80 | 34 × 54，外 **10** / 内 4【适配】（P2：为左侧直条电平留 2 dp） | 150（内容宽） |
| band10 130×320 | 纵排：播放键一行 + 两键行【适配】 | 44 | 94 | 54.2 × 52，间距 8 | 116.5 |
| band9 118×302 | 纵排【适配】 | 40 | 88 | 48.1 × 48 | 104.2 |

band 上按压侧键时播放键由 scallop 变为圆（没有横向挤压空间）【适配】；两键行内仍做 +12 / −12 dp 扩展。

## 3. 波浪进度环实现

- **轨道**：一张连续的整环图 `md_ring_t`（80 dp 方框，从起点间隙 gap/2 画到 T−gap/2，圆头），由按钮 scallop 外移 6 dp 得到（`media-geom.js` 的 `offset()`），同相、同心，**不旋转**。
- **指示**：环按波谷切成 10 段等弧长；每段的覆盖图在**最终位置**直接渲染（不使用 `transform: rotate`，避免 Vela 旋转重采样造成相位偏差和接缝）。第 k 段状态：未到 → 不显示；段内 j/4 → `md_rk_Pj`；到段尾及以后 → `md_rk_I`。
- **间隙**：除 100 % 外，覆盖图末端依次画：指示圆头（p·T−gap/2）、背景色擦除带（到 p·T+gap/2）、轨道色圆头，复现官方「指示—间隙—轨道」。第 k≥1 段覆盖图向前多画 gap/2+2 dp，盖住上一段的擦除带，因此相邻段无接缝。前提：环下方是纯黑背景（播放页默认）。
- **渲染**：轨道与指示都以填充轮廓（中心线 ±描边/2）加圆形端头输出，不用 SVG 描边——Chrome 在 1.625× 等分数缩放下对密集折线描边会留下亚像素裂缝。PNG8 量化的颜色距离同时比较「叠在黑底上」与「叠在白底上」的结果，避免半透明白边被映射成不透明灰点。
- **精度**：手表默认 40 档（2.5 %，40 张覆盖图），手环默认 20 档（5 %，20 张），可用 `steps` 改。只在档位变化时 setData。
- **检查**：逐档合成后沿中心线采样，只在间隙边缘 1 dp 内出现抗锯齿差异。模拟器截图逐 0.5° 测量环内缘到 scallop 外缘的最短距离（亚像素）：round 与 band10 在 0/25/50/75/100 % 下均匀度 ≤ 1 px，均值 4 dp；4× 放大与 golden 对照见仓库外的 `impl-p1/shape-fix2/`。

## 4. 包体（PNG8，字节）

| 资源 | round / pro | band10 / band9 |
|---|---|---|
| scallop + 禁用 | 1 601 | 1 271 |
| 播放/暂停 32 dp（含禁用 4 张） | 1 467 | 1 349 |
| 上一首/下一首（4 张） | 1 468 | 1 225 |
| 渐隐（2 张） | 330 | 310 |
| 环：轨道 1 张 + 覆盖图 40 张（40 档） | 17 659 | 15 166 |
| 环：轨道 + 20 张（20 档，手环默认） | 10 211 | 8 740 |
| ±5/10/30 s（12 张，按需只拷贝用到的） | 6 387 | 5 735 |

生成器只拷贝页面实际引用的 `md_*` 图片；不用媒体组件的页面不增加任何媒体资源（`tools/verify-library.js` 断言）。

## 5. 平台事实（模拟器 vela-watch-5.0 / vela-miwear-watch-5.0 实测）

- `@system.audio`：`play()` → PREPARED / STARTED，PCM 经 `/dev/audio/pcm0p`（16 kHz 单声道测试音）。没有 timeupdate，`getPlayState` 返回 `currentTime` / `duration`（**整数秒**）/ `percent`；适配器每 1000 ms 轮询（仅页面可见且播放中）。
- 播放结束后再次 `play()` 会从结尾“开始”（STARTED，位置停在 duration，不再触发结束）；适配器在结束后先 `currentTime = 0` 再播放。`onended` 在部分构建上不可靠，适配器同时以 `currentTime ≥ duration` 判定结束并停止轮询。
- 结束后系统 audio 服务自身仍以 1 Hz 查询播放器位置（日志 `audio_media_player_query_cb`），与应用 JS 轮询无关，应用层无法关闭（调用 `stop()` 才释放）。
- `<marquee>`：`scrollamount` 按 px/帧计；实测 round 127 px/s ≈ 63.6 dp/s、band10 103 px/s ≈ 63.4 dp/s，停顿 4.0–4.2 s，画面流 ≈ 56 fps（间隔均值 17.7–17.9 ms，最大 22–39 ms），无卡顿帧。
- 模拟器帧缓冲为 RGB565：#E9DDFF 显示为 (239,223,255)，对比 golden 时颜色差 ≤ 6 级属于显示格式，不是资源错误。
- 页面级 `onswipe` 在只有绝对定位子元素的全屏 div 上未触发（模拟器）；返回依赖系统手势 / `onBackPress`。

## 6. 与官方的差异

| 项 | 状态 |
|---|---|
| scallop / 环外形、相位、颜色、尺寸 | scallop 一致（按 `normalized()`，与 golden 叠图 IoU 0.96）；环【适配】为 scallop 外移曲线，波峰更圆、间隙处处 4 dp（官方 2.8–4.0 dp），外框 76×73.5 dp 与官方相同 |
| 进度连续性 | 【降级】按 2.5 % / 5 % 量化 |
| scallop 播放时旋转 | 【降级】默认关闭；`rotate:true` 用 30 步 CSS 旋转，仅限 circle / none 环 |
| 按压 scallop→pill 形变 | 【降级】端点切换（scallop 隐藏、pill 宽度过渡），环在按压时淡出 |
| Lottie 图标动画 | 上一首 / 下一首：enhanced 预渲染 9 帧（50 ms/帧，见 §9）；播放/暂停：【降级】直接切换静态帧 |
| 加载 shimmer | 【降级】透明度脉冲；加载环为旋转的 25 % 圆弧 |
| 跑马灯 | 原生 `<marquee>`，速度/停顿/间距按官方；API 1 无文字测量，溢出用字宽表估算【推导】 |
| 表冠调音量、封面取色、输出设备切换、Ambient | 做不了（无对应 API） |


## 7. P2：设置行 · 音量电平 · 圆形暂停环 · 播放页组合

复刻 Horologist `PlayerScreen`（MediaPlayerTestCase）组合：`media-settings` + `media-volume-level` + `media-player`，可选 `@system.volume` 适配器。固定参考仍为 `cdf245ceee02549a16d2da519a55e1e4d96777c3`（含 `audio/ui-material3`）。

### 7.1 暂停圆形环（选项 B）

暂停（`playing=false`）时官方 Morph 目标是 `circlePolygon`：64 dp 圆键 + 直径 76 dp、中心线半径 38 dp 的圆环，与播放态瞬间切换。

- **资源**：轨道 `md_cring_t`；覆盖图 `md_c0_{I,P1,P2,P3,Z}`、`md_c1_{I,P1,P2,P3}`、`md_c9_I`。
- **实现【适配】**：第 0 段与第 9 段结尾用原位图；第 2–9 段复用第 1 段图，按 `36°·(k−1)` 旋转（`transform-origin` 显式 px）。**永不使用**整环 CSS 旋转（选项 C）。
- **模拟器**：round / band10 在 q=5/13/21/29/33/37/39/40 与预渲染对照：峰值亮度恒定、无暗缝；中心线半径 std ≤ 0.5 px；宽度差 ≤ 1 px 抗锯齿。因此选用 **B**（非 A 的 20 档全量预渲染）。
- **0 %**：`md_r0_Z` / `md_c0_Z` = 起点 gap/2 处 4 dp 圆点，轨道从 1.5·gap 开始。

### 7.2 media-settings（VolumeButtonWithBadge + SettingsButton）

| 项 | 值 | 来源 |
|---|---|---|
| 胶囊 | 44×32 dp，容器 onSurface 24 %；禁用 16 % / 内容 38 % | 【源码】 |
| 触控区 | 48 dp 高，按钮 TopCenter 8 dp 落入 | 【源码】 |
| 徽章 | 七角星 `star(7, .75, .5)` 18 dp，primaryDim；图标 14 dp onPrimary（mute / down / up） | 【源码】 |
| 行 padding | 顶 ceil(1.2 % W)、左右 ceil(14.5 % W)；round / pro 两格均分 | 【源码】 |
| 手环位置 | 顶 254 / 238 dp，中心 ∓32 / ∓30 dp，半宽 clamp 到屏宽【适配】 | 【适配】 |
| left / right | `'output'\|'volume'\|'none'` / `'more'\|'none'`；回调 `mdOnOutput` / `mdOnMore` | 【适配】 |
| 输出图标 | 默认耳机；`mdSetOutput('watch'\|'headphones'\|'none')`；未连接强制 off | 【源码】+【适配】 |

没有表冠 / 旋钮事件：**不提供滑动调音量**；输出键走回调（P3 音量页再接）。

### 7.3 media-volume-level（StepperLevelIndicator）

| 项 | 值 |
|---|---|
| 颜色 | 指示 secondaryDim、轨道 surfaceContainer |
| 显示 | 每次事件 2500 ms（新事件重计时）；`displayIndicatorEvents` 的 drop(1) 由适配器保证首次 get 不显示 |
| 淡入 / 淡出 | 178 ms / 412 ms，`transition-property: opacity` + 拟合 `cubic-bezier(.18,0,.14,1)`（Vela 支持 opacity 过渡；无 animation-fill-mode） |
| 数值 tween | 500 ms CubicBezier(0,0,0,1)；重新进入时 snap |
| round | 复用 Stepper 弧形资源（sweep 72°、描边 6、边 2、间隙 3） |
| pro / 手环 | **直条**【适配】：宽 6 dp、长 ≈ 2·sin(36°)·(W/2−5)+6，自下而上填充，接合处 3 dp 间隙；短于间隙时画圆点 |

### 7.4 media-player 与音量适配器

- `media-player`：一行组合 电平（可选）+ MediaInfo + 控制行 + 设置行（可选）+ TimeText；`mdSetState('playing'|'paused'|'loading'|'none'|'disconnected')`。
- `media-volume`（可选，`system.volume`）：`mdvShow` → getMediaValue（只更新徽章）+ onMediaValueChanged（触发电平）；`mdvHide` 解除；`mdvSet(v)` 写系统音量并显示电平。

### 7.5 P2 包体增量（PNG8，字节；examples/media 播放页实测）

| 布局 | 全套 md_*（库资源） | 播放页拷贝 img | enhanced release rpk | enhanced debug rpk |
|---|---|---|---|---|
| round | 43 511 | 69 343 | 203 169 | 228 548 |
| pro | 同 round 媒体图 38 202（无弧） | 35 474 | 161 368 | 186 312 |
| band10 | 37 992 | 23 062 | 142 496 | 167 440 |
| band9 | ≈ band10 | 23 060 | 142 616 | 167 579 |

相对 P1：round release ≈ +35 KB（设置/徽章/圆环/四页内联 JS）；消费者若只生成单播放页，体量明显小于本 examples 四页包。16 组 debug+release 构建 warn = 0。

### 7.6 与官方的新增差异

| 项 | 状态 |
|---|---|
| 暂停圆形环 | 外形一致；分段旋转复用【适配】，模拟器无接缝 |
| 设置行 / 徽章 / 输出图标 | 一致；手环位置【适配】 |
| 音量电平 | round 弧一致；pro / 手环改直条【适配】；淡入淡出与 2.5 s 规则一致 |
| 滑动 / 表冠调音量 | 不做（无 API）；输出键回调 |
| Ambient / 封面取色 / 真实输出设备枚举 | 做不了 |

## 8. P3：音量页 volume-screen（VolumeScreen）

来源：Horologist `audio-ui-material3` `VolumeScreen.kt`、`VolumeLevelIndicator.kt`、`components/DeviceButton.kt`；androidx `Stepper.kt`。golden：`volume_min` / `volume_max` / `volume_speaker` / `volume_label`。

| 部件 | 规格 | 本库 |
|---|---|---|
| Stepper | 上 / 内容 / 下 = 0.35 / 0.3 / 0.35，竖向 padding 5.2 % H；键 60×48 dp，primaryContainer，图标 VolumeUp / VolumeDown 24 dp primary【源码】 | 复用库内 Stepper（range.tpl 几何、按压 12600 / 260 弹簧、长按 500 ms 后每 60 ms 连发）；新增 primary 音量图标 `md_vs_up/down_24(d)` |
| 端点 | 0 时下键禁用，最大值时上键禁用 | 一致（禁用底 #1E1C1F、图标 onSurface 38 %） |
| 电平 | StepperLevelIndicator，常显，值变化 tween 500 ms | round 复用 media-volume-level 弧；pro / 手环 6 dp 直条【适配】（同 P2）；音量页不做 2.5 s 隐藏 |
| DeviceButton | Button 52 dp，primary / onPrimary，图标 24 dp + 6 dp + 名称（labelMedium，maxLines 2），左右外边距 18 dp | round 一致；外边距 pro 14 dp、手环 18 dp（与左侧直条留出 ≥10 dp 间距）【适配】；手环去掉图标、名称单行省略【适配】；名称 bold（Vela 只有 normal / bold，Medium 取 bold 更接近 golden） |
| 标签 | 「Volume」labelMedium | 「音量」，15 dp bold |
| 表冠 | rotaryScrollable 调音量 | 做不了（无 rotary 事件） |
| 输出切换 | DeviceButton 打开输出选择 | 只回调 `volOnDevice()`（无音频路由接口） |

步数：`volSetup({max})`，默认 0–10；每步 `setMediaValue(round(v/max,2))`。range.js 新增可选钩子：页面定义 `rangeChanged(v)` 时，`stepUp` / `stepDown` 交给它处理（否则照旧 `updateRange()`），并支持 `stepMax`（缺省 10），对既有 Stepper 无行为变化。

### 8.1 包体（PNG8，字节）

| | round | pro | band10 | band9 |
|---|---|---|---|---|
| 新增图片（md_vs_* + md_dev_*） | 2,569 | 2,569 | 2,352 | 2,352 |
| examples/media enhanced release rpk（P2 → P3，多了两个音量页） | 203,169 → 239,983 | 161,368 → 204,265 | 142,496 → 180,425 | 142,616 → 180,093 |

rpk 增量主要来自两个新页面各自内联的控制器 JS（media / range / base）；手环页面也会带上 Stepper 弧形资源 `lv_*`（range.head.js 常量引用，约 3 KB），只用直条时未使用。

### 8.2 与官方的差异

| 项 | 差异 |
|---|---|
| 电平 | pro / 手环直条【适配】 |
| DeviceButton | 手环无图标、名称单行省略；外边距 pro 14 dp / 手环 18 dp【适配】；字重 bold |
| 表冠 / 输出切换 | 不做（无 API），回调代替 |
| 文案 | 「音量」、默认设备名「耳机」/「手表扬声器」 |


## 9. P4：播放页下滑 · 操作区 · 队列 · 输出选择 · 按压挤压 · Lottie 帧

### 9.1 结构

- 官方：Horologist 没有输出选择页面，设备键调用 `OutputSwitcher.launchSystemMediaOutputSwitcherUi`（系统 Settings `MEDIA_OUTPUT` 面板，闭源）；队列 / 操作区最接近 `screens/entity/EntityScreen`（header + buttonsContent + items，列表项 `FilledTonalButton` 单行省略）。`PlayerLibraryPagerScreen` 是横向 Pager；参考截图（YouTube Music）是播放页下方的纵向续页。
- 本库：`MediaColumn` = 一条纵向 `<scroll>`，第一屏是完整 PlayerScreen，下面接 media-actions（头部 + 3 个 IconToggleButton + 「接下来播放」Card）与 media-queue。电平、ScrollIndicator、TimeText 放在 scroll 外。Vela 的 `onswipe` / `router.back` 在模拟器不可靠，scroll 是唯一可靠的“下滑”手势【适配】。
- 输出选择 `media-output-picker`：音量页设备键 `router.push('pages/output')`；Vela 不能枚举或切换输出，选中只回调 `opOnSelect(id)`（示例写入 `$app.$def.mediaOutput`，音量页返回时显示名称）。
- 尺寸（dp）：头部 56（标题 16/20 粗体、歌手 14/18 粗体，单行省略）；按钮行 52（手环 44）+ 8 间距，3 键等分、间距 4；卡片 74（标题 16 粗体 + 内容 14/16 两行，图标 24，手环无图标）；队列项 52 + 4（曲名 15/18 粗体，次要 13/16；手环 13 / 11）；输出项最小 52（名称手表 2 行、手环 1 行，图标 24 + 6，手环无图标）；脚注 bodySmall 12/14，左缩进 16。图标 Material Symbols Rounded（thumb_up / thumb_up 填充 / shuffle / repeat / repeat_one / queue_music / smartphone / watch / headphones / speaker / bluetooth），`tools/media-p4-assets.js` 导出。

### 9.2 按压挤压

| 控件 | 官方 | 本库 |
|---|---|---|
| IconButton（`icon-button`、`.m3.tpl` IconButton 族） | `IconButtonDefaults.animatedShapes()`：CornerFull → `shapes.small`（8 dp），按下 fastSpatial.faster(200)（12600）、抬起 slowSpatial（260） | 同参数，`sqPress` 临界阻尼精确解 |
| IconToggleButton（点赞 / 随机 / 循环） | 未选中 CornerFull、选中 `shapes.medium`（18 dp）、按下 `shapes.small`；按下 fastEffects（3800）、抬起 defaultSpatial（700，阻尼 0.9） | 同形状；抬起取临界阻尼（无 0.9 的轻微过冲）【降级】 |
| Button（`button`、FilledTonalButton、队列 / 输出项、DeviceButton） | Wear M3 `Button` 无 pressedShape（静态 stadium + ripple） | 按需求套用 IconButton 的 CornerFull → 8 dp【适配】 |
| SettingsButton（设置行） | 静态 CircleShape + ripple | 同上挤压【适配】；禁用时不响应 |
| 「接下来播放」Card | ripple | 8 % 透明度状态层 |

basic / enhanced 都能逐帧改 `border-radius`（band10 模拟器两种 API 实测）。

### 9.3 播放页动效审计（Horologist `AnimatedMediaControlButtons` / `AnimatedPlayPauseProgressButton`）

| 动效 | 官方 | 本库 | 状态 |
|---|---|---|---|
| 播放 ↔ 暂停形状（scallop ↔ circle） | Morph 缓存，`morphProgress` 停在 1 → 瞬间切换 | 瞬间切换 | 一致 |
| ButtonGroup 按压扩展 | `animateWidth`：+12 dp / 邻键 −12 dp，fastSpatial×2（5600）/ slowSpatial（260） | `transition: width` + 拟合贝塞尔（误差 ≤ 2.8 %） | 一致（近似） |
| 按压 scallop → pill 形变 | `animatedScallopShapeProgress` 连续 morph | 端点切换，环淡出 | 【降级】 |
| 播放中 scallop / 环旋转 | 每 3000 ms −36° | 默认关；`rotate:true`（circle / none 环）30 步 | 【降级】 |
| 波浪进度环 | 连续 | 2.5 % / 5 % 量化 | 【降级】 |
| 播放 / 暂停图标 Lottie（M3PlayPause） | 约 167 ms 帧动画 | 静态帧切换 | 【降级】（同法预渲染约 +8 KB，未做） |
| 上一首 / 下一首 Lottie（M3Next，30 帧 60 fps = 500 ms；上一首镜像） | 点击后从 0 播放 | **enhanced**：每 3 帧取 1（帧 3…27），9 帧 × 50 ms，按墙钟取帧；帧预挂载，松手即开始，页面回调推迟 180 ms；basic 保持静态 | 一致（近似，§9.4） |
| 加载占位 shimmer | shimmer | 透明度脉冲 + 旋转弧 | 【降级】 |
| 跑马灯 | 64 dp/s、停 4 s | 原生 marquee 同参数 | 一致 |
| 音量电平淡入 / 淡出 / 补间 | 178 / 412 / 500 ms | 同 | 一致 |
| 设置行按压 | ripple | 挤压（§9.2） | 【适配】 |

### 9.4 Lottie 帧包体与实测

- `tools/media-lottie.js` 用 lottie-web 渲染 `tools/lottie/M3Next.json`（Apache-2.0，Horologist），onPrimary 32 dp，上一首水平镜像；只在 enhanced 且侧键为 prev / next 时引用（basic 不拷贝）。
- PNG8：18 张，round / pro 6 765 B，band10 / band9 5 875 B。release rpk 中 enhanced 比 basic 多约 10.5 KB（round）/ 9.6 KB（band），含每个文件的打包开销。
- P4 整体（release rpk，相对 44fb069 的媒体示例；新增输出页、操作区、队列、18 个 Material Symbols 图标约 7.8 KB）：

| 设备 | basic | enhanced（含 Lottie） |
|---|---|---|
| round | 240 354 → 267 409 B（+27.1 KB） | 240 390 → 277 910 B（+37.5 KB） |
| pro | 204 633 → 230 804 B（+26.2 KB） | 204 667 → 241 318 B（+36.7 KB） |
| band10 | 180 772 → 205 822 B（+25.1 KB） | 180 812 → 215 450 B（+34.6 KB） |
| band9 | 180 448 → 205 510 B（+25.1 KB） | 180 492 → 215 157 B（+34.7 KB） |
- 起播延迟（P5 修复，round enhanced 模拟器，60 fps 录屏逐帧比对 9 张帧图，时间从松手算起）：
  - 原因：Vela 把 touchend 与 click 连着派发、两者之后只渲染一次；click 里的换曲（标题、跑马灯重建、按键、操作区）在模拟器上要约 100 ms 渲染，所以第一帧与新标题同一帧出现，帧 1–3 被挤掉（帧间隔只有 17–33 ms）。图片解码不是主因：预挂载前后首帧时间相同。
  - 修复：① 9 帧预挂载在静态图标上方（`<stack>`，md-fo / md-fi 切 opacity；只删 class 时 Vela 不恢复 opacity，所以总是成对替换），点击时不换 src、不解码；② enhanced 的 prev / next 页面回调推迟 180 ms（`mdTapFlush`：再次点击或页面隐藏时立即执行，不丢点击），可见的帧 2–4 先按 50 ms 节奏播完，换曲落在其后【适配】。
  - 实测：修复前首帧 +146 / +154 / +221 ms，且与换曲同帧；修复后 +115 / +125 / +137 ms，帧 2–4 间隔 33–67 ms，与按压扩展（按下后 +127–192 ms 才上屏）同属模拟器的输入→显示基线。代价：标题在松手后 +328–381 ms 才换（原 +146–221 ms）。
  - 「只看到 3–4 帧」是 M3Next 本身：帧 15 以后与静态图标只差几个像素，录屏里 9 帧都出现过（`impl-p4/out/p5_lottie_next_before_after.png`）。
