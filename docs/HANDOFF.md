> 发布结构更新：已抽出生成式组件库，见 [发布记录](OPEN-SOURCE-RELEASE.md)；下列组件库路线图为原始交接规划。

> 2026-10-24 更新：本轮组件重整、band 九页重排、验证范围与未达标项见 [实施记录](UI-REWORK-2026-10-24.md)。下文保留上一轮记录。

# HANDOFF —— 从 M3 Demo 到 `vela-m3` 组件库

> 当前工作转为全页面 UI 还原；组件库重构暂缓。新增功能、API 双配置及尚未完成的验收见 [UI-IMPLEMENTATION.md](UI-IMPLEMENTATION.md)。原有完成状态与体积表作为改前基线保留。

> 交接日期：2026-10-23（Asia/Shanghai, UTC+8）。读者：接手的 coding agent（OpenAI Codex）与用户。
> 标注约定：**【已验证】** = 在本仓库代码 / box 上的模拟器 / 官方文档里确认过；**【假设】** = 推断或建议，动手前需验证。

## 0. 一句话

现在是一个 9 页的 demo（`com.velam3.demo`），所有组件以"模板片段 + 按设备生成 CSS"的方式内联在页面里；下一步是把它们抽成**可安装 / 可拷贝的 Wear M3 组件库**，让别的 Vela JS 快应用开发者复用，demo 变成 gallery。

## 1. 当前状态

### 1.1 已完成【已验证】
| 项 | 位置 | 说明 |
|---|---|---|
| 9 个页面 | `template/pages/*` | index（launcher）/ buttons / cards / list / edge / time / toggles / dialogs / motion |
| 4 设备构建 | `tools/devices.json`、`tools/gen.js`、`tools/build-all.sh` | round 466×466、pro 336×480、band10 212×520、band9 192×490；每设备 debug + release |
| 令牌 | `tools/tokens.js`、`template/partials/m3.css` | androidx 默认深色 ColorScheme、TypeScale（weight<550→normal，≥550→bold） |
| 几何 | `tools/geom.js`、gen.js 里 `ttCss/siCss/ebCss/dlgCss/cfCss` | Padding、EdgeButton 形状、TLC ResponsiveTransformationSpec、弯曲 TimeText、圆屏 ScrollIndicator、AlertDialog、Confirmation |
| 组件（内联实现） | 见 §2 | Button 族、IconButton、CompactButton、Card 族、ListHeader、TLC、ScrollIndicator、EdgeButton、TimeText、Switch/Checkbox/Radio Button、InlineSlider、AlertDialog、Confirmation、进度 |
| 资源管线 | `tools/assets.js` + `tools/quant.py` | Material Symbols SVG → 按设备 px、按颜色角色渲染 PNG → PNG8；gen.js 只拷贝被引用的图 |
| 模拟器验证 | round + band10 全部页面 | vela-watch-5.0 镜像；所有点击经 gRPC 注入真实触摸 |
| 构建产物大小（交接前最后一次 build-all） | — | round: debug 101818 B / release 80969 B；band10: 92528 / 71718；pro: 97259 / 76915；band9: 92597 / 71778 |

### 1.2 未完成
- 没有"组件"抽象：所有组件是页面里的 class + `#include` 片段，别的项目无法直接引用。
- 没有 Stepper（只有 InlineSlider 式 −/分段/+）；Checkbox/Radio 只有 *Button 形态；线性进度未组件化。
- 只有默认深色 scheme（无主题切换 / 动态配色）。
- 包体未达社区 50 KB 建议。
- 没有自动化测试 / CI；截图对比靠人工。

### 1.3 未测试
- pro、band9 的 rpk **从未运行**（box 上没有这两种 AVD）。
- **真机全部未测**：右滑返回 / 物理键返回、`vibrator.vibrate`、Toast 外观、AstroBox 侧载流程、TLC 真机流畅度（每次 scroll 都改所有可见项 transform/opacity）、FMP（≤ 2000 ms 验收）、内存。
- `vela-miwear-watch-5.0` 镜像未用于测试（只用了 `vela-watch-5.0`）。

## 2. 现有组件 → 库组件对照

