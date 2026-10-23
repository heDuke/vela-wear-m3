# 历史交接 README（保留原记录，非当前发布状态）

> 2026-10-24 更新：本轮组件重整、band 九页重排、验证范围与未达标项见 [实施记录](docs/UI-REWORK-2026-10-24.md)。下文保留上一轮记录。

# M3演示（com.velam3.demo）— Wear OS Material 3 组件 / 布局 / 动画 Demo（小米 Vela JS 快应用）

> **本轮 UI 进展（2026-10-23）**：当前源代码已增加 Stepper、LevelIndicator、横纵分页、Arc TimeText、开关四类变体及 API 1 / API 2 动效配置。构建方式、兼容差异、包体预算和未完成的设备验收见 [UI 实现记录](docs/UI-IMPLEMENTATION.md)。全量安装包由 `npm run build:all` 生成 16 个，再运行 `node tools/package-builds.js` 生成下载压缩包。下文部分历史截图和体积数字为交接前基线。


这是一个**可运行的** Vela JS 快应用演示：把 Wear OS Material 3（Compose for Wear OS M3）的常用组件、基础布局和动效，按 Vela 的能力边界（只有 flex、只有类选择器、无 canvas 动画、prompt 只有 Toast……）实现出来，并为 4 种屏幕分别出包。

## 1. 内容

启动页（Launcher）= TimeText + ListHeader + TransformingLazyColumn（边缘缩放/淡出）+ ScrollIndicator，列出 8 个分区：

| 分区 | 演示内容 |
|---|---|
| 按钮 | Filled / FilledTonal / Outlined / Child 按钮；图标容器 + 主标签 + 次级标签；IconButton（填充/色调/描边）；CompactButton；禁用态；按压缩放反馈 |
| 卡片 | Card、TitleCard、AppCard、OutlinedCard |
| 列表 | ListHeader + TransformingLazyColumn（可用开关切换"边缘缩放/淡出"开/关作对比）+ ScrollIndicator（圆屏弧形，其它屏直条） |
| 边缘按钮 | EdgeButton（Small 56dp，距底 3dp）+ 渐变遮罩；滚到列表底部时滑入/淡入；点击弹出 Confirmation |
| 时间 | 弯曲 TimeText（圆屏/胶囊屏逐字旋转，矩形屏直排）、实时大时钟、秒进度（圆屏 `<progress type="arc">` 贴边一圈，其它屏横条）、12/24 小时切换 |
| 开关与选择 | SwitchButton、CheckboxButton、RadioButton 单选组、InlineSlider（−/分段/+）；并排放了原生 `<switch>` / `<slider>` 作对比 |
| 对话框 | AlertDialog（图标、标题、正文、圆角方形取消 + 旋转 −45° 胶囊确认）、Confirmation（旋转 45° 色块 + 对勾 + "已保存"，自动消失）、系统 Toast |
| 动画 | 不确定进度（旋转 PNG 弧）、确定进度（arc progress）、@keyframes 缩放/淡出/弹跳（循环）、transition 宽度 / 背景色、"重播动画" |

通用动效：页面进入（淡入 + 0.9→1 缩放，350ms emphasized decelerate）、返回退出（右移 + 淡出 220ms）、按压反馈（scale 0.95，100ms 按下 / 300ms 回弹）、对话框缩放 + 淡入、Confirmation 弹出 + 2.2s 自动消失、列表项 TLC 缩放。

## 2. 目录结构

```
vela-demo/
├─ template/              ← 真正的源码（带预处理指令的模板），不要直接改 src/
│  ├─ manifest.tpl.json   ← 生成 src/manifest.json（designWidth = 物理宽度）
│  ├─ app.ux.tpl
│  ├─ common/m3.js        ← TLC 计算、ScrollIndicator 位置、工具函数（纯函数）
│  ├─ pages/<分区>/<分区>.ux.tpl
│  └─ partials/           ← 公共片段：m3.css（M3 token→类）、timetext/scrollind/backbtn/dialog/confirm 模板、base*.js 页面公共逻辑
├─ tools/
│  ├─ devices.json        ← 4 种设备：round 466×466 / pro 336×480 / band10 212×520 / band9 192×490
│  ├─ gen.js              ← 预处理器：template/ → src/（按设备换算 dp→px、条件编译、CSS 摇树、只拷贝用到的图片）
│  ├─ assets.js / quant.py← 生成图标 PNG（Material Symbols）并量化成 PNG8
│  ├─ build-all.sh        ← 4 个设备依次 gen + aiot build（debug）+ aiot release，输出到 out/
│  ├─ emu-drive.js        ← 通过模拟器 gRPC 点击/滑动/截图/录屏（--settle：等画面稳定再点击）
│  ├─ overview.py         ← 截图拼成 out/screens_overview.png
│  └─ tour.js             ← 生成演示脚本（录视频、截图用）
├─ assets/<设备>/         ← 各设备 PNG 资源
├─ src/                   ← gen.js 生成的、交给 aiot 打包的快应用源码（最后一次 gen 的设备）
├─ sign/                  ← release 用自签名证书（private.pem / certificate.pem）
└─ out/                   ← 产物：rpk、截图、视频
```

模板语法（gen.js）：`$(N)` = N dp 换算成 px；`$[表达式]` = 按设备上下文求值；`<!-- #if round -->…<!-- #else -->…<!-- #endif -->`、`#include 片段`、`#set 变量=值`（也可写在 `/* */`、`//` 注释里）。

## 3. 构建

```bash
npm install                      # 需要 Node 18+
bash tools/build-all.sh          # 4 个设备全部出包 → out/velam3demo-<设备>-{debug,release}.rpk
# 或者单个设备：
node tools/gen.js band10 && npx aiot build      # dist/com.velam3.demo.debug.1.0.0.rpk
node tools/gen.js round  && npx aiot release    # 用 sign/ 下的自签名证书
```

