# AGENTS.md — vela-m3（Wear OS Material 3 for Xiaomi Vela JS 快应用）

> 给 coding agent（OpenAI Codex 等）的工作说明。中文为主，关键术语保留英文。**先读本文件，再读 `docs/HANDOFF.md`。**
> 用户写中文：回复、文档、commit 说明都用中文；代码标识符、文件名用英文。

## 1. 项目是什么 / 下一步目标

- **现状**：`com.velam3.demo`，一个可运行的 Vela JS quickapp demo，把 `androidx.wear.compose.material3`（Wear M3）的组件、布局、动效按 Vela 能力边界实现，并为 4 种屏幕分别出包（round 466×466、pro 336×480、band10 212×520、band9 192×490）。
- **新目标（Goal）**：把它做成**独立、可复用的 Wear M3 组件库**（暂名 `vela-m3`），给其他 Vela JS 快应用开发者安装 / 拷贝进自己的项目使用；本 demo 保留为该库的 **gallery / consumer app**。路线图与里程碑见 `docs/HANDOFF.md` §3–§4。

## 2. 用户偏好（必须遵守）

1. **Faithful Wear M3 look**：外观以 androidx Wear Compose Material3 为准（颜色、字号、形状、尺寸、动效），不要"差不多就行"，不要自创风格。
2. **全设备适配**：手环胶囊屏（band10 / band9）+ Pro 矩形屏（pro）+ 圆屏手表（round）都必须可用、好看。
3. **UI 改动必须给图**：每次改 UI 都要产出预览图 / 模拟器截图（至少 round + band10；pro / band9 没有 AVD 时说明原因并补建 AVD 或给预览图），放进 `docs/screenshots/` 或 PR 说明里。
4. **Vela-legal only**：只用官方文档里存在的组件 / 样式 / 接口（`docs/VELA_DEV_SPEC.md`；冲突时**官方文档优先**：https://github.com/hefeishui0829/xiaomi-vela-docs 的 `01-official-quickapp-js/`）。查不到 = 不支持。

## 3. Repo map

```
AGENTS.md            ← 本文件
README.md            ← 中文用户说明（内容、构建、安装、M3 差异、已知问题）
package.json         ← scripts: gen:<dev> / build / release / build:all / assets；devDeps: aiot-toolkit ^2.0.5, @aiot-toolkit/jsc
template/            ← ★ 真正的源码（带预处理指令）。只改这里
  manifest.tpl.json  ← → src/manifest.json（designWidth = 设备物理宽度 W）
  app.ux.tpl
  common/m3.js       ← 运行时纯函数：TLC 缩放/透明度、ScrollIndicator 位置、pad2、DEV 常量
  pages/<page>/<page>.ux.tpl   ← index buttons cards list edge time toggles dialogs motion
  partials/          ← m3.css（token→class）、timetext/scrollind/backbtn/dialog/confirm 片段、base*.js（页面公共逻辑）、overlay.css、confirm.css/js
tools/
  devices.json       ← 4 个 device group：W/H/shape(circle|rect|pill)/k(px per dp：round/pro 2.0，band 1.625)
  gen.js             ← 预处理器 template/ → src/：$(N)=N dp→px，$[expr]，#if/#elif/#else/#endif，#include，#set；CSS tree-shaking；只拷贝被引用的 PNG
  tokens.js          ← ★ Wear M3 颜色 C / 字体 T 令牌（androidx ColorTokens/PaletteTokens/TypeScaleTokens）
  geom.js            ← EdgeButton 形状、Padding（5.2%W / 10%H）、TLC ResponsiveTransformationSpec（androidx 源码）
  assets.js          ← Playwright+Chrome 渲染 PNG（Material Symbols 图标、EdgeButton、scrim、spinner、圆屏 ScrollIndicator 弧、logo）→ assets/<dev>/；会删除重建 assets/<dev>/
  quant.py           ← PNG8 量化（Pillow），写 assets/sizes.json
  icons/*.svg        ← Material Symbols Rounded（Apache-2.0）源 SVG
  v3/assets/<dev>/   ← 从 v3 预览管线复用的 PNG（assets.js 读取，见 tools/v3/README.md）
  build-all.sh       ← 4 设备 × (aiot build + aiot release) → out/velam3demo-<dev>-{debug,release}.rpk + out/build-log.txt
  gen-sign.sh        ← 生成 sign/ 自签名证书（build-all 在缺失时自动调用）
  emu-drive.js       ← 经模拟器 gRPC 注入触摸/按键、截图、录屏（ffmpeg）
  tour.js            ← 生成演示脚本（emu-drive 步骤 JSON）
  overview.py        ← 截图拼总览图
assets/<dev>/*.png   ← 各设备 PNG（已量化，已提交）；assets/meta.json = 圆屏弧形/spinner 几何
docs/                ← 知识库（见 §6 与 docs/README.md）
src/ build/ dist/ out/ sign/   ← 生成物 / 私有物，均在 .gitignore
```