| 库组件（建议名 / 标签） | 现在的实现位置 | Wear M3 对应 | 关键依赖 |
|---|---|---|---|
| `M3Button` `<m3-button>` | buttons 页 `.btn .bf/.bt/.bo/.bc/.bpc`、`.btn-ic`、`.icc` | Button / FilledTonalButton / OutlinedButton / ChildButton，icon、secondaryLabel、disabled | 图标 PNG、按压 p-in/p-out |
| `M3IconButton` | `.ib` | IconButton（Filled/Tonal/Outlined） | 26dp 图标 PNG |
| `M3CompactButton` | `.cslot/.cbtn`（`partials/backbtn.tpl`） | CompactButton（32dp 视觉 / 48dp 触控） | |
| `M3Card` / `M3TitleCard` / `M3AppCard` / `M3OutlinedCard` | cards 页 | Card / TitleCard / AppCard / OutlinedCard | |
| `M3ListHeader` | `.lh/.lh-sub` | ListHeader / ListSubHeader | |
| `M3TransformingList` | `partials/base.js` `onScroll/applyScroll` + `common/m3.js tlc()` | TransformingLazyColumn（ResponsiveTransformationSpec） | list `scroll.scrollY` 绝对偏移 |
| `M3ScrollIndicator` | `partials/scrollind.tpl` + `siCss()` + `siStyle()` | ScrollIndicator（圆屏弧形 / 其它直条） | 圆屏弧 PNG、thumb 长度 3/5/7 档 |
| `M3EdgeButton` | edge 页 + `ebCss()` | EdgeButton（Small 56dp，距底 3dp）+ scrim | edge_button.png、scrim.png |
| `M3TimeText` | `partials/timetext.tpl` + `ttCss()` + `base.js tick()` | TimeText（圆/胶囊弯曲、矩形直排） | 定时器（无背景底板） |
| `M3SwitchButton` / `M3CheckboxButton` / `M3RadioButton` | toggles 页 `.sw*` 等 | SwitchButton / CheckboxButton / RadioButton | check 图标 |
| `M3Slider` / `M3Stepper` | toggles 页 InlineSlider | InlineSlider / Stepper（后者未做） | ± 图标 |
| `M3AlertDialog` | `partials/dialog.tpl` + `dlgCss()` + overlay.css | AlertDialog（icon/title/text；dismiss 60dp r18 + confirm 63×54 旋转 −45°） | 全屏 overlay |
| `M3Confirmation` | `partials/confirm.*` + `cfCss()` | (Success)Confirmation，2.2 s 自动消失 | curved_saved.png（圆屏） |
| `M3Progress` | motion / time 页 | CircularProgressIndicator（不确定：PNG 弧 + @keyframes；确定：`<progress type="arc">`）、线性 | spin_arc/track.png |
| 主题 / 令牌 | `tokens.js`、`m3.css` | ColorScheme / Typography / Shapes / Motion | |
| 页面脚手架 | `m3.css .page/.pg-enter/.pg-exit`、`base.js` | AppScaffold / ScreenScaffold（content padding、进出场、back） | |

## 3. 组件库设计

### 3.1 Vela 自定义组件机制【已验证：官方文档，见 `VELA_DEV_SPEC.md` §3.7、§3.16、§10.1 #15、§10.2 #29–30、#45】
- 引入：`<import name="m3-button" src="/vela-m3/m3-button/m3-button"></import>`（`name` 即标签名；官方示例用 kebab-case、非自闭合 `<import></import>`）。
- 组件文件 = 普通 `.ux` 三段式（template / style / script），**只能用 `data`**；生命周期 `onInit` / `onReady` / `onDestroy`。
- Props：`props: ['label', 'variant']` 或带默认值的对象形式 `props: { variant: { default: 'filled' } }`；父组件传值用 kebab-case 属性（`secondary-label="{{x}}"`）；**单向数据流**，对象/数组 prop 不能在子组件里改——需要可变就 `data` 里拷一份或 `$watch`。
- 事件：子 `this.$emit('m3Click', {id})` → 父 `<m3-button onm3-click="onBtn">`，回调读 `evt.detail.id`；另有 `$dispatch`（冒泡，父 `$on`）、`$broadcast`（父→子），用完 `evt.stop()`（不是 `$stop()`）。
- 构建：`aiot build --enable-custom-component`（release 同理）。
- 动态组件：`<component is="{{...}}">`（依赖自定义组件）。
- **Slot**：官方 Vela 文档中检索不到 slot【已验证：全文 grep 无结果】→ 按**不支持**设计，内容全部通过 props 传（label、secondaryLabel、icon src …）；若模拟器实测 `<slot>` 可用，再加内容插槽版本【假设】。
- **官方警告**：自定义组件有独立 ViewModel，**手表 / 手环上不建议使用**（内存）→ 见 3.2 双轨方案。
- 资源路径：被导入文件中引用资源要用**绝对路径**（`/common/...`），URI 不能含 `..` → 组件里图片写 `/vela-m3/img/xxx.png` 这类绝对路径。

### 3.2 双轨交付（建议）【假设，需 M1 量化验证】
1. **Component 轨（易用）**：每个组件一个 Vela custom component `.ux`，`<import>` 即用。
2. **Inline 轨（零开销）**：同一份组件源同时产出"片段 + class"形式（即本 demo 现在的做法：`#include` 进页面、无额外 ViewModel），给对内存 / 包体敏感的手环项目。
- 同一份 `*.ux.tpl` 源 → 生成器按设备与轨道输出两种形态，避免两套实现漂移。
- M1 必须实测：同一页面 10 个按钮，component 轨 vs inline 轨的**包体、启动时间、内存**（IDE memory snapshot / `dump_js_heap`），用数据决定默认轨道。