设备与包的对应：

| 设备 | 文件 |
|---|---|
| 圆屏手表 466×466（Xiaomi Watch S 系列等） | out/velam3demo-round-*.rpk |
| 小米手环 10 212×520 | out/velam3demo-band10-*.rpk |
| 小米手环 8 Pro / 9 Pro 336×480 | out/velam3demo-pro-*.rpk |
| 小米手环 9 192×490 | out/velam3demo-band9-*.rpk |

所有包的包名都是 `com.velam3.demo`，同一设备只装对应屏幕的那个。

## 4. 安装到真机（AstroBox 侧载）

1. 手机安装 AstroBox，并按其说明与手表/手环配对（需要设备已能使用第三方快应用安装）。
2. 把对应设备的 **debug** 包（`velam3demo-<设备>-debug.rpk`，用工具链内置调试证书签名）传到手机。
3. AstroBox →"安装第三方应用/快应用"→ 选择该 rpk → 等待传输完成。
4. 在设备应用列表中打开"M3演示"。

说明：release 包用的是本仓库 `sign/` 下的自签名证书，仅用于验证 `aiot release` 流程；正式上架需换成小米开放平台签发的证书。

## 5. 在模拟器里运行

用 aiot-toolkit 的 Vela 模拟器（vela-watch-5.0 镜像）：
```bash
adb push out/velam3demo-round-debug.rpk /data/app/com.velam3.demo.rpk
adb shell pm install /data/app/com.velam3.demo.rpk
adb shell am start com.velam3.demo
```
注意：调试包启动时会先等待调试器约 10 秒才显示页面；这个模拟器镜像里切换第二个应用时调试服务可能崩溃，遇到时重启模拟器即可。
模拟器没有系统返回手势，所以每个分区底部都放了一个"返回"CompactButton；真机上右滑返回会走 `onBackPress`（有覆盖层时先关闭覆盖层，再播放退出动画后返回）。

## 6. 与 Wear M3 的差异 / 降级方案

| M3 特性 | 本 Demo 做法 | 原因 |
|---|---|---|
| 弯曲 TimeText | 每个字符一个 div，绕屏幕中心旋转（transform-origin 设在元素外） | 没有沿路径排字；`<text>` 本身的 transform 不生效，要包一层 div |
| ScrollIndicator 弧形 | 预渲染的弧形轨道 PNG + 滑块 PNG 绕屏幕中心旋转 | 没有 canvas 动画 |
| TransformingLazyColumn | 监听 list 的 `scroll`（scrollY 是绝对偏移），按 androidx ResponsiveTransformationSpec 计算每项缩放/透明度，用 style 对象写 transform | 无内置 |
| 不确定圆形进度 | 弧形 PNG + @keyframes 旋转 | 无原生不确定 arc |
| EdgeButton 形状 | androidx 实际轮廓预渲染 PNG + 图标叠加 | 不能画任意形状 |
| 对话框 / Confirmation | 页面内全屏覆盖层 + 动画 | prompt 只有 showToast |
| 字体 / 字重 | 只有 normal/bold，无 letter-spacing | Vela 限制 |
| transform 动画 | 只用 @keyframes（0% 和 100% 必写）；transition 只用于 width / background-color | transform 不能 transition |
| transform-origin | 每个缩放/旋转的类都显式写像素原点 | Vela 默认原点是左上角 |
| 返回 | 页面"返回"按钮 + onBackPress | 模拟器无返回手势 |
| 胶囊屏字号 | labelM 13dp、labelS 11dp、titleM 15dp（k = 1.625 px/dp） | 窄屏 |

## 7. 产物（out/）

| 文件 | 说明 |
|---|---|
| velam3demo-<设备>-debug.rpk | 调试签名包（AstroBox 侧载用这个） |
| velam3demo-<设备>-release.rpk | 自签名 release 包 |
| demo_round.mp4 / demo_band10.mp4 | 60 秒演示视频，**真实 Vela 模拟器**（vela-watch-5.0 镜像）录制，H.264 / yuv420p / 30fps，原生分辨率 |
| screens/round_*.png, screens/band10_*.png | 各分区截图（模拟器原生分辨率） |
| screens_overview.png | 截图总览 |
| build-log.txt | 各设备包大小与构建告警 |

录制方法：`node tools/gen.js <设备>` → `node tools/tour.js <设备> - video > tour.json` → `node tools/emu-drive.js <gRPC端口> tour.json --settle --record out.mp4 --w W --h H`。
视频为了控制在 60 秒内，演示脚本跳过了"卡片"页（截图里有）；所有点击都是通过模拟器 gRPC 注入的真实触摸事件。

## 8. 已知问题 / 需要真机确认

- 包体：release 约 72–81KB、debug 约 92–102KB，超过"~50KB"的建议值。原因是 9 个页面各自内联一份 CSS + 公共逻辑（Vela 页面之间不共享样式），图片约 18–24KB。已做：PNG8 量化、只打包引用到的图片、CSS 摇树。
- 模拟器渲染比输入慢约 0.5 秒（软件渲染），视频里滚动有拖影；真机流畅度需实测，尤其是 TLC（每次滚动事件都会更新所有列表项的 transform/opacity）。
- 运行日志里每个页面会打印 `Unknown style - keyframes`，但 @keyframes 动画实际都能播放。
- 右滑返回 / 物理键返回、振动（system.vibrator）、Toast 外观、AstroBox 安装流程只能在真机上验证。
- band9 / pro 两个包只做了编译，没在模拟器里跑过。