## 4. Build

```bash
npm install                         # Node 18+（box 上是 Node 20.19 / npm 11）。npm 源有问题时按 docs/VELA_DEV_SPEC.md §1.3 配 .npmrc
bash tools/build-all.sh             # 8 个 rpk → out/，大小与告警 → out/build-log.txt
bash tools/build-all.sh band10      # 只构建某设备
node tools/gen.js round && npx aiot build     # 单设备 debug → dist/com.velam3.demo.debug.1.0.0.rpk
node tools/gen.js round && npx aiot release   # release（需要 sign/，先 bash tools/gen-sign.sh）
npm run assets                      # 重新生成 PNG（需 playwright-core + Chrome，见 tools/v3/README.md）
```
- `src/` 是生成物：**每次 build 前必须先 `node tools/gen.js <dev>`**（build-all 已包含）。
- 引入 Vela 自定义组件（`<import>`）后，`aiot build/release` 必须加 `--enable-custom-component`（官方 toolkit 参数），同步改 `package.json` 与 `tools/build-all.sh`。

## 5. Emulator（UI 改动需要截图）

box 上的环境（Linux x86_64；不随包提供，SDK ≈ 3.4 GB + AVD ≈ 1 GB）：
- SDK：`~/.vela/sdk`，由 `npx aiot initEmulatorEnv` 从 `https://vela-ide.cnbj3-fusion.mi-fds.com/vela-ide/...` 下载：emulator 0.1.0、skins 0.0.10、system-images `vela-watch-5.0` 与 `vela-miwear-watch-5.0`（20250716）、qa、modem_simulator。
- AVD（"VVD"）：`~/.vela/vvd/Vela_Round_466.vvd`（skin builtin/xiaomi_watch，`hw.lcd.shape=circle`）、`~/.vela/vvd/Vela_Band10_212x520.vvd`（skin user/xiaomi_band_10，`hw.lcd.shape=pill-shaped`，`hw.device.flavor=band`），镜像都是 `vela-watch-5.0`，`hw.lcd.density=320`。新建用 `npx aiot createVVD`（交互式）。**pro / band9 还没有 AVD**。
- 启动（参数取自 box 的 `emu-launch-params.txt`；无显示环境可加 `-no-window`【未验证】）：
  ```bash
  ~/.vela/sdk/emulator/linux-x86_64/emulator -vela -avd Vela_Round_466 -show-kernel \
    -network-user-mode-options hostfwd=tcp:127.0.0.1:18554-10.0.2.15:101 -grpc 8554 \
    -qemu -device virtio-snd,bus=virtio-mmio-bus.2 -allow-host-audio -semihosting
  # band10：-avd Vela_Band10_212x520，hostfwd 18556，-grpc 8556
  ```
- 安装运行（adb 来自 Android SDK platform-tools；串号 emulator-5554 / 5556）：
  ```bash
  adb push out/velam3demo-round-debug.rpk /data/app/com.velam3.demo.rpk
  adb shell pm install /data/app/com.velam3.demo.rpk
  adb shell am start com.velam3.demo
  ```
- 截图 / 驱动：`echo '[["wait",12000],["shot","/tmp/s.png"]]' > /tmp/s.json && node tools/emu-drive.js 8554 /tmp/s.json --settle`
  步骤：`["wait",ms] ["tap",x,y] ["swipe",x1,y1,x2,y2,ms] ["drag",...] ["key","GoBack"] ["shot",file] ["log",msg]`；`--record out.mp4 --w W --h H` 录屏。整套截图：`node tools/gen.js <dev> && node tools/tour.js <dev> > tour.json`（见 README §7）。