### 3.3 为什么需要生成步骤（per-device size classes）【已验证：现状】
- Vela 只有 px（无 rpx/vw），`designWidth` 由使用者的 manifest 决定；媒体查询要 API 3+ 且部分设备不支持（SPEC §4.7、§10.3 #59）；`<image>` 不能着色、无绘图 API → 弧形 / EdgeButton / 带色图标都要按设备 px 预渲染。
- 所以库 = **模板源 + 令牌 + 生成器 CLI**：`vela-m3 gen --device band10 [--design-width 212] --out src/vela-m3` 生成该设备的组件 `.ux`、共享 CSS、PNG。
- size class（沿用 devices.json，可扩展）：`circle`（round 466 等，k=2.0）、`rect`（pro 336×480，k=2.0）、`pill`（band10/band9，k=1.625）；再按 `Wdp/Hdp` 插值（TLC spec 已按屏高 192↔240dp 插值）。机型规格以 SPEC §7.1 官方表为准。
- 若使用者 designWidth ≠ 物理宽度：生成器乘 `designWidth / W` 缩放系数【假设：Vela 按 designWidth 线性缩放 px，见 SPEC §7.2；需验证 PNG 尺寸与像素对齐】。

### 3.4 建议的包结构【假设】
```
packages/vela-m3/                ← 新的独立 npm 包（先放本仓库，稳定后可拆仓）
  package.json                   ← name "vela-m3"，bin: { "vela-m3": "cli/index.js" }，零运行时依赖
  devices.json                   ← size classes（circle / rect / pill + 具体机型 W/H/k）
  tokens/                        ← colors.js（ColorScheme，可换主题）、typography.js、shape.js、motion.js
  geom/                          ← padding、edge-button、tlc、scroll-indicator、time-text（纯函数，生成期 & 运行期共用）
  runtime/m3.js                  ← 运行期纯函数（tlc / siStyle / pad2），组件用绝对路径 import
  components/
    m3-button/        { m3-button.ux.tpl, README.md, assets.json(需要的 PNG 清单), demo.ux.tpl }
    m3-icon-button/  m3-compact-button/  m3-card/  m3-title-card/  m3-list-header/
    m3-transforming-list/  m3-scroll-indicator/  m3-edge-button/  m3-time-text/
    m3-switch-button/  m3-checkbox-button/  m3-radio-button/  m3-slider/  m3-stepper/
    m3-alert-dialog/  m3-confirmation/  m3-progress/
  styles/m3.css.tpl              ← 共享 token class（inline 轨 / 页面使用）
  icons/*.svg                    ← Material Symbols（Apache-2.0，附 LICENSE）
  cli/ { index.js(gen / assets / check), pp.js(由现 gen.js 预处理器抽出), shake.js(CSS 摇树), assets.js, quant }
  docs/<component>.md + screenshots/<component>_<device>.png
apps/gallery/                    ← 现在的 demo，改为消费 vela-m3（保留 com.velam3.demo）
```
- 组件 API 草案：`<m3-button variant="filled|tonal|outlined|child" label="…" secondary-label="…" icon="/vela-m3/img/star_primary_24.png" disabled="{{false}}" onm3-click="…">`。图标按"颜色角色"区分，CLI 根据组件 `assets.json` + 使用者声明的图标清单生成。
- 难点：TLC / ScrollIndicator / EdgeButton 需要 list 的滚动事件，而无 slot 无法把任意 list-item 内容传进组件【假设】→ 两种做法二选一（M3 决定并记录）：(a) **数据驱动** `<m3-transforming-list items="{{…}}">`，item 只能是库内已知种类；(b) 只提供 JS helper（`createTlc(heights)` → style 数组）+ inline 轨模板，页面自己写 `<list>`。
- 目录 / 标签命名：文件夹与标签 kebab-case（`m3-button`），文档里称 `M3Button`。

### 3.5 分发方式【假设】
1. **npm 包**：`npm i -D vela-m3` → `npx vela-m3 gen --device <id> --out src/vela-m3`（生成物进使用者的 src/，由 aiot 打包）；可串在 `prebuild`。
2. **Copy-in**：Release 提供按设备预生成的 zip（`vela-m3-<device>.zip`），解压到 `src/vela-m3/` 即用。
3. **多设备项目**：CLI 支持 `--device all`，配合官方条件编译流程（SPEC §7.4）或本仓库 gen + build-all 方式。
4. 资源 CLI：`vela-m3 assets --icons star:primary:24,add:onPrimary:20` → 只渲染用到的图标（Playwright + Chrome 仅为开发期可选依赖；常用图标预渲染随包）。

