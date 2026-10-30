# 媒体控件规格（P0 冻结 · P1 实现）

[组件指南](COMPONENTS.md#媒体控件) · [生成器 API](API.md)

复刻对象：Horologist `media/ui-material3` 的 **Animated** 组合（官方 golden 截图所用：scallop 播放键 + 波浪进度环 + 胶囊侧键 + 标题/副标题），固定版本 `google/horologist@cdf245ceee02549a16d2da519a55e1e4d96777c3`；ButtonGroup / MotionScheme 取自本库已固定的 `androidx/androidx@2f557dc1f1ec71edae73e2c16b0e446523c644b7`。全部常量集中在 `tools/media-geom.js`（`SPEC`），资源由 `tools/media-assets.js`（Chrome 渲染）+ `tools/media-quant.py`（PNG8）生成。

标注：**【源码】** Kotlin 常量；**【推导】** 由源码公式计算；**【适配】** Vela / 非圆屏自拟；**【降级】** 官方行为做不到时的替代。

## 1. 冻结常量

| 项 | 值 | 来源 |
|---|---|---|
| 播放键格 | 80 dp（大屏；小屏 64 dp）。四种布局按 `screenHeightDp > 224` 均为大屏 | 【源码】`Constants.kt` / `LargeScreen.kt` |
| 内 scallop | `pillStar(10, innerRadiusRatio 0.82)`，圆角 8 dp，`normalized()` 后最大边 = 80−2·8 = 64 dp | 【源码】`AnimatedPlayPauseButton.kt` |
| 波浪进度环 | `pillStar(10, 0.8)`，圆角 12 dp，最大边 80−4 = 76 dp，描边 4 dp 圆头；与 scallop 同相（12 点钟为波谷） | 【源码】`RotatingWavyProgressIndicator.kt` |
| 指示/轨道间隙 | gap = 0.006 × 周长 + 描边（周长 242.3 dp → 5.45 dp） | 【源码】同上 |
| 归一化 | RoundedPolygon `normalized()` 按**较大边**缩放并居中：10 瓣、12 点为波谷 → 宽（波峰到波峰）= 64 / 76 dp，高（波谷到波谷）= 61.5 / 73.0 dp。golden 实测 scallop 63×61 dp、环外径 80 dp | 【源码】+ golden 测量 |
| 颜色 | 键 primary、图标 onPrimary、侧键 primaryDim、指示 onSecondaryContainer、轨道 surfaceContainerLow、禁用 onSurface 12 % / 38 % | 【源码】`MediaButtonDefaults` / `ProgressIndicatorDefaults` |
| 图标 | 播放/暂停/下一首 32 dp（`LottiePlaceholders.kt` 静态帧路径，上一首为镜像）；±5/10/30 s 24 dp（Material Symbols replay_N / forward_N） | 【源码】 |
| ButtonGroup | 侧格 `weight(1)`、中格 `weight(.5)+minWidth 80`；侧键内边距 外 7.1 % H、内 3 % H、上下 5.2 % H；按压扩展 12 dp（中格被按时两侧各 −6） | 【源码】`ButtonGroupLayout.kt` / `ButtonGroup.kt` |
| 按压动效 | 按下 fastSpatial ×2 = 刚度 5600、抬起 slowSpatial 260，临界阻尼；Vela 用 `transition: width` + 拟合三次贝塞尔（100 ms `cubic-bezier(.18,0,.06,1)`，450 ms `cubic-bezier(.18,0,.08,1)`，最大误差 2.8 % / 2.4 %） | 【源码】+【推导】 |
| 文字 | 标题 titleMedium 16 dp / 行高 20，副标题 bodyMedium 14 dp / 18；round 宽 66.72 % / 71 % W；溢出省略号 + 右侧 8 dp 渐隐 | 【源码】`TextMediaDisplay` |
| 跑马灯 | 64 dp/s、每轮停 4000 ms、首尾间距 96 dp、两侧 8 dp 渐隐 | 【源码】`MarqueeText` |
| 加载占位 | 40×12 dp、80×10 dp outlineVariant 圆角条 | 【源码】`LoadingMediaDisplay` |
| 旋转 | 播放时 scallop 每 3000 ms 转 −36°（12°/s），本库默认关闭 | 【源码】，可选 `rotate:true` |

## 2. 布局（dp）

| 布局 | 方向 | 信息区顶 | 播放键顶 | 侧键（宽×高） | 标题宽 |
|---|---|---|---|---|---|
| round 233 | 横排 `[侧][80][侧]` | 32.5 | 76.5 | 52.5 × 54，外 17 / 内 7 | 155.5（66.72 % W） |
| pro 168×240 | 横排 | 36 | 80 | 34 × 54，外 6 / 内 4【适配】 | 150（内容宽） |
| band10 130×320 | 纵排：播放键一行 + 两键行【适配】 | 44 | 94 | 54.2 × 52，间距 8 | 116.5 |
| band9 118×302 | 纵排【适配】 | 40 | 88 | 48.1 × 48 | 104.2 |

band 上按压侧键时播放键由 scallop 变为圆（没有横向挤压空间）【适配】；两键行内仍做 +12 / −12 dp 扩展。

## 3. 波浪进度环实现

- **轨道**：一张连续的整环图 `md_ring_t`（80 dp 方框，从起点间隙 gap/2 画到 T−gap/2，圆头），与 scallop 同一套 `pillStar` 数学、同相、同心，**不旋转**。
- **指示**：环按波谷切成 10 段等弧长；每段的覆盖图在**最终位置**直接渲染（不使用 `transform: rotate`，避免 Vela 旋转重采样造成相位偏差和接缝）。第 k 段状态：未到 → 不显示；段内 j/4 → `md_rk_Pj`；到段尾及以后 → `md_rk_I`。
- **间隙**：除 100 % 外，覆盖图末端依次画：指示圆头（p·T−gap/2）、背景色擦除带（到 p·T+gap/2）、轨道色圆头，复现官方「指示—间隙—轨道」。第 k≥1 段覆盖图向前多画 gap/2+2 dp，盖住上一段的擦除带，因此相邻段无接缝。前提：环下方是纯黑背景（播放页默认）。
- **精度**：手表默认 40 档（2.5 %，40 张覆盖图），手环默认 20 档（5 %，20 张），可用 `steps` 改。只在档位变化时 setData。
- **检查**：逐档合成后沿中心线采样（round 40 档 × 970 点），只在间隙边缘 1 dp 内出现抗锯齿差异；模拟器 4× 放大与 golden 对照见仓库外的 `impl-p1/shape-fix/`。

## 4. 包体（PNG8，字节）

| 资源 | round / pro | band10 / band9 |
|---|---|---|
| scallop + 禁用 | 1 600 | 1 273 |
| 播放/暂停 32 dp（含禁用 4 张） | 1 502 | 1 336 |
| 上一首/下一首（4 张） | 1 495 | 1 249 |
| 渐隐（2 张） | 340 | 310 |
| 环：轨道 1 张 + 覆盖图 40 张（40 档） | 18 433 | 15 802 |
| 环：轨道 + 20 张（20 档，手环默认） | 10 616 | 9 090 |
| ±5/10/30 s（12 张，按需只拷贝用到的） | 6 431 | 5 662 |

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
| scallop / 环外形、相位、颜色、尺寸 | 一致（按 `normalized()` 修正后与 golden 叠图 IoU：填充 0.96、轨道 0.86，余差为抗锯齿与 RGB565） |
| 进度连续性 | 【降级】按 2.5 % / 5 % 量化 |
| scallop 播放时旋转 | 【降级】默认关闭；`rotate:true` 用 30 步 CSS 旋转（环不转） |
| 按压 scallop→pill 形变 | 【降级】端点切换（scallop 隐藏、pill 宽度过渡），环在按压时淡出 |
| Lottie 图标动画 | 【降级】直接切换静态帧 |
| 加载 shimmer | 【降级】透明度脉冲；加载环为旋转的 25 % 圆弧 |
| 跑马灯 | 原生 `<marquee>`，速度/停顿/间距按官方；API 1 无文字测量，溢出用字宽表估算【推导】 |
| 表冠调音量、封面取色、输出设备切换、Ambient | 做不了（无对应 API） |

音乐播放页（播放键 + 上/下一首 + 信息区）实际拷贝：round 40 档 ≈ 23.4 KB、band10 20 档 ≈ 13.3 KB。