- Codex cloud 容器里大概率跑不了模拟器（体积 / QEMU / 无显示）——那就构建 + 说明，截图留给本地运行。

## 6. 知识来源（Source of truth）

| 主题 | 文件 | 规则 |
|---|---|---|
| Vela 语法 / 组件 / 接口 / 坑点 | `docs/VELA_DEV_SPEC.md` | 从官方文档蒸馏，每条带〔来源〕；**与官方原文冲突时官方赢**（上游 https://github.com/hefeishui0829/xiaomi-vela-docs ） |
| Wear M3 令牌、可行性、Vela 降级方案 | `docs/wear-m3-vela-mapping.md`（重点 §1、§2.2、§3.3、**§8.3 v3 精确令牌与无法消除的差异**） | 数值只取自 androidx 源码 / developer.android.com；【推导】【自拟】【未验证】标注要保留 |
| 令牌代码真值 | `tools/tokens.js`、`tools/geom.js`；原始 Kotlin 在 `docs/ref/androidx-m3-src/*.kt` | 新令牌先查 Kotlin 源再写进 tokens.js，注明文件名 |
| 视觉参考 | `docs/design/v3/*.png`（M3 golden vs round 对比、全设备总览）、`docs/design/v3/ref/`（androidx golden 截图 + SOURCES.md） | 与 golden 对比判断"像不像" |
| 当前实现截图（基线） | `docs/screenshots/`（见该目录 README） | vela-watch-5.0 模拟器实拍 |

注：mapping / SPEC 文中的 `/workspace/xiaomi-vela-docs` 指上游 docs 仓库；`/workspace/vela-notes/...` 指原 box 路径（对应本仓库 `docs/`）。mapping 文档原本为"即时记事"App 调研，令牌与限制部分通用。

## 7. Vela hard rules（违反 = 白屏 / 编译失败 / 静默无效）

- `manifest.json`：每个 `import '@system.xxx'` 都要在 `features` 声明（本项目：router / prompt / vibrator）；`router.pages` 是**对象**（key = 页面路径，value `{component}`），不是数组；页面不注册 = 被跳过；`deviceTypeList: ["watch"]`；`name` ≤ 6 汉字；升级递增 `versionCode`，不改 `package`。
- 模板：**单一根节点**（不能用 `block` 作根）；文字必须在 `<text>`（或 span/a）里；`for` 只遍历数组，用 `for="{{list}}"` + `$item/$idx`；同 `type` 的 `list-item` 结构必须一致；事件参数里不嵌 `{{}}`；`image src` 不在模板里拼字符串（JS 里拼好）；图片用 `<image>`（不是 img）。
- 样式：**只用 flex**（无 block/inline/grid/fixed），默认 `flex-direction: row`；**只用 class 选择器**（无后代 / 子 / 兄弟 / 属性 / 通配 / 伪类 / 伪元素 / less 嵌套）；**无样式继承**（每个 text 自己写 color/font-size；黑底必须写 color）；单位只用 px（**无 rpx / vw / em / % 定位**）；无负 margin/padding；border-radius 必须配 border-width + border-color；`font-weight` 只有 normal / bold；无 letter-spacing / font-family；不依赖 CSS 渐变 / 阴影；`@keyframes` 必须写 0% 和 100%；transition 不作用于 transform / color（本项目只对 width、background-color 用 transition）；角度必须带 `deg`；list/list-item/scroll 要显式尺寸；list 子元素不能 absolute。
- 接口：没有 `window/document/localStorage/fetch/XMLHttpRequest`；禁止 axios/lodash/echarts 等三方库；`prompt` **只有 showToast**；`vibrator` 只用 `vibrate({mode})`；**手环没有 network / fetch / notification / alarm / geolocation**；外部接口全部 try/catch；定时器在 onHide/onDestroy 清理；非 UI 状态放模块级变量，不挂 ViewModel。
- 自定义组件：`<import name="m3-button" src="..."></import>`，标签名 kebab-case；只能用 `data`；props 外部用 kebab-case 传；子组件不得修改对象/数组 prop；`$emit('evtName', detail)` 后父组件用 `on<kebab-event>` 接、取 `evt.detail`；需要 `--enable-custom-component`；官方提示：**自定义组件有独立 ViewModel、有内存开销，手表手环上不建议大量使用**（库设计要考虑，见 HANDOFF §3.2）。**slot 在官方 Vela 文档中查不到**——视为不支持，除非在模拟器上验证过。