### 3.6 包体策略（size budget）
- 现状【已验证】：每页 build JS 12–23 KB（9 页合计约 160 KB 未压缩），图片 12–24 KB；主因每页内联共享 CSS（已摇树）和 base.js。
- 方案【假设，需测量】：
  1. **SPA / 单页状态机**（社区推荐，mapping §6.2）：gallery 1 个页面 + `viewMode` 切换分区，共享 CSS 只出现一次——预期收益最大。
  2. 公共 JS 放 `app.ux` 引入的全局模块（官方 memory best practice "公共代码抽到全局方法"，SPEC §9.4），页面不再各自打包 base.js。
  3. `@import` / `<style src>` 共享 CSS 是否在每页重复打包——**需实测**。
  4. 组件 CSS 最小化：短 class 名、只生成用到的变体（CLI 按使用清单裁剪）。
  5. 图片：PNG8 已做；可再减色 / 减少颜色变体。
- 目标：gallery release 先 ≤ 60 KB，再争取手环 ≤ 50 KB；库给出"每组件增量 KB"表（M6）。

## 4. 里程碑与验收标准（每个都要：4 设备 build 通过 + round/band10 截图）

| # | 里程碑 | 内容 | 验收 |
|---|---|---|---|
| M0 | 基线 | 干净检出 `npm i && bash tools/build-all.sh` 成功；加 size report 脚本（每 rpk + 每页 JS 大小，对比基线）；可选 CI（只 build） | 8 个 rpk；大小与 §1.1 一致（±1 KB） |
| M1 | 骨架 + 实验 | 建 `packages/vela-m3`（tokens / geom / pp 从 tools 抽出，tools/gen.js 改为调用它）；`m3-button` 两条轨道；**实验**：`--enable-custom-component`、props、$emit、绝对路径资源、slot 是否可用、内存/包体对比 | buttons 页用 `<m3-button>` 渲染与现截图一致；实验结论写进 AGENTS §8 与本文件 |
| M2 | 基础组件 | IconButton、CompactButton、Card 族、ListHeader、Button 全变体（disabled、secondaryLabel、icon 容器） | 每组件 README（API 表、示例、4 设备截图）+ 与 androidx golden 对比图 |
| M3 | 脚手架组件 | TimeText、ScrollIndicator、TransformingList（数据驱动或 helper，二选一）、EdgeButton + scrim、页面进出场 / back | list / edge / time 页改用库；TLC 截图与基线一致 |
| M4 | 选择控件 | SwitchButton、CheckboxButton、RadioButton(组)、Slider、Stepper（新增） | toggles 页改用库；状态切换截图 / 短视频 |
| M5 | 浮层与进度 | AlertDialog、Confirmation（success/failure，curved/linear text）、Progress（circular 确定/不确定、linear） | dialogs / motion 页改用库；overlay 打开 / 关闭 / back 正确 |
| M6 | 发布 | npm 包（`vela-m3` bin）、按设备 copy-in zip、markdown 文档、包体表、`npx vela-m3 init` 示例 | 在**全新** `npx create-aiot` 项目里按 README 3 步接入并 build 成功；gallery release ≤ 60 KB |
| M7 | 真机 | AstroBox 侧载 band10 / band9 / pro / round；测 back、振动、TLC 性能、FMP、内存 | 真机照片 / 录屏；问题回写 AGENTS §8 |

## 5. 风险 / 开放问题
- 自定义组件内存开销（官方警告）可能让 component 轨在手环上不可用 → inline 轨兜底。
- 无 slot → 复合组件 API 只能 props 化。
- 使用者 designWidth 各异 → 生成期缩放，需模拟器验证。
- 模拟器 ≠ 真机（性能、返回手势、振动）。
- Codex cloud 大概率无法运行 Vela 模拟器 → 截图在用户本机 / box 上做。

## 6. 复现开发环境
- Node 18+、npm、`npm install`（aiot-toolkit 2.0.5 + @aiot-toolkit/jsc；`@grpc/grpc-js`、`@grpc/proto-loader` 随 `@aiot-toolkit/emulator` 安装，emu-drive.js 依赖它们）。
- Python 3 + Pillow（quant.py、overview.py）；ffmpeg（录屏）；Chrome/Chromium + `npm i --no-save playwright-core`（仅重新生成 PNG 时）。
- 签名：`bash tools/gen-sign.sh`（自签名；build-all 缺失时自动执行）。AstroBox 侧载用 **debug** 包。
- 模拟器：AGENTS.md §5（`npx aiot initEmulatorEnv` → `npx aiot createVVD` → 启动 → adb 安装）。box 上版本：emulator 0.1.0、skins 0.0.10、system-images 20250716（vela-watch-5.0 / vela-miwear-watch-5.0），Linux x86_64。