## 8. Pitfalls（本项目在 vela-watch-5.0 模拟器上实测）

1. `@keyframes` 每页都会打印 `Unknown style - keyframes`，**但动画正常播放**——忽略该告警。
2. 旋转 `<text>` 本身无效 → 弯曲 TimeText 用"每个字符一个 div 盒子"绕圆心旋转（gen.js `ttCss()`）。
3. **默认 transform-origin 是左上角** → 任何 scale/rotate 的 class 都显式写像素 `transform-origin`。
4. 移除 class 不会把 transform 复位 → 按压反馈用 `p-in`（scale .95）/ `p-out`（scale 1）两个 class 交接。
5. 没有绘图 API（无 canvas 动画 / 任意形状）→ 弧形 ScrollIndicator、不确定进度 spinner、EdgeButton 轮廓、scrim 渐变、弯曲"已保存"都是**预渲染 PNG（PNG8）**；`<image>` 不能着色 → 每种颜色一张图标 PNG（文件名 `<icon>_<colorRole>_<dp>.png`）。
6. 系统弹窗只有 Toast → AlertDialog / Confirmation 是**页面内全屏 overlay**（`dialog.tpl` / `confirm.tpl`）。
7. 模拟器里**返回手势不触发** → 每页底部加了"返回" CompactButton；`onBackPress` 先关 overlay 再播退出动画；生命周期钩子不能当 VM 方法调用，所以逻辑放在 `doBack()`。
8. 模拟器渲染比输入慢约 0.5 s（软件渲染）→ 驱动脚本用 `--settle`，截图前等画面稳定；视频拖影不代表真机卡。
9. 模拟器调试服务在**第二次启动 app** 时会崩 → 重启模拟器；debug 包启动先等调试器约 10 s。
10. `list` 的 `scroll` 事件 `scrollY` 是**绝对偏移**（已验证）；TLC 按此计算每项 scale/opacity。
11. **包体**：release 72–81 KB、debug 92–102 KB（社区建议手环 ≤ 50 KB，>100 KB 侧载可能失败）。主因：9 个页面各自内联整份共享 CSS + 公共 JS（每页 build JS 12–23 KB），图片仅约 12–24 KB。已做 PNG8、按引用拷图、CSS tree-shaking。
12. **从未运行过**：pro、band9 的 rpk（只编译）。**真机未测**：右滑返回 / 物理键、振动、Toast 外观、AstroBox 侧载、TLC 真机性能。

## 9. Coding conventions

- 只改 `template/`、`tools/`（及将来的库目录），不改 `src/`。尺寸一律写 dp：`$(N)`；复杂计算用 `$[expr]` 或 gen.js 里的 `ctx.xxxCss()` 生成器；设备差异用 `#if round / pill / rect`，不在运行时判断设备。
- 颜色 / 字号只从 `tools/tokens.js`（或 m3.css 中对应 class）来；新增令牌注明 androidx 源文件。pill 屏字号缩小规则见 m3.css（labelM 13dp、labelS 11dp、titleM 15dp）。
- class 名短（会进包体）；运行时 JS 只放纯函数（`common/m3.js`），页面状态放模块级变量。
- 动效：进入 350ms emphasized decelerate `cubic-bezier(0.05,0.7,0.1,1)`；退出 220ms `cubic-bezier(0.3,0,1,1)`；按压 100ms / 300ms `cubic-bezier(0.2,0,0,1)`；transform 动画只用 @keyframes。
- 新 PNG：加到 `tools/assets.js` 的 ICONS / 生成步骤 → `npm run assets` → 看 `assets/sizes.json`。文件名带颜色角色和 dp。
- 不确定的 Vela 行为：先查 SPEC / 官方文档；没写就当不支持；在模拟器验证后写进本文件 §8。
- Commit 小而清晰（中文说明），不提交生成物。

## 10. Verification checklist（每个 PR / 阶段结束前）

- [ ] `npm install` 后 `bash tools/build-all.sh` 成功产出 **8 个 rpk**（4 设备 × debug/release），无 ❌，🟠 告警不增加（`out/build-log.txt`）。
- [ ] **Size budget**：记录每个 rpk 大小并与上一版比较；release 先不超过当前（≤ 81 KB），库化后目标手环 ≤ 50 KB（HANDOFF §3.6）。
- [ ] 模拟器截图：受影响页面至少 round + band10（放 `docs/screenshots/`）；与 `docs/design/v3/` 及 androidx golden 对比外观。
- [ ] pro / band9：至少 gen + build 通过；有 AVD 时补截图。
- [ ] 新用到的 `@system.*` 已在 manifest `features` 声明；没有使用 SPEC 未列出的组件 / 属性 / 接口。
- [ ] 文档同步：README / HANDOFF / 组件文档 / 本文件 §8 新坑点。

## 11. Don'ts

- ❌ 提交 `sign/private.pem`（整个 `sign/` 被忽略；`bash tools/gen-sign.sh` 重建；正式发布用小米开放平台证书并保持不变）。
- ❌ 提交 `node_modules/ build/ dist/ out/ src/ *.rpk`。
- ❌ 使用不支持的 API / CSS（canvas 动画、伪类、后代选择器、rpx、% 定位、block/grid、手环上的网络接口、prompt 对话框、vibrator.start…）。
- ❌ 引入三方运行时库；❌ 为了"像 M3"使用 Vela 不支持的效果（阴影、模糊、CSS 渐变、可变字重）——用 PNG 或接受差异并记录。
- ❌ 编造令牌数值；❌ 只在一种屏幕上验证就宣称完成；❌ 改 gallery 包名 `com.velam3.demo`。

## 12. 2026-10-23 UI 工作更新

- 当前用户范围是全页面 UI 与动效还原，组件库重构暂缓。
- 当前返回按钮在列表顶部并随内容滚动；右滑完成后由显式 swipe 处理返回。旧 §8.7 的底部按钮是改前基线。
- 默认 Button 反馈采用透明度；可选 Button / IconButton 形变采用独立演示。旧 §8.4 的统一 0.95 缩放不再代表全部组件。
- 全量构建改用 npm run build:all，输出四设备 × API1/API2 × debug/release 共 16 包。
- 新界面尚未完成本机模拟器与真机验收，Chrome 设计预览不能标注为模拟器实测。兼容近似与未达标项见 docs/UI-IMPLEMENTATION.md。

## 13. 2026-10-24 用户确认的 UI 范围

- 圆屏移除所有返回按钮和占位；普通页面居中标题，Stepper 独立全屏。非圆屏保留顶部返回，右滑与返回事件按覆盖层、演示、路由处理。
- CompactButton 额外形变和图标状态过渡明确标注适配；band 九页均重排。
- 列表高度从展开后的 UX + CSS 生成，禁止恢复手工高度表；截图脚本使用同一描述。
- 保持固定参考提交与 basic/enhanced 入口；完整构建为 16 包，版本读取 manifest。
- 所有预览必须标注来源；原生驱动限制、包体及性能未达标项见 docs/UI-REWORK-2026-10-24.md。

## 14. 2026-10-24 发布与库拆分

- 独立生成式库源码、组件模板、运行片段、令牌与资源位于 `packages/vela-wear-m3/`；`template/` 是非商业 Demo 的消费模板，`tools/gen.js` 通过包依赖调用库。不要复制库实现回 Demo。
- 授权分区见 `LICENSE.md`：库 GPL-3.0-or-later（含指定 Demo 集成许可），Demo PolyForm Noncommercial；第三方声明必须随独立包和生成物保留。
- 字形资源采用 OFL Noto Sans SC；不得上传 SDK 字体、私钥、下载缓存或凭据。
- 生成与构建命令兼容，另运行 `npm run test:library` 验证 tarball 的独立消费。

## 15. 2026-10-24 项目图标

- 确认的小帆船 SVG 与 PNG 位于 `docs/design/brand/`，背景品牌色为 `#67508F`，不是官方组件令牌。
- `npm run assets:brand` 重新导出；Demo 的 `tools/gen.js` 接入 192px 圆形 PNG，不依赖资源重绘。
- 品牌素材按既有非商业展示素材政策授权，禁止复制进独立 GPL 库包；库资源管线保留通用图标。
