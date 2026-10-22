# Xiaomi Vela JS 快应用开发规范（AI 开发者执行版）

> 依据：`/workspace/xiaomi-vela-docs`（上游 https://github.com/hefeishui0829/xiaomi-vela-docs）全部官方 JS 文档 + 社区文档。
> 生成日期：2026-10-21（Asia/Shanghai）。
> 本文所有结论均来自上述文档；每节/每条关键规则后以 `〔来源: 路径〕` 标注（路径相对仓库根目录）。
> 未在文档中出现的 API、属性、数值一律不得使用；遇到本文未覆盖的能力，先查原文档，查不到即视为"不支持"。

---

## 0. 使用约定与权威等级

### 0.1 文档分区与权威度

| 分区 | 内容 | 权威度 | 用法 |
|---|---|---|---|
| `01-official-quickapp-js/` | 官方 Vela JS 快应用文档（guide / components / features / tools / samples） | **最高**（唯一权威） | 语法、组件、接口、manifest 以此为准 |
| `04-community/xiaomi-band-dev-guide/` | 社区手环实战（BandNotepad 项目经验） | 中（经验性，含推测） | 用于真机经验、UI 尺寸、侧载流程；与官方冲突时以官方为准 |
| `04-community/vela-doc-guide/` | 社区整理（弦电子书项目、AI 速查、SKILL） | 低~中（多处与官方冲突） | 仅取 UI 风格与工程技巧；API 写法必须回查官方 |
| `02-official-lua/` | Lua 应用形态（另一种应用框架） | 与 JS 快应用无关 | 不要混用 |
| `03-official-shell/` | 设备侧 NuttX nsh 命令 | 与 JS 快应用无关（调试参考） | 不要在快应用代码里假设可调 shell |

〔来源: README.md；04-community/README.md；02-official-lua/README.md；03-official-shell/README.md〕

### 0.2 冲突处理总原则

1. **官方文档 > 社区文档**。社区文档中凡与官方 API 签名、manifest 结构、设备分辨率冲突之处，一律以官方为准（详见第 10 章冲突清单）。
2. 社区"真机经验"类规则（如包体 ≤50KB、单页状态机、Debug 包侧载、`$item/$idx` 更稳）在官方未给出反例时，可作为**保守策略**采用，但需标注为"社区经验"。
3. 官方文档内部自相矛盾时（如 router 是否需声明），取"更安全/兼容"的做法（例如：声明了也无害就声明）。

### 0.3 本文术语

- **rpk**：快应用安装包（`dist/` 下产出）。
- **feature**：manifest `features` 中声明的 `system.xxx` 接口。
- **ViewModel / VM**：页面或组件 `export default {}` 生成的对象，`this` 指向它。
- **designWidth**：manifest `config.designWidth`，px 单位的基准宽度。
- **API Level / `N+`**：标注 `2+`/`3+`/`4+` 表示该能力需 API Level ≥ N。

---

## 1. 开发流程

### 1.1 环境要求

| 项 | 要求 | 来源 |
|---|---|---|
| 操作系统（AIoT-IDE） | macOS 14+，Windows 10+，Ubuntu 20.04+ | 01-official-quickapp-js/guide/start/use-ide.md |
| 模拟器运行 | Win10+/macOS12+/Ubuntu（FAQ 口径） | 01-official-quickapp-js/guide/other/faq.md |
| 打包 | Windows / macOS 均可打包 | 01-official-quickapp-js/guide/other/faq.md |
| Node.js | 官方 AI 工作流 `create-vela-workflow` 要求 Node ≥ 16；社区手环指南推荐 v18+ | 01-official-quickapp-js/tools/dev/official-site-tutorial.md；04-community/xiaomi-band-dev-guide/README.md |
| openssl | 生成 release 签名需要；Windows 缺失时安装并配置环境变量、重启、终端输入 `openssl` 验证 | 01-official-quickapp-js/guide/start/use-ide.md；04-community/vela-doc-guide/vela-dev-guide.md |

- macOS 首次打开 IDE 若提示"已损坏"，按文档使用 `xattr` 移除隔离属性。〔来源: 01-official-quickapp-js/guide/start/use-ide.md〕

### 1.2 AIoT-IDE（官方 IDE，基于 VS Code）

- 新建项目：`文件 > 新建项目 > Vela > 创建`，选择模板、填写名称与路径。〔来源: 01-official-quickapp-js/guide/start/use-ide.md〕
- 官方模板共 8 个：基础、日历、图表、列表、音乐播放器、开发示例、计算器、设置面板。〔来源: 01-official-quickapp-js/tools/project/create-project.md〕
- IDE 识别项目：在根目录或 `src/` 中查找 `manifest.json`，并读取 `deviceTypeList`；IDE 还可预览**解压后的 rpk 目录**。〔来源: 01-official-quickapp-js/tools/start/index.md；01-official-quickapp-js/tools/start/project.md〕
- 支持 toolkit 1.0（≥1.0.18）和 2.0.x；IDE 1.6.0 推荐 toolkit 2.0。〔来源: 01-official-quickapp-js/tools/toolkit/start.md；01-official-quickapp-js/tools/toolkit/index.md〕
- 保存时格式化：开启 `Format On Save`（prettier）。〔来源: 01-official-quickapp-js/tools/dev/format.md〕
- 运行/调试时支持**热更新**（模拟器）；真机调试（devicedebug）**不支持热更新**。〔来源: 01-official-quickapp-js/tools/dev/build.md；01-official-quickapp-js/tools/devicedebug/start.md〕

### 1.3 npm 依赖安装失败：`.npmrc` 修复

在项目根创建 `.npmrc`：

```ini
registry="https://registry.npmmirror.com/"
```

然后重新 `npm i`（或在 IDE 中重新安装依赖）。〔来源: 01-official-quickapp-js/guide/start/use-ide.md；04-community/vela-doc-guide/vela-dev-guide.md〕

### 1.4 aiot-toolkit 命令

| 命令 | 作用 |
|---|---|
| `npm create aiot` | 创建项目（脚手架包 `create-aiot`） |
| `aiot start` | 启动开发服务/运行 |
| `aiot build` | 构建 debug 包（`dist/*.debug.rpk`） |
| `aiot release` | 构建 release 包（需 `sign/` 证书） |
| `aiot getConnectedDevices` | 列出已连接设备 |
| `aiot getPlatforms` | 列出平台/镜像 |
| `aiot crateVelaAvd` | 创建 Vela 模拟器（**文档原拼写**，疑似 create 的笔误） |
| `aiot deleteVelafangAvd` | 删除 Vela 模拟器（**文档原拼写**，疑似笔误） |

〔来源: 01-official-quickapp-js/tools/toolkit/start.md〕

- 官方 AI 工作流另给出：`npx create-aiot ux --name xxx` → `npm install` → `npm run build`。〔来源: 01-official-quickapp-js/tools/dev/official-site-tutorial.md〕
- 社区写法：`npm i aiot-toolkit -D`，`package.json` 中 `"build": "aiot build"`, `"release": "aiot release"`，devDependencies `"aiot-toolkit": "^2.0.5"`；社区 README 还建议 `npm install -g aiot-toolkit`（本规范**不推荐全局安装**，用项目内 devDependency + `npx`/npm scripts）。〔来源: 04-community/xiaomi-band-dev-guide/README.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 1.5 toolkit 参数（仅作用于 build / server / release）

| 参数 | 默认 | 说明 |
|---|---|---|
| `--devtool=<值>` | — | 如 `aiot build --devtool=source-map`；也可在 `quickapp.config.js` 中 `{ cli: { devtool } }` 配置 |
| `--enable-jsc` | false | 启用 JS 字节码编译 |
| `--enable-protobuf` | false | 启用 protobuf |
| `--enable-custom-component` | false | 启用自定义组件编译（使用 `<import>` 自定义组件时需要） |

- 查看帮助：`npx aiot build -h`。〔来源: 01-official-quickapp-js/guide/start/toolkit-params.md〕

### 1.6 toolkit 1.0 → 2.0 迁移要点

- 模板中不再允许嵌套 `{{}}`：写 `onclick="fun(x, y)"`，不要 `onclick="fun({{x}}, {{y}})"`。
- 不支持的选择器（如伪类）在 2.0 下**直接报错**。
- 动态路径 `../../common/...` 改为绝对路径 `/common/...`。
- 动态 `transform` / `background` / `filter` 用 `JSON.stringify` 后的对象字符串；`backgroundImage: "/common/logo.png"`。
- 2.0 新能力：模板可调用复杂函数、class 可多变量拼接、style 支持字符串或对象、简写属性值顺序任意、报错带行列号。
〔来源: 01-official-quickapp-js/tools/toolkit/update.md；01-official-quickapp-js/tools/toolkit/index.md〕

### 1.7 模拟器（Emulator）

| 镜像 | 说明 |
|---|---|
| `vela-miwear-watch-5.0` | 默认镜像；运行后显示表盘 |
| `vela-miwear-watch-4.0` | 只有 xiaomiWatch 466×466；运行后显示表盘 |
| `vela-watch-4.0`（dev） | 全部机型：xiaomiWatch 466×466、redmiWatch、xiaomiBand、xiaomiBandpro、xiaomi10Band、xiaomiSoundMini + 自定义；运行后**黑屏属正常** |

- 文档推荐使用 "Vela 正式版(4.0)" 镜像（use-ide.md 口径）；create-emulator.md 称默认镜像为 5.0。〔来源: 01-official-quickapp-js/guide/start/use-ide.md；01-official-quickapp-js/tools/emulator/create-emulator.md；01-official-quickapp-js/tools/emulator/emulator-run.md；01-official-quickapp-js/tools/debug/multi-screens.md〕
- IDE 会自动安装模拟器；也会识别 `$HOME/.android/avd` 下以 `Vela` 开头的模拟器。〔来源: 01-official-quickapp-js/guide/start/use-ide.md〕
- 模拟器创建面板：自动创建、复制启动命令、Install Rpk、Adb Mode、Hide Qt Window。〔来源: 01-official-quickapp-js/tools/emulator/create-emulator.md〕
- 自定义机型：宽/高 100<x<800，类型 watch/band/smartspeaker，形状 circle/rect（rect 可设圆角），dpi；皮肤由 background.png、foreground.png、layout 组成；属性 shape circle/rect/pill-shaped、density、flavor。**模拟器性能与真机不同**。〔来源: 01-official-quickapp-js/tools/debug/multi-screens.md〕
- 模拟器与手机通信需外接蓝牙适配器，配置复杂，**建议真机调试互联功能**。〔来源: 01-official-quickapp-js/guide/other/faq.md〕

### 1.8 调试

- 流程：选择设备 → 点"调试"；再次点击运行会停止推送。工具栏：安装 rpk、运行 rpk、截图、终端、日志。〔来源: 01-official-quickapp-js/tools/debug/start.md；01-official-quickapp-js/tools/debug/toolbar.md〕
- 调试面板：DOM、Console、断点。〔来源: 01-official-quickapp-js/guide/start/use-ide.md〕
- 日志：IDE "输出"面板；**黑屏排查**先看编译日志，再看模拟器日志。〔来源: 01-official-quickapp-js/tools/debug/watch-log.md〕
- 内存：两次快照对比；真机 `dump_js_heap` 到 `/sdcard`；`调试 -> Snapshot -> Profile`。〔来源: 01-official-quickapp-js/tools/debug/memory.md；01-official-quickapp-js/tools/debug/build-setting.md〕
- 审计（audit）9 项：多次引用代码、大型依赖替换、未使用依赖、未使用系统功能、网络耗时、https、请求次数、请求异常、代码执行报错；另有文件体积分析。〔来源: 01-official-quickapp-js/tools/debug/audit.md〕
- 构建设置：可自定义启动页。〔来源: 01-official-quickapp-js/tools/debug/build-setting.md〕
- 真机调试（devicedebug）：仅支持 O62 设备；需测试版小米运动健康；电脑与手机同一局域网；设备上 debug-app → 开启调试 → 获得设备 ID → IDE 连接；无热更新；可推送 rpk、看日志。〔来源: 01-official-quickapp-js/tools/devicedebug/start.md〕
- 社区经验：真机无 DevTools 时，全链路 `try/catch` + 页面上放 `<text>{{debugMsg}}</text>` 把 `e.message` 打到屏幕上。〔来源: 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
- 真机固件日志：小米运动健康 → 我的 → 关于 → Debug → 拉取固件日志，日志在 `/sdcard/Android/data/com.mi.health/files/log`。〔来源: 01-official-quickapp-js/guide/other/faq.md〕
- 互联问题：检查手表端发送数据结构；手机端用 `adb logcat` 看日志。〔来源: 04-community/vela-doc-guide/vela-dev-guide.md〕

### 1.9 真机安装（侧载）

#### 1.9.1 官方路径：小米运动健康 Debug 模式

1. 手机安装小米运动健康（测试版需联系商务获取，FAQ 给出联系邮箱 changjian@xiaomi.com）。
2. 小米运动健康 → 我的 → 关于 → Debug。
3. 第三方应用 → 输入包名 → Install third app → 选择本地 rpk。
〔来源: 01-official-quickapp-js/guide/other/faq.md；04-community/vela-doc-guide/vela-dev-guide.md〕

#### 1.9.2 社区路径：AstroBox 蓝牙侧载（零售版手环）

1. `npm run build` 生成 **debug** 包：`dist/<pkg>.debug.<version>.rpk`。
2. 手机系统设置中**强制停止"小米运动健康"**（BLE 同一时刻只允许一个主机通道，否则 `GATT Error 133` / 进度卡 0%）。
3. 打开 AstroBox（https://astrobox.online/，跨平台；网页版需支持 WebBluetooth 的 Chrome/Edge）。
4. 用小米账号登录，自动拉取设备 32 位 AuthKey。
5. 搜索并连接手环 → "应用安装/快应用" → 选择本地 debug.rpk → 开始安装。
- 其它工具：表盘自定义工具（Android）、Notify for Xiaomi。
- **侧载必须用 debug 包**：社区称零售固件不放行自签 release 包（报"证书校验失败/非法安装包"）。
- 故障表：AuthKey invalid → 手环重绑后需重新登录同步；闪退 → 检查 `deviceTypeList` 含 `watch`、移除 `window/document`、入口加 try/catch；全黑 → 根节点设显式宽高、文字放 `<text>`；存储不足 → 卸载旧应用（建议常驻三方应用 3~5 个）；升级后数据丢失 → `package` 被改（package 是数据沙盒 key）。
〔来源: 04-community/xiaomi-band-dev-guide/docs/05-sideload-and-deployment.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；04-community/xiaomi-band-dev-guide/README.md〕

> ⚠️ 冲突提示：官方 FAQ 侧载流程未区分 debug/release；"必须 debug 包"是社区针对 AstroBox 的经验。上架发布则必须用 release 签名包（官方）。

### 1.10 打包与签名

| 类型 | 生成方式 | 产物 | 签名 |
|---|---|---|---|
| Debug | IDE "打包" / `aiot build` / `npm run build` | `dist/*.debug.rpk`（社区：`dist/<pkg>.debug.<version>.rpk`）+ `build/` | SDK 内置默认开发证书（社区说法） |
| Release | IDE "发布" / `aiot release` / `npm run release` | `dist/*.release.rpk`（社区：`dist/<pkg>.release.<version>.rpk`） | `sign/private.pem` + `sign/certificate.pem`（社区示例放 `sign/release/`） |

生成证书（官方命令）：

```bash
openssl req -newkey rsa:2048 -nodes -keyout private.pem -x509 -days 3650 -out certificate.pem
```

- IDE "发布"会检查签名文件是否存在。〔来源: 01-official-quickapp-js/guide/start/use-ide.md；01-official-quickapp-js/tools/release/release.md；01-official-quickapp-js/tools/release/start.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕
- **release 证书每次必须保持一致**，否则无法上架/更新。〔来源: 01-official-quickapp-js/guide/other/faq.md〕
- **互联（interconnect）应用**：rpk 的 `package` 必须与 Android 端 App 包名一致，签名必须使用 Android App 的签名（jks → p12：`keytool`；p12 → pem：`openssl pkcs12 -nodes`；或官方在线签名工具），`private.pem`/`certificate.pem` 放到 `sign/debug` 和 `sign/release`；真机安装新包前先卸载旧包。〔来源: 01-official-quickapp-js/features/network/interconnect.md；01-official-quickapp-js/guide/other/faq.md〕
- 每次升级同步递增 `versionCode`（官方推荐每次上传 +1）和 `versionName`。〔来源: 01-official-quickapp-js/guide/framework/manifest.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 1.11 发布与验收

- 验收标准：**FMP（首次有效绘制）≤ 2000ms**。〔来源: 01-official-quickapp-js/guide/publish/acceptance-criteria.md〕
- 发布：联系 zhangyuanpu@xiaomi.com。〔来源: 01-official-quickapp-js/guide/publish/index.md〕
- `name` 必须与应用商店保存的名称一致（≤6 个汉字）。〔来源: 01-official-quickapp-js/guide/framework/manifest.md〕
- 后台运行能力（`config.background`）上架会被审核。〔来源: 01-official-quickapp-js/guide/framework/other/background-running.md〕

### 1.12 官方 AI 工作流（create-vela-workflow / velajs-mcp）

- `npx create-vela-workflow my-app [--mode copilot|kiro|all]`，Node ≥ 16。
- 工作流规则：只用内置组件；只用 `@system.*` 接口；**禁止第三方库**（axios、lodash、echarts 等）；强制 Flexbox，规范写"默认 flex-direction: column"（注意：官方通用样式表中 `flex-direction` 的默认值是 row，所以要显式写 column）；圆屏安全内边距上下 50px、左右 36px；**图片仅 PNG、不用 SVG**；路由与 manifest 对齐；import 了哪个 `@system` 就在 features 声明；`onDestroy` 清理定时器、静态内容加 `static`。
- 调试辅助 npm 包：`velajs-mcp`。
〔来源: 01-official-quickapp-js/tools/dev/official-site-tutorial.md〕

### 1.13 推荐开发闭环（综合）

1. 选目标设备 → 定 `designWidth`（见第 7 章）。
2. IDE 新建项目 或 `npm create aiot` / `npx create-aiot ux --name xxx`；遇安装失败配置 `.npmrc`。
3. 写 manifest（第 2 章）→ 页面 ux（第 3 章）→ 样式（第 4 章，只用支持的属性）。
4. 每 `import '@system.xxx'` 立即在 `features` 声明（router/app/configuration 例外可不声明）。
5. 模拟器多屏预览（vela-watch-4.0 镜像覆盖多机型）。
6. `aiot build` → 真机/AstroBox 安装 debug 包测试（内存、FMP、息屏恢复）。
7. 生成固定证书 → `aiot release` → 发布。
〔来源: 综合 01-official-quickapp-js/guide/start/*.md；01-official-quickapp-js/tools/**；04-community/xiaomi-band-dev-guide/docs/05-sideload-and-deployment.md〕

---

## 2. 项目结构、manifest.json 与 app.ux

### 2.1 目录结构（官方）

```text
<ProjectName>/
├── src/                      # 源码根（manifest 写在 <ProjectName>/src/manifest.json）
│   ├── manifest.json         # 应用配置：包信息、features、config、router
│   ├── app.ux                # 应用级入口：全局数据/方法、App 生命周期
│   ├── pages/
│   │   ├── index/index.ux    # 页面（目录名 = 页面名，ux 文件名 = component）
│   │   └── detail/detail.ux
│   ├── i18n/                 # 多语言：defaults.json / zh-CN.json / en-US.json
│   └── common/               # 公共资源：style.css / utils.js / logo.png
├── sign/                     # release 签名：private.pem + certificate.pem
├── quickapp.config.js        # webpack 扩展配置（插件、devtool、Terser 等）
└── package.json
```

〔来源: 01-official-quickapp-js/guide/framework/project-structure.md；01-official-quickapp-js/guide/start/project-overview.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

- 页面三部分（template/style/script）可写在一个 `.ux` 中，也可拆为 `detail.ux + detail.css + detail.js`；**拆分后 ux 文件中不能包含 `template` 标签**（官方原文如此）。〔来源: 01-official-quickapp-js/guide/framework/project-structure.md〕
- 社区 SKILL 额外列出 `components/`、`utils/`、`config-watch.json`（非官方必需）。〔来源: 04-community/vela-doc-guide/vela-dev/SKILL.md〕

### 2.2 文件存储分区与 URI

| 分区 | URI | 只读 | 示例 | 说明 |
|---|---|---|---|---|
| 应用资源 | `/path` | 是 | `/Common/header.png` | 打包进 rpk 的资源 |
| Cache | `internal://cache/path` | 否 | `internal://cache/fetch-123456.png` | 缓存；空间不足可能被系统删除 |
| Files | `internal://files/path` | 否 | `internal://files/image/demo.png` | 小型永久文件，应用自管 |
| Mass | `internal://mass/path` | 否 | `internal://mass/video/demo.mp4` | 大文件，不保证一直可用 |
| Temp | `internal://tmp/path` | 是 | `internal://tmp/xxxxx` | 系统动态生成、只读、重启后失效 |

- URI 允许字符：`0-9a-zA-Z_-./%:`；**不能出现 `..`**；internal URI 自动按应用隔离。
- 路径规则：
  1. 代码文件导入代码文件用**相对路径**（如 `../Common/component.ux`）。
  2. 代码文件引用资源一般用相对路径（如 `./abc.png`）。
  3. **被导入文件**若与导入方不在同一目录，其中的资源引用**必须用绝对路径**（被导入文件会被复制进导入方）。
  4. CSS 中 `url(/Common/abc.png)`。
〔来源: 01-official-quickapp-js/guide/framework/project-structure.md〕
- toolkit 2.0：动态路径 `../../common` 必须改为 `/common/...`。〔来源: 01-official-quickapp-js/tools/toolkit/update.md〕
- ⚠️ 社区 AI-QUICKREF 称 file 接口"仅支持 `internal://`"——不完整：官方 `file.readText` 也支持应用资源路径（如 `/Common/demo.txt`），但写操作不能用资源路径/tmp。〔来源: 04-community/vela-doc-guide/AI-QUICKREF.md；01-official-quickapp-js/features/data/file.md〕

### 2.3 manifest.json 顶层字段（全量）

| 字段 | 类型 | 默认 | 必填 | 规则 |
|---|---|---|---|---|
| `package` | String | — | 是 | 应用包名，**必须与原生应用包名不同**；推荐 `com.company.module`。互联应用则必须**等于** Android 端包名（见 1.10）。社区：升级时不可修改，否则数据沙盒丢失 |
| `name` | String | — | 是 | **≤6 个汉字**，与应用商店名称一致；用于桌面图标、弹窗 |
| `icon` | String | — | 是 | 应用图标，提供 **192×192** 即可 |
| `versionName` | String | — | 否 | 如 `"1.0"` |
| `versionCode` | Integer | — | 是 | 从 1 自增，**每次重新上传 +1** |
| `minAPILevel` | Integer | 1 | 否 | 兼容性检查；使用了 N 级新增特性就必须 ≥N（原文另有"如果不填按照内测版本处理"，与默认 1 表述矛盾） |
| `features` | Array | — | 否 | 接口声明列表 `[{ "name": "system.xxx" }]`；**绝大部分接口不声明不能调用** |
| `config` | Object | — | 是 | 见 2.4 |
| `router` | Object | — | 是 | 见 2.5 |
| `display` | Object | — | 否 | 见 2.6 |
| `deviceTypeList` | Array\<String\> | watch | 否 | 可选 watch/tv/car/phone，**现只支持 watch**；社区强烈建议显式写 `["watch"]`（否则可能拒装） |
| `permissions` | Array | — | 否 | 如 `[{ "name": "hapjs.permission.LOCATION" }]` |

〔来源: 01-official-quickapp-js/guide/framework/manifest.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md；04-community/xiaomi-band-dev-guide/docs/05-sideload-and-deployment.md〕

- 官方示例里出现 `"minPlatformVersion": 1000`，社区示例也用；但字段表中**没有**该字段，权威字段是 `minAPILevel`。建议：写 `minAPILevel`；保留 `minPlatformVersion` 无文档依据说明其作用。〔来源: 01-official-quickapp-js/guide/framework/manifest.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 2.4 config

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `logLevel` | String | log | off / error / warn / info / log / debug |
| `designWidth` | Integer | 480（不填） | 页面设计基准宽度，px 按此缩放（第 4、7 章） |
| `background` | Object | — | 后台运行：`{"features": [...]}`，可申请 `system.audio`、`system.geolocation`、`system.request`；**同时仍需在顶层 features 声明** |
| `data` | — | — | 全局数据，页面中通过 `this.$app.$data` 读取（lifecycle 文档示例：`this.$app.$data.name`） |

〔来源: 01-official-quickapp-js/guide/framework/manifest.md；01-official-quickapp-js/guide/framework/other/background-running.md；01-official-quickapp-js/guide/framework/script/lifecycle.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md〕

### 2.5 router

| 字段 | 必填 | 说明 |
|---|---|---|
| `router.entry` | 是 | 首页名称（= pages 中的 key） |
| `router.pages` | 是 | Object；**key = 页面名称（对应页面目录名）**，value 为页面配置 |
| `pages.<name>.component` | 是 | 组件名，与 ux 文件名一致（`"hello"` ↔ `hello.ux`） |
| `pages.<name>.path` | 否 | 默认 `/<页面名称>`；**必须唯一** |
| `pages.<name>.launchMode` | 否 | `standard`（默认）或 `singleTask` |

- **未配置路由的页面在编译打包时被跳过**。
- 官方教程中的跳转 uri 为 `'/pages/detail'`、`'/pages/list'`，与"key 为 `pages/detail`，path 缺省 `/<页面名称>`"一致；社区手环示例写法：`"entry": "pages/index"`, `"pages": {"pages/index": {"component": "index"}}`。本规范模板采用该写法。
〔来源: 01-official-quickapp-js/guide/framework/manifest.md；01-official-quickapp-js/guide/start/project-overview.md；01-official-quickapp-js/guide/start/add-interactivity.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕
- ❌ 社区 SKILL.md 的 `"pages": [{ "src": "pages/index/index.ux" }]` 数组写法**与官方不符，禁止使用**。〔来源: 04-community/vela-doc-guide/vela-dev/SKILL.md〕

### 2.6 display

| 字段 | 默认 | 说明 |
|---|---|---|
| `display.backgroundColor` | `#ffffff` | 窗口背景色，作用于全部页面。手表/手环建议设 `#000000`（社区 AMOLED 省电经验，社区示例即如此） |

〔来源: 01-official-quickapp-js/guide/framework/manifest.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md；04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md〕

### 2.7 permissions（权限）

| 权限名 | feature | API | 错误码 |
|---|---|---|---|
| `hapjs.permission.LOCATION` | system.geolocation | getLocation / subscribe / unsubscribe | 400 拒绝授予；402 未声明权限 |
| `hapjs.permission.DEVICE_INFO` | system.device | getSerial / getDeviceId | 400；402 |

〔来源: 01-official-quickapp-js/guide/framework/manifest.md〕

### 2.8 app.ux

- 编译后 `app.ux` 会包含 manifest 配置，**不要删除 `/**manifest**/` 注释标识**。
- `app.ux` 的代码必须写在 `<script>` 内。
- `export default` 上的属性/方法在页面中通过 `this.$app.$def.xxx` 访问；在 app.ux 内直接 `this` 访问。
- App 生命周期：`onCreate`、`onShow`、`onHide`、`onDestroy`、`onError(e)`。
- `this.$app.exit()`：退出应用。
- 公共方法建议放 `global.js` 等并在 app.ux 引入（内存最佳实践：用全局方法减少重复代码）。
〔来源: 01-official-quickapp-js/guide/framework/ux.md；01-official-quickapp-js/guide/other/tips.md；01-official-quickapp-js/guide/framework/script/global-data-method.md；01-official-quickapp-js/guide/framework/script/lifecycle.md；01-official-quickapp-js/guide/best-practice/memory.md〕

### 2.9 quickapp.config.js（webpack 扩展）

- 用于：`cli.devtool`；条件编译插件（`conditional-compilation-webpack-plugin`）；Terser 去除 console（`terser-webpack-plugin` 的 `pure_funcs`，配合 `console.debug`）。〔来源: 01-official-quickapp-js/guide/start/toolkit-params.md；01-official-quickapp-js/guide/multi-screens/conditional-compilation.md；01-official-quickapp-js/guide/best-practice/start.md〕

---

## 3. UX 语法

### 3.1 ux 文件三段式

```html
<import name="comp-a" src="./comp-a"></import>   <!-- 可选：引入自定义组件 -->
<template>
  <!-- 只能有 1 个根节点；根节点不能是 block -->
  <div class="page"> ... </div>
</template>
<style> /* 也可 <style src="..."> 或 @import */ </style>
<script>
  import router from '@system.router'
  export default { private: {...}, onInit() {}, method() {} }
</script>
```

〔来源: 01-official-quickapp-js/guide/framework/ux.md；01-official-quickapp-js/guide/framework/template/index.md；01-official-quickapp-js/guide/framework/style/index.md〕

- 脚本：支持 ES5/ES6；**不是 Node 环境**（无 `fs` 等）。〔来源: 01-official-quickapp-js/guide/framework/script/index.md〕
- 社区补充：运行时**无** `window`、`document`、`navigator`、`localStorage`、`fetch`、`XMLHttpRequest`；写了会在真机启动即白屏/崩溃。〔来源: 04-community/xiaomi-band-dev-guide/docs/01-platform-and-engine.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
- 文字必须放在 `<text>`（或 `a`/`span`）内；`div` 里裸文本不渲染。〔来源: 01-official-quickapp-js/guide/start/user-interface.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 3.2 页面数据对象

| 属性 | 用于 | 覆盖规则 |
|---|---|---|
| `data` | **组件**级数据模型 | — |
| `public` | 页面级 | 允许被传入数据覆盖（含应用外部请求）；未声明的外部属性不会新增 |
| `protected` | 页面级 | 只允许被**应用内部页面**传参覆盖，不允许外部请求覆盖 |
| `private` | 页面级 | 不允许被覆盖 |
| `computed` | 计算属性 | getter（可选 setter） |

- 属性名不能以 `$` 或 `_` 开头；不要用 `for`、`if`、`show`、`tid` 等保留字。
- **`public`/`protected`/`private` 不能与 `data` 同时使用**。
- 自定义组件只能用 `data`（Object；官方示例中也有 `data(){ return {...} }` 函数写法）。
〔来源: 01-official-quickapp-js/guide/framework/script/page-data.md；01-official-quickapp-js/guide/framework/template/component.md〕
- ⚠️ 社区 vela-dev-guide 把 protected 描述为"受保护数据"、AI-QUICKREF 说"protected 可被子组件读取 / public 可被子组件修改"——**与官方语义不符**，以官方覆盖规则为准。〔来源: 04-community/vela-doc-guide/AI-QUICKREF.md〕

### 3.3 数据绑定

- `{{message}}` 插值；属性绑定 `attr="{{expr}}"`。
- 事件参数中直接写数据变量（不加 `this`、不嵌套 `{{}}`）：`onclick="handle(total, $item)"`。
- toolkit 2.0：模板可调复杂函数；class 可多变量：`class="item {{isSelected ? 'item2' : ''}}"`（社区 UI 指南用法）。
- `.static` 修饰 / `static` 属性：一次性渲染、不再响应数据变化，可降内存（见 9.2）。
〔来源: 01-official-quickapp-js/guide/framework/template/index.md；01-official-quickapp-js/guide/framework/template/event.md；01-official-quickapp-js/tools/toolkit/index.md；01-official-quickapp-js/tools/toolkit/update.md；01-official-quickapp-js/guide/best-practice/memory.md；04-community/vela-doc-guide/vela-ui-guide.md〕
- 图片 src：官方 tips 建议**不要在 src 中拼接字符串**（会告警），改为 `src="{{imgPath}}"` 在 JS 中拼好；但官方教程 user-interface.md 与社区都有 `/common/icons/{{weather.icon}}.png` 式写法（矛盾，遵循 tips 更稳）。〔来源: 01-official-quickapp-js/guide/other/tips.md；01-official-quickapp-js/guide/start/user-interface.md〕

### 3.4 for 循环（含 `$item/$idx` 坑）

官方三种写法（`{{}}` 可省略）：

```html
<div for="{{list}}" tid="uniqueId"><text>{{$idx}}.{{$item.name}}</text></div>        <!-- 方式1 -->
<div for="value in list" tid="uniqueId"><text>{{$idx}}.{{value.name}}</text></div>   <!-- 方式2 -->
<div for="(i, v) in list" tid="uniqueId"><text>{{i}}.{{v.name}}</text></div>          <!-- 方式3 -->
```

规则：
1. **只能循环数组，不能循环对象**。
2. `tid`：数组元素唯一 id 字段名（类似 React key）；不写则默认 `$idx`。tid 指向的属性**必须存在**、**必须唯一**、**不支持表达式**。
3. `block` 上的 for 不额外插入节点，循环其内部结构。
4. for 与 if 同标签时 **if 优先级高于 for**；不建议共存。
5. 自定义索引/元素变量名**不能以 `$` 或 `_` 开头**。
〔来源: 01-official-quickapp-js/guide/framework/template/for.md〕

- 列表更新闪烁：加 `tid`。〔来源: 04-community/vela-doc-guide/vela-dev-guide.md〕
- **⚠️ `$item/$idx` 坑（社区）**：社区实测"部分 Vela 版本"中 `for="item in list"` 别名写法渲染空白，只注入 `$item`/`$idx`；建议循环一律写 `for="{{list}}"` + `$item`/`$idx`。官方文档三种写法都支持。**本规范采用社区保守写法：只用 `$item`/`$idx`**（官方也支持，零风险）。〔来源: 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md；01-official-quickapp-js/guide/framework/template/for.md〕
- 嵌套循环时内层 `$item` 会遮蔽外层（推论自同名注入；文档未明确说明，嵌套时先把外层需要的值通过事件参数或预处理数据传入）。

### 3.5 if / elif / else 与 show

- `if/elif/else` 必须是**相邻兄弟节点**；值为 false 时节点从 DOM 移除。
- `show="{{bool}}"`：等同 `visible=none`，节点保留；主要用于原生组件。
- `block` 只支持 `for` 和 `if/elif/else`。
- `list-item` 内避免 if/else/show 改变结构（同 type 的 list-item 结构必须一致）。
- 大量候选内容（如输入法候选栏）用 `if` 而非 `show`（社区，省内存）。
〔来源: 01-official-quickapp-js/guide/framework/template/if.md；01-official-quickapp-js/guide/framework/template/index.md；01-official-quickapp-js/guide/other/tips.md；01-official-quickapp-js/components/container/list-item.md；04-community/vela-doc-guide/input-method-guide.md〕

### 3.6 事件

- 写法：`onclick="press"` 或 `@click="press"`。
- 传参：`onclick="handle($idx, $item)"`；回调末尾**自动追加 `evt`** 参数。
- 通用事件：`touchstart/touchmove/touchend`、`click`、`longpress`、`swipe`（`direction`: left/right/up/down；**不冒泡**；在有滚动条的方向上不触发）。其余事件冒泡。
- 组件自定义事件见 3.7。
〔来源: 01-official-quickapp-js/guide/framework/template/event.md；01-official-quickapp-js/components/general/events.md〕
- 官方示例：根节点 `@swipe="handler"`，在回调中 `eve.direction === 'right'` 判断返回等。〔来源: 01-official-quickapp-js/guide/start/add-interactivity.md〕
- 社区：每次点击在处理函数第一行 `vibrator.vibrate({ mode: 'short' })`（try/catch 包裹）提供触觉反馈。〔来源: 04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md〕

### 3.7 自定义组件

- **官方提示：自定义组件有独立 ViewModel，存在内存开销，手表/手环等轻量设备上不建议使用。**
- 构建需 `--enable-custom-component`（toolkit 参数；条件编译示例脚本也带此参数）。
- 引入：`<import name="comp-part1" src="./part1"></import>`，`name` 即标签名。
- 只能用 `data`；生命周期：`onInit`、`onReady`、`onDestroy`。
- Props：`props: ['say', 'propObject']`；外部传值用 kebab-case：`prop-object="{{obj}}"`；要默认值必须写对象形式 `props: { prop1: { default: 'Hello' } }`；文档提及类型 String/Number/Boolean/Function/Object/Array。
- 单向数据流：父更新 → 子刷新；**对象/数组 prop 在子组件中修改会影响父组件**，禁止在子组件改 prop；需要修改时用 data 接收初值（简单值赋值、对象 `JSON.parse(JSON.stringify())` 深拷贝）或 `$watch`。
- 通信：
  - 子→父：`this.$emit('emitEvt', {count})`，父标签 `onemit-evt="emitEvt"`，回调取 `evt.detail.count`。
  - 子→父（冒泡）：`this.$dispatch('dispatchEvt', {...})`，父 `this.$on('dispatchEvt', this.fn)`。
  - 父→子：`this.$broadcast('broadevt', {...})`，子 `this.$on('broadevt', this.fn)`。
  - 传递结束调用 `evt.stop()`，否则一直传递。
  - `this.$off('xxx', this.fn)` / `this.$off('xxx')` 移除。
〔来源: 01-official-quickapp-js/guide/framework/template/component.md；01-official-quickapp-js/guide/framework/template/props.md；01-official-quickapp-js/guide/framework/script/global-data-method.md；01-official-quickapp-js/guide/start/toolkit-params.md；01-official-quickapp-js/guide/multi-screens/conditional-compilation.md〕
- ⚠️ 社区 vela-dev-guide 写 `event.$stop()`——官方为 `evt.stop()`。社区 vela-vs-web 用自闭合 `<import name="ListItem" src="..." />` 和 PascalCase 标签——官方示例均为 `<import ...></import>` + kebab-case 标签名，按官方写。〔来源: 04-community/vela-doc-guide/vela-dev-guide.md；04-community/vela-doc-guide/vela-vs-web.md〕
- 官方扩展组件：NEORUAA 输入法组件（见 5.6）。〔来源: 01-official-quickapp-js/guide/developer-materials/extension-components.md〕

### 3.8 计算属性 computed

```js
computed: {
  reversedMessage() { return this.message.split('').reverse().join('') },   // getter
  fullName: { get() { ... }, set(value) { ... } }                            // getter + setter
}
```
- 依赖的数据变化时自动更新；命名规则同 data。〔来源: 01-official-quickapp-js/guide/framework/template/computed.md；01-official-quickapp-js/guide/framework/script/page-data.md〕
- 社区 UI 指南在 export 中写 `get totalPages() {}` 原生 getter——非官方 computed 写法，应改用 `computed`。〔来源: 04-community/vela-doc-guide/vela-ui-guide.md〕

### 3.9 页面生命周期

| 钩子 | 时机 / 用途 |
|---|---|
| `onInit()` | ViewModel 数据已准备好，可使用页面数据 |
| `onReady()` | 模板编译完成，可 `this.$element(id)` 获取节点 |
| `onShow()` | 页面显示（切回、**亮屏后也会重新触发**——放在 onShow 的请求会重复执行） |
| `onHide()` | 页面被切换隐藏 |
| `onDestroy()` | 页面销毁（返回上一页 / 打开页面过多被框架回收）：释放资源、取消订阅（如 `geolocation.unsubscribe()`）、清定时器；`this.$valid` 判断是否已销毁 |
| `onBackPress()` | 返回键/返回手势；**`return true` 拦截**，false 放行 |
| `onRefresh(query)` | singleTask 页面被再次打开时回调；**参数不会自动更新到数据上**，需自行处理 query |
| `onConfigurationChanged(evt)` | 配置变化，如 `evt.type === 'locale'` 语言改变 |

- 页面销毁后，绑定到页面的 `setTimeout` 不再执行。
〔来源: 01-official-quickapp-js/guide/framework/script/lifecycle.md；01-official-quickapp-js/guide/framework/other/launch-mode.md；01-official-quickapp-js/guide/framework/other/i18n.md；01-official-quickapp-js/guide/other/tips.md〕

**社区"无后台"铁律**：息屏/来电/侧键返回会立即 `onHide`，内存紧张时数秒内可能被强杀，`onDestroy` 甚至来不及执行 → **状态变动即时落盘**，并在 `onHide`、`onDestroy` 再兜底保存。〔来源: 04-community/xiaomi-band-dev-guide/docs/01-platform-and-engine.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕

`onBackPress` 多级拦截范式（社区）：
```js
onBackPress() {
  if (this.isModalOpen) { this.isModalOpen = false; return true }  // 先关弹窗
  if (this.viewMode === 'edit') { this.backToList(); return true }  // 二级视图回一级
  return false                                                      // 一级放行退出
}
```
〔来源: 04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md；04-community/xiaomi-band-dev-guide/README.md〕

### 3.10 App 生命周期

`onCreate`、`onShow`、`onHide`、`onDestroy`、`onError(e)`（捕获异常）。写在 `app.ux` 的 `export default` 中。〔来源: 01-official-quickapp-js/guide/framework/script/lifecycle.md〕

### 3.11 路由与页面切换

```js
import router from '@system.router'
router.push({ uri: '/pages/detail', params: { id: 1 } })   // 打开
router.replace({ uri: '/pages/detail' })                    // 替换（销毁当前页）
router.back()                                               // 返回
router.back({ path: '/pages/index' })                       // 返回到已打开的指定页（以 / 开头）
router.clear()                                              // 清空页面栈（保留当前页）
router.getLength(); router.getState(); router.getPages()
```

- `uri` 支持：完整 schema（`hap://app/<package>/[path][?k=v]`）、`/path`、页面 `Name`、`"/"`。
- `params` 的值会被**转为 String**；目标页必须在 `protected`（应用内）或 `public`（外部）中声明**同名属性**，再用 `this.key` 读取。
- `params` 中加 `___PARAM_LAUNCH_FLAG___: 'clearTask'` 可清除其他页面（launch-mode 文档）。
- `<a href="/pages/x?param1=v">` 也可跳转，参数同样需 public/protected 接收。
〔来源: 01-official-quickapp-js/features/basic/router.md；01-official-quickapp-js/guide/framework/page-switch.md；01-official-quickapp-js/guide/framework/other/hap-schema.md；01-official-quickapp-js/guide/framework/other/launch-mode.md；01-official-quickapp-js/components/basic/a.md〕

- ⚠️ `system.router` 是否需在 features 声明：`features/basic/router.md` 写"无需声明"；入门教程 add-interactivity.md 要求声明。**声明无害，模板中声明**。〔来源: 01-official-quickapp-js/features/basic/router.md；01-official-quickapp-js/guide/start/add-interactivity.md〕
- ❌ 社区 AI-QUICKREF 的 `this.params.xxx` 取参写法**无官方依据**；社区 vela-vs-web 的 `uri: 'pages/detail/detail'` 形式官方未记载（非 `/` 开头会按页面名解析），**统一用 `'/pages/detail'`**。〔来源: 04-community/vela-doc-guide/AI-QUICKREF.md；04-community/vela-doc-guide/vela-vs-web.md〕
- 社区建议：手环上**少开页面**，倾向单页状态机（`viewMode` 切换视图），避免 `router.push` 堆栈耗尽 RAM；官方内存最佳实践也要求"减少页面数量"。〔来源: 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；01-official-quickapp-js/guide/best-practice/memory.md〕

### 3.12 启动模式 launchMode

| 模式 | 行为 |
|---|---|
| `standard`（默认） | 每次打开新建页面实例 |
| `singleTask` | 已存在则复用该页面并回调 `onRefresh(query)`（参数不会自动更新），并关闭其上方页面（文档语义） |

- manifest 声明：`"PageA": { "launchMode": "singleTask", "component": "index" }`；也可在 push 的 params 中用 `___PARAM_LAUNCH_FLAG___`。
- ❌ 社区 AI-QUICKREF 列出 `singleTop`——**官方不存在**。
〔来源: 01-official-quickapp-js/guide/framework/other/launch-mode.md；01-official-quickapp-js/guide/framework/manifest.md；04-community/vela-doc-guide/AI-QUICKREF.md〕

### 3.13 全局对象与方法

| 名称 | 说明 |
|---|---|
| `this.$app` | 应用对象；`$app.$def` = app.ux 导出对象；`$app.$data` = manifest `config.data`；`$app.exit()` 退出 |
| `this.$page` | `name` / `path` / `component`（与 manifest router.pages 对应） |
| `this.$valid` | 页面对象是否有效（未销毁） |
| `this.$canIUse(str)` **3+** | `'@system.router.push'`、`'@system.router'`、`'scroll'`、`'scroll.attr.scroll-x'`（type 可为 attr/style/method） |
| `this.$watch('a.b', 'handlerName')` | 监听数据，handler(newV, oldV)；**不支持数组索引**；handler 必须在 script 中定义 |
| `this.$element('id')` | 取节点（不传 id 返回根）；onReady 之后用 |
| `this.$nextTick(fn)` | DOM 更新后回调 |
| `$on/$off/$dispatch/$broadcast/$emit` | 事件通信（3.7） |
| `global.runGC()` | 手动 GC（**不要频繁调用**，见 9.2） |

〔来源: 01-official-quickapp-js/guide/framework/script/global-data-method.md；01-official-quickapp-js/guide/framework/script/lifecycle.md；01-official-quickapp-js/guide/best-practice/memory.md〕

### 3.14 国际化 i18n

- 资源：`src/i18n/*.json`。文件匹配优先级：`<语言>-<国家>.json` → `<语言>.json` → `defaults.json` → 首个文件（不推荐依赖兜底）。
- 语法：基础文本、数组（序列化成文本，**不支持与插值混用**）、命名插值 `"{msg} world"`、列表插值 `"{0} world"`、单复数 `'car | cars'`。
- 使用：`this.$t(path, opts)`、`this.$tc(path, choice, opts)`，模板与脚本中均可用。
- 语言切换：页面 `onConfigurationChanged(evt)`，`evt.type === 'locale'`；`@system.configuration.getLocale()` 同步返回 `{language, countryOrRegion}`。
- 语言代码表见 language-list.md。
〔来源: 01-official-quickapp-js/guide/framework/other/i18n.md；01-official-quickapp-js/guide/framework/other/language-list.md；01-official-quickapp-js/features/basic/configuration.md〕

### 3.15 后台运行

- `manifest.config.background.features` 可申请：`system.audio`、`system.request`、`system.geolocation`（顶层 features 也要声明）；相关代码放 `app.ux`；**上架审核**。
- 蓝牙（system.bluetooth.ble）**禁止后台**使用。
- 社区：除上述声明外，**不要假设任何后台定时器/轮询能存活**。
〔来源: 01-official-quickapp-js/guide/framework/other/background-running.md；01-official-quickapp-js/features/system/bluetooth.md；04-community/xiaomi-band-dev-guide/docs/01-platform-and-engine.md〕

### 3.16 动态组件

```html
<import src="./part1.ux" name="part1"></import>
<import src="./part2.ux" name="part2"></import>
<template><div><component is="{{'part' + status}}"></component></div></template>
```
- 多数情况推荐用 `if` 切换；组件多时用 `<component is>` 减少模板代码（依赖自定义组件，注意内存）。
〔来源: 01-official-quickapp-js/guide/framework/other/dynamic-component.md〕

### 3.17 hap 链接

`hap://app/<package>/[path][?key=value]`，可用于 `router.push` 的 uri。〔来源: 01-official-quickapp-js/guide/framework/other/hap-schema.md〕

---

## 4. 样式（CSS）

### 4.1 引入方式与选择器

- 引入：`<style>` 内写；`<style src="./a.css"></style>`；`@import './a.css';`（社区：`@import '../../common/style.css';`）。
- **支持的选择器（官方）**：`.class`、`#id`、`tag`、并列 `,`。
- **优先级**：内联 > id(10000) > class(100) > tag(1)。
- **不支持**：后代选择器（`.a .b`）、子选择器（`>`）、兄弟（`+`）、属性选择器、通配 `*`、伪类（`:active`/`:hover`/`:focus` 等）、伪元素（`::before/::after`）、样式继承。toolkit 2.0 遇不支持的选择器（如伪类）直接报错。
- 预处理器：less（`npm i less less-loader`）、sass/scss（`node-sass sass-loader`）、postcss（`postcss-loader precss@3.1.2` + `postcss.config.js`，`<style lang="postcss">`）。
〔来源: 01-official-quickapp-js/guide/framework/style/index.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/guide/start/user-interface.md；01-official-quickapp-js/tools/toolkit/update.md；04-community/vela-doc-guide/vela-dev-guide.md〕

> ⚠️ 冲突：社区 AI-QUICKREF/vela-dev-guide 说"仅 class 选择器"——比官方更严格；官方明确支持 class/id/tag/逗号。**AI 生成代码建议只用 class**（两者交集，最安全），但知道 id/tag 合法。
> ⚠️ 官方 component.md 示例用 less 嵌套 `.tutorial-page { .tutorial-title {...} }`，编译后为后代选择器，与"不支持后代选择器"矛盾——**不要用嵌套**。
〔来源: 04-community/vela-doc-guide/AI-QUICKREF.md；01-official-quickapp-js/guide/framework/template/component.md〕

### 4.2 长度单位

| 单位 | 说明 |
|---|---|
| `px` | **不是物理像素**，相对 `designWidth`（类似 rem）：`设计稿1px / 设计稿宽度 = 框架1px / designWidth`；designWidth 不填为 480 |
| `%` | 相对父容器 |
| `dp` **3+** | 设备独立像素，物理尺寸近似一致；`屏幕DP宽 = 分辨率宽 / DPR`，`DPR = PPI / 160` |
| `deg` | 角度（rotate、progress 角度等）**必须带单位**，如 `total-angle: 360deg` |
| `s`/`ms` | 动画时间 |

- ❌ **没有 `rpx`**（社区 SKILL.md "使用 rpx" 错误）；❌ `left/top/right/bottom` 只支持 px，不支持 %。
- px 取整会产生 ±1px 误差，等分布局可能换行，留余量。
〔来源: 01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/guide/multi-screens/specs.md；01-official-quickapp-js/guide/other/tips.md；01-official-quickapp-js/components/general/style.md；01-official-quickapp-js/guide/multi-screens/samples.md；04-community/vela-doc-guide/vela-dev/SKILL.md〕

### 4.3 盒模型与布局

- 盒模型**只有 border-box**。
- `display` 只支持 `flex | none`（默认 flex）。**只有 flex 布局**。
- `flex-direction` 默认 **row**（与 Web 的 block 流不同，也与"默认 column"直觉相反）——纵向排布必须显式写 `flex-direction: column`。
- flex 相关（flex / flex-grow(0) / flex-shrink(1) / flex-basis(-1) / flex-direction）仅在父容器为 `<div>`、`<list-item>` 时生效。
- `align-items`：flex-start(默认) / flex-end / center / baseline / stretch。
- `justify-content`：flex-start(默认) / flex-end / center / space-between / space-around。
- `position`：relative(默认) / absolute；父容器为 `<list>`、`<swiper>` 时不生效。
- 三段式布局（官方多屏样例）：固定头 + `flex: 1` 中间 + 固定尾。
〔来源: 01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/components/general/style.md；01-official-quickapp-js/guide/multi-screens/samples.md〕

### 4.4 通用样式属性（官方全表）

| 属性 | 取值 / 默认 | 限制 |
|---|---|---|
| width / height | length / % | 不设则按内容 |
| min-/max-width/height | auto/none/length/% | 不能为负 |
| padding(-方向) | length，默认 0 | **不能为负** |
| margin(-方向) | length，默认 0 | **不能为负** |
| border | 简写 width style color | — |
| border-style | 仅 `solid` | 仅 1 个值，作用于所有边 |
| border-width | length，默认 0 | 所有边统一 |
| border-color | color，默认 black | 所有边统一 |
| border-radius | length / % | **必须同时设置 border-width 和 border-color**；不超过短边一半 |
| background-color | color | — |
| color | color | — |
| background-image | uri | 本地与网络图；`internal://` 需 toolkit ≥1.1.2 |
| background-size | contain/cover/auto/length/% | 仅部分设备支持（4.8） |
| background-repeat | — | **暂不支持** |
| background-position | 1~4 值 | 仅部分设备支持（4.8） |
| box-shadow **3+** | `x y color` / `x y blur color` / `x y blur spread color` | — |
| opacity | number，默认 1 | — |
| display | flex / none | — |
| visibility | visible / hidden | 不改布局 |
| flex / flex-grow / flex-shrink / flex-basis / flex-direction | 见 4.3 | 父为 div/list-item |
| align-items / justify-content | 见 4.3 | — |
| position | relative / absolute | list/swiper 子元素不生效 |
| left/top/right/bottom | **仅 px** | 不支持 % |

〔来源: 01-official-quickapp-js/components/general/style.md〕

- `flex-wrap: wrap` 出现在官方多屏样例中，但**不在通用样式表**（文档缺口；需要换行布局时谨慎使用并真机验证）。〔来源: 01-official-quickapp-js/guide/multi-screens/samples.md〕
- 组件私有样式（如 text 的 `lines`、`text-overflow`、swiper 的 `indicator-*`、picker 的 `selected-*`）见第 5 章。

### 4.5 文本样式（text / span / a）

| 属性 | 默认 | 说明 |
|---|---|---|
| lines | -1 | 行数，-1 不限 |
| color | **rgba(0,0,0,0.54)** | ⚠️ 默认近黑色——黑底页面**必须显式设 color**，否则看不见 |
| font-size | 30px | — |
| font-style | normal | normal / italic |
| font-weight | normal | 只有 normal/bold 两种效果；数字 <550 为 normal |
| text-decoration | none | underline / line-through / none |
| text-align | left | left / center / right |
| text-indent | — | length / % |
| line-height | — | length |
| text-overflow | clip | clip / ellipsis，**需设置 lines 才生效** |

- 单行省略：`width: 150px; lines: 1; text-overflow: ellipsis;`
- span 只支持 color / font-size / font-style / font-weight / text-decoration，且无事件。
〔来源: 01-official-quickapp-js/components/basic/text.md；01-official-quickapp-js/components/basic/span.md〕
- ❌ 不支持 `font-family`（未在任何官方样式表中出现）。

### 4.6 颜色

`#rgb`、`#rrggbb`、`#rgba`、`#rrggbbaa`、`rgb()`、`rgba()`、`transparent`、颜色名。〔来源: 01-official-quickapp-js/components/general/color.md〕

### 4.7 媒体查询 2+

- toolkit ≥ 1.1.3。`@media [screen] [and|not|only] (feature) {}`；`@import './x.css' screen and (...)` 为 **3+**。
- 媒体类型仅 `screen`。
- 特性：`width/height/min-*/max-*`（**3+**，值单位为 dp，**写数字不带单位**）、`aspect-ratio/min-/max-`（**3+**，如 `1 / 2`）、`device-type`（**3+**，watch/band/smartspeaker，默认 watch）、`shape`（**2+**：circle/rect；`pill-shaped` **3+**）。
- 逻辑（**3+**）：`and`、`not`（需写媒体类型）、`only`（被忽略，需写类型）、`,`（等同 or）、`or`；比较 `<= >= < >`，如 `(400 <= width <= 700)`。
- **支持明细**：

| 设备 | 支持情况 |
|---|---|
| 小米 S1 Pro | 不支持 |
| 小米手环 8 Pro | 不支持 |
| 小米手环 9 / 9 Pro | 支持 2+ 特性（即仅 shape） |
| Xiaomi Watch S3 | 支持 2+ 特性 |
| Redmi Watch 4 | 不支持 |
| 小米腕部心电血压记录仪 | 不支持 |
| 小米手环 10、Xiaomi Watch S4、REDMI Watch 5、REDMI Watch 6 | 支持 |

```css
@media (shape: circle) or (shape: pill-shaped) { .box { background-color: green; } }
@media (device-type: watch) and (shape: circle) { .box { background-color: green; } }
@media (min-width: 160) and (max-width: 200) { .box { background-color: yellow; } }
```
〔来源: 01-official-quickapp-js/guide/framework/style/media-query.md〕

### 4.8 背景图

- `background-size`: contain / cover / auto / length(px/dp) / %（小数向下取整）。
- `background-repeat` **未实现**（文档建议仍写 no-repeat 以防将来变化）。
- `background-position`: 1~4 值。
- **设备支持**：S1 Pro、手环 8 Pro、手环 9/9 Pro、S3、RW4、心电记录仪 **不支持** size/position；手环 10、S4、RW5、RW6 支持。
- 全屏背景图建议把可交互部分拆出单独元素。
- toolkit 2.0 动态背景：`backgroundImage: "/common/logo.png"`；动态 `background` 需对象 `JSON.stringify`。
〔来源: 01-official-quickapp-js/components/general/background-img-styles.md；01-official-quickapp-js/guide/multi-screens/samples.md；01-official-quickapp-js/tools/toolkit/update.md〕

### 4.9 动画

**animation**

| 属性 | 说明 |
|---|---|
| transform | **仅 2D**：translate/translateX/translateY（length/%）、scale/scaleX/scaleY、rotate（deg） |
| transform-origin | X/Y（%/px）；**必须先有 transform** |
| animation-name | 对应 @keyframes；多个动画逗号分隔（标注 `1070+`） |
| animation-delay / animation-duration | s / ms，默认 0 |
| animation-iteration-count | 整数或 infinite，默认 1 |
| animation-timing-function | linear / ease / ease-in / ease-out / ease-in-out / cubic-bezier(x1∈[0,1],y1,x2∈[0,1],y2) / step-start / step-end / steps(n[, jump-start/jump-end/jump-none/jump-both/start/end]) |

- `@keyframes` 中可动画属性：`background-color`、`background-position`、`opacity`、`width/height`（**不支持 %**）、`transform`。
- **0% 和 100% 必须显式写出**。
- 文档未列出 `animation-fill-mode`、`animation-direction`、`animation-play-state` → 视为不支持。

**transition**

- `transition-property`（默认 all）、`transition-duration`（0s）、`transition-timing-function`、`transition-delay`（0s），简写 `transition: width 2000ms ease-in 500ms`。
- 可过渡：width、height、opacity、visibility、border-width、border-color、background-color、background-position。
- **不可过渡**：color、transform、transform-origin、padding*、margin*、border、border-radius、background、background-size、flex*、left/top/right/bottom 等。

〔来源: 01-official-quickapp-js/components/general/animation-style.md〕

- 帧动画用 `image-animator` 组件（2+）。

### 4.10 Vela vs Web 差异速查

| Web | Vela | 来源 |
|---|---|---|
| `localStorage` | `@system.storage`（异步回调） | 04-community/vela-doc-guide/vela-vs-web.md；01-official-quickapp-js/features/data/storage.md |
| Vue Router / `<router-link>` | manifest 路由 + `router.push`；`<a href>` 或点击事件 | 04-community/vela-doc-guide/vela-vs-web.md |
| `import Comp from` | `<import name src></import>` | 01-official-quickapp-js/guide/framework/template/component.md |
| http 路径 / `/assets` | `internal://files/...`、`/common/...` | 04-community/vela-doc-guide/vela-vs-web.md |
| `fetch()` / XHR | `@system.fetch`（多数手环不支持） | 01-official-quickapp-js/features/network/fetch.md |
| `<img>` | `<image>` | 01-official-quickapp-js/components/basic/image.md |
| block/inline 流式布局 | 只有 flex，默认 row | 01-official-quickapp-js/components/general/style.md |
| `:hover/:active` | 不支持，用事件 + class 切换 | 04-community/vela-doc-guide/vela-dev-guide.md |
| `created/mounted/destroyed` | `onInit/onReady/onDestroy`（App 为 onCreate） | 04-community/vela-doc-guide/vela-vs-web.md |
| `$emit` + `@select` | `$emit` + `on<kebab-event>` 或 `@event` | 01-official-quickapp-js/guide/framework/template/component.md |
| CSS 变量 `var()` / `:root` | **无文档支持**（社区附录写了 `:root`，勿用） | 04-community/vela-doc-guide/vela-ui-guide.md |
| `!important` / `overflow` / `z-index` | **官方样式表未列出**（社区样式中有 `!important`、`overflow: hidden`，属未验证用法） | 01-official-quickapp-js/components/general/style.md |

### 4.11 不支持清单（汇总）

1. 选择器：后代、子、兄弟、属性、通配、伪类、伪元素、继承。
2. 单位：rpx、vw/vh、em/rem（文档只给 px/%/dp）。left/top/right/bottom 的 %。
3. display: block/inline/grid；只有 flex/none。
4. 负 margin / 负 padding。
5. border-style 除 solid 外的值；分边设置边框（文档只有统一 width/color）。
6. border-radius 未设 border-width + border-color 时不生效。
7. background-repeat；多数旧设备上的 background-size/position。
8. 3D transform；animation-fill-mode/direction（未列出）。
9. transition 作用于 color/transform/margin/padding/border-radius/flex/定位等。
10. @keyframes 缺省 0%/100%；keyframes 中 width/height 用 %。
11. font-family、z-index、overflow、flex-wrap、align-self、gap、CSS 变量（均未在官方表中）。
12. 媒体查询 width/height/aspect-ratio/device-type/逻辑运算在 API Level < 3 设备上不可用；S1 Pro / 手环 8 Pro / RW4 完全不支持媒体查询。
〔来源: 01-official-quickapp-js/components/general/style.md；01-official-quickapp-js/components/general/animation-style.md；01-official-quickapp-js/components/general/background-img-styles.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/guide/framework/style/media-query.md；01-official-quickapp-js/guide/start/user-interface.md〕

---

## 5. 组件速查

> 通用属性：`id`、`style`、`class`、`for`、`if`、`show`、`data-*`（JS 中 `el.dataset.camelCase` 读取）。**同一属性不能既作为属性又作为样式混用**。
> 通用事件：`touchstart/touchmove/touchend`、`click`、`longpress`、`swipe`。
> 通用方法：`getBoundingClientRect({success(rect), fail, complete})` **2+**（onShow 之后调用；rect 含 left/right/top/bottom/width/height）、`focus`。
> 〔来源: 01-official-quickapp-js/components/general/properties.md；01-official-quickapp-js/components/general/events.md；01-official-quickapp-js/components/general/methods.md〕

### 5.1 容器组件

| 组件 | 子组件 | 关键属性 | 关键样式 | 事件 / 方法 | 注意 |
|---|---|---|---|---|---|
| `div` | 任意 | — | 通用 + flex | 通用 | 基础布局容器 |
| `list` | **仅 list-item** | `bounces`(false) | **必须设显式高度** | 事件：`scroll{scrollX,scrollY,scrollState 0/1/2}`、`scrollbottom`、`scrolltop`、`scrollend`、`scrolltouchup`；方法：`scrollTo({index, behavior})`、`scrollBy({left, top, behavior})` | 长列表首选 |
| `list-item` | 任意 | **`type` 必填** | 显式 width/height | — | **同 type 的 DOM 结构必须一致**；避免 if/show 改变结构 |
| `scroll` **2+** | 任意 | `scroll-x`、`scroll-y`、`scroll-top/bottom/left/right`、`bounces` | 竖向需固定高度、横向需固定宽度；**3+** 吸附：`scroll-snap-type`(x/y + mandatory/proximity)、`scroll-snap-align`(none/start/center/end/edge)、`scroll-snap-stop`(normal/always)，toolkit ≥1.1.4 | 事件：`scrolltop`、`scrollbottom`、`scroll{scrollX,scrollY}`；方法：`getScrollRect({success{width,height}})`、`scrollTo({left,top,behavior})`、`scrollBy` | 可嵌套 |
| `stack` | 任意 | — | — | — | 子元素层叠 |
| `swiper` | 任意 | `index`(0)、`autoplay`(false)、`interval`(3000)、`indicator`(true)、`loop`(true)、`duration`、`vertical`(false)、`previousmargin`/`nextmargin`（和 ≤1/2）、`enableswipe`(true) | `indicator-color`(rgba(0,0,0,.5))、`indicator-selected-color`(#33b4ff)、`indicator-size`(20px)、`indicator-top/left/right/bottom` | 事件：`change{index}`、`swipestart`/`swipeend` **2+**；方法：`swipeTo({index})` | 多图时只保留 3 个子节点懒加载（最佳实践） |

〔来源: 01-official-quickapp-js/components/container/div.md；01-official-quickapp-js/components/container/list.md；01-official-quickapp-js/components/container/list-item.md；01-official-quickapp-js/components/container/scroll.md；01-official-quickapp-js/components/container/stack.md；01-official-quickapp-js/components/container/swiper.md；01-official-quickapp-js/guide/best-practice/business.md〕

### 5.2 基础组件

| 组件 | 子组件 | 关键属性 | 关键样式 | 事件 / 方法 |
|---|---|---|---|---|
| `text` | 仅 span | — | 见 4.5 | 通用 |
| `span` | — | id/style/class/for/if（仅子于 text/a/span） | color、font-size、font-style、font-weight、text-decoration | **无事件** |
| `a` | 仅 span | `href`（路由 uri，可带 `?param1=v`，目标页用 public/protected 接收） | text 样式 | 通用 |
| `image` | — | `src`（本地/云端；png、jpg）、`alt`（仅本地，或 `'blank'`） | `object-fit`: contain / **cover(默认)** / none / scale-down | `complete{width,height}`、`error` |
| `image-animator` **2+** | — | `images[{src,width,height,top,left}]`、`iteration`(infinite/n)、`reverse`、`fixedsize`(true)、`duration`("1s" 或 ms)、`fillmode`(forwards/none) | — | 方法：`start`、`pause`、`stop`、`resume`、`getState` |
| `marquee` | — | `scrollamount`(6)、`loop`(-1)、`direction`(left/right) | `color`、`font-size`(30px)、`text-offset` | 事件：`bounce`、`finish`、`start`；方法：`start`、`stop` |
| `progress` | — | `percent`、`type`: horizontal / arc（不可动态改） | `color`(#33b4ff)、`stroke-width`(32px)、`layer-color`(#f0f0f0)；arc：`start-angle`(240)、`total-angle`(240，-360~360，**带 deg**)、`center-x`、`center-y`、`radius` | horizontal 设 height 无效 |
| `barcode` **2+** | — | `value`（Code128，≤20 字节） | `color`(#000)、`background-color`(#fff)；rotate 仅横/竖；scale 整数 | — |
| `qrcode` **2+** | — | `value` | `color`、`background-color` | — |
| `chart` | — | `type`: line / bar（不可动态）；`options`（必填，不可动态）：`xAxis/yAxis{min(≥0, 仅 line), max, axisTick(1~20, 默认10), display, color(#c0c0c0)}`、`series{lineStyle{width 2px}, loop{margin 1px}}`；`datasets[{strokeColor(#ff6384, line), fillColor, data[], gradient(false, line)}]` | — | 数值按整数取整 |

〔来源: 01-official-quickapp-js/components/basic/text.md；01-official-quickapp-js/components/basic/span.md；01-official-quickapp-js/components/basic/a.md；01-official-quickapp-js/components/basic/image.md；01-official-quickapp-js/components/basic/image-animator.md；01-official-quickapp-js/components/basic/marquee.md；01-official-quickapp-js/components/basic/progress.md；01-official-quickapp-js/components/basic/barcode.md；01-official-quickapp-js/components/basic/qrcode.md；01-official-quickapp-js/components/basic/chart.md〕

- ❌ `<img>` 不是官方组件（社区 vela-ui-guide / AI-QUICKREF / vela-vs-web 大量使用 `<img>`）——**一律写 `<image>`**。〔来源: 04-community/vela-doc-guide/vela-ui-guide.md；01-official-quickapp-js/components/basic/image.md〕
- 圆屏进度：可用 `device.getInfo` 的 `screenShape` 决定 progress 用 `arc`。〔来源: 01-official-quickapp-js/guide/multi-screens/specs.md〕
- 社区：长文本可用 `<marquee scrollamount="22" text-offset="25">`，否则 `<text>`。〔来源: 04-community/vela-doc-guide/vela-ui-guide.md〕

### 5.3 表单组件

| 组件 | 关键属性 | 关键样式 | 事件 / 方法 | 注意 |
|---|---|---|---|---|
| `input` | `type`: **button / checkbox / radio**（可动态）；`checked`、`name`、`value` | `color`(rgba(0,0,0,.87))、`font-size`(37.5px)；button 默认 128×70px | `change`：checkbox {name,value,checked}；radio {name,value}；button 无 change；方法 `focus({focus})` | ❌ **没有 text 文本输入类型**；不支持伪类 |
| `picker` | `type`: text（`range[]`、`selected` 索引）/ time（`selected` "hh:mm"）；type 不可动态 | `color`、`font-size`(30px)、`selected-color`(#fff)、`selected-font-size`(20px)、`selected-background-color` | `change`：text {newValue,newSelected}；time {hour,minute} | — |
| `slider` | `min`(0)、`max`(100)、`step`(1)、`value`(0) | `color`(#f0f0f0)、`selected-color`(#009688)、`block-color`、`padding-left/right`(32px) | `change{progress, isFromUser}` | — |
| `switch` | `checked` | `thumb-color`(#fff)、`track-color`(#0d84ff) | `change{checked}` | — |

〔来源: 01-official-quickapp-js/components/form/input.md；01-official-quickapp-js/components/form/picker.md；01-official-quickapp-js/components/form/slider.md；01-official-quickapp-js/components/form/switch.md〕

### 5.4 自定义 / 动态组件

见 3.7、3.16。手表/手环不建议多用（内存）。

### 5.5 官方示例工程（open-vela packages_apps wearable）

calendar、chart、multi-screen-calculator、multi_screen_todolist、player、settings、eventBus（`$on`/`$emit`/`$off`/`$judge`）；多屏 demo：todoList、calculator。〔来源: 01-official-quickapp-js/samples/index.md；01-official-quickapp-js/guide/multi-screens/samples.md〕

### 5.6 文本输入：NEORUAA 输入法组件（官方扩展组件引用的社区组件）

- 因 `input` 无文本类型，文本输入需引入输入法组件：把组件复制到 `src/components/InputMethod/`，`<import name="input-method" src="../../components/InputMethod/InputMethod.ux"></import>`。
- 属性：`hide`（true 隐藏）、`keyboardtype`: QWERTY / T9（**胶囊屏无 T9**）、`maxlength`（候选数，默认 5）、`vibratemode`: "" / long / short、`screentype`: circle / rect / pill-shaped。
- 事件：`complete`（`detail.content`）、`delete`、`keyDown`（`detail.content`）、`visibilityChange`（`detail.visible`）。
- designWidth 要求：圆屏 480，方屏 ≥336，胶囊 ≥192；尺寸：圆 480×321、方 100%×255、胶囊 100%×305；字库 6763 字、无声调；候选区用 `if` 不用 `show`。
- 需要 `--enable-custom-component`（自定义组件）。
〔来源: 04-community/vela-doc-guide/input-method-guide.md；01-official-quickapp-js/guide/developer-materials/extension-components.md；01-official-quickapp-js/samples/index.md〕

### 5.7 社区自制组件（非官方）

- `number_choose`（数字选择器，加减按钮，替代 picker）、`InputMethod`、自定义 progress——来自弦电子书项目，仓库中**无源码**，不要假设可用。〔来源: 04-community/vela-doc-guide/vela-ui-guide.md〕

---

## 6. 接口（@system.*）速查

### 6.1 通用调用规则

1. **声明**：manifest `features: [{ "name": "system.xxx" }]`；不声明则不能调用（社区：表现为 `undefined` 或静默失效）。例外（官方标注"无需声明"）：`system.app`、`system.configuration`、`system.router`。
2. **导入**：`import xxx from '@system.xxx'` 或 `const xxx = require('@system.xxx')`。
3. **调用风格**：
   - 同步：无返回值或文档明确同步（如 `audio.play()`、`app.getInfo()`、`configuration.getLocale()`、`crypto.hashDigest()`）。
   - 异步：`{ success(data), fail(data, code), complete() }`。
   - 订阅：回调可多次触发（多数接口参数名为 `callback`，grammar.md 示例用 `success`）；`fail` 触发后不再回调；**多次 subscribe 只有最后一次生效**（geolocation/network/sensor）。
   - **Promise**：官方仅 `fetch.fetch` 文档示例了 `.then/.catch`；其他接口要 Promise 需自行封装（社区 `runAsyncFunc` promisify 范式）。
4. **通用错误码**：200 一般错误、201 用户拒绝、202 参数错误、203 不支持、204 超时、205 重复请求、207 拒绝且不再询问、300 I/O 错误。
5. **设备支持**：很多接口有设备支持表；**手环系列普遍不支持网络类接口**。调用前可 `app.canIUse()` / `this.$canIUse()`（3+）判断，并 try/catch。
〔来源: 01-official-quickapp-js/features/grammar.md；01-official-quickapp-js/features/basic/app.md；01-official-quickapp-js/features/basic/configuration.md；01-official-quickapp-js/features/basic/router.md；01-official-quickapp-js/guide/best-practice/start.md；04-community/vela-doc-guide/ebook-app-tutorial.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 6.2 设备代号（用于支持表）

S1P=Xiaomi Watch S1 Pro；B8P=小米手环 8 Pro；B9=小米手环 9；B9P=小米手环 9 Pro；B10=小米手环 10；S3=Xiaomi Watch S3；S4=Xiaomi Watch S4；RW4/RW5/RW6=REDMI Watch 4/5/6；ECG=小米腕部心电血压记录仪；S5=Xiaomi Watch S5。

### 6.3 总表

| 模块（import） | feature 声明 | 主要方法 | 风格 | 设备支持 / 限制 |
|---|---|---|---|---|
| `@system.app` | 无需 | `getInfo()`→{packageName, icon, name, versionName, versionCode, logLevel, source{packageName, type: shortcut/push/url/barcode/nfc/bluetooth/other}}；`terminate()`；`canIUse(str)` **3+** | 同步 | — |
| `@system.configuration` | 无需 | `getLocale()`→{language, countryOrRegion} | 同步 | — |
| `@system.router` | 无需（教程要求声明，声明无害） | `push/replace/back/clear/getLength/getState/getPages` | 同步 | 见 3.11 |
| `@system.device` | `system.device` | `getInfo({success})`→brand, manufacturer, model, product, osType, osVersionName, osVersionCode, platformVersionName, platformVersionCode, language, region, APILevel(2+), screenWidth, screenHeight, screenDensity(3+), screenShape(rect/circle/pill-shaped(3+)), deviceType(2+: watch/band/smartspeaker)；`getDeviceId`/`getSerial`（需权限 DEVICE_INFO）；`getTotalStorage`/`getAvailableStorage`（字节） | 异步 | — |
| `@system.storage` | `system.storage` | `get({key, default})`（不存在返回 default，默认 ''）、`set({key, value})`（value 为 '' 即删除）、`clear()`、`delete({key})` | 异步 | **值为字符串**，对象需 `JSON.stringify` |
| `@system.file` | `system.file` | `move{srcUri,dstUri}`、`copy`、`list{uri}`→fileList[{uri,length,lastModifiedTime}]、`get{uri,recursive}`→{uri,length,lastModifiedTime,type: dir/file,subFiles}、`delete`、`writeText{uri,text,encoding UTF-8,append}`、`writeArrayBuffer{uri,buffer Uint8Array,position,append}`、`readText{uri,encoding}`→{text}（可读资源路径如 `/Common/demo.txt`）、`readArrayBuffer{uri,position,length}`→{buffer}、`access`、`mkdir{uri,recursive}`、`rmdir{uri,recursive}` | 异步 | 错误 202 参数、300 I/O、301 不存在；写操作不能用资源路径/tmp；及时清理无用文件 |
| `@system.fetch` | `system.fetch` | `fetch({url, data(String/Object/ArrayBuffer), header, method(默认 GET; OPTIONS/GET/HEAD/POST/PUT/DELETE/TRACE/CONNECT), responseType(text/json/file/arraybuffer), success{code,data,headers}, fail, complete})`；也支持 `.then(res => res.data)`（res.data 即 {code,data,headers}）/`.catch(err => err.data, err.code)` | 异步 / Promise | **支持**：S1P、S3、S4、RW5、RW6；**不支持**：B8P、B9、B9P、B10、RW4、ECG |
| `@system.request` | `system.request` | `download({url, header, filename})`→{token}；`onDownloadComplete({token})`→{uri}（1000 失败、1001 无任务） | 异步 | 同 fetch（手环全不支持）；可后台 |
| `@system.uploadtask` **3+** | `system.uploadtask` | `uploadFile({url, filePath, name, header, formData, timeout})`→UploadTask，success{statusCode,data,headers}；`task.abort()`、`onProgressUpdate(cb{progress,totalBytesSent,totalBytesExpectedToSend})`、`offProgressUpdate(cb?)` | 异步 | **支持** S3、S4、RW5、RW6；S1P、手环、RW4 不支持 |
| `@system.interconnect` | `system.interconnect` | `const conn = interconnect.instance()`；`conn.getReadyState({success{status 1 已连 2 断开}})`（1006）；`conn.diagnosis({timeout 默认 10000, success{status 0 OK/204 超时/1001 手机 App 未安装/1000 其他}})`；`conn.send({data: Object, success, fail})`（204、1006）；`conn.onmessage = (data)=>{data.data 为字符串}`、`onopen{isReconnected}`、`onclose{code,data}`、`onerror{code 1000/1001/1006, data}` | 异步 + 事件 | 连接自动建立；包名与签名须与手机 App 一致（1.10）；连接状态用 diagnosis 而非轮询 |
| `@system.audio` | `system.audio` | `play()/pause()/stop()`（同步）；`getPlayState({success{state play/pause/stop, src, currentTime, percent, autoplay, loop, volume, muted, duration}})`；属性 `src`(必填)、`currentTime`(读写)、`duration`(只读)、`autoplay`、`loop`、`volume`[0,1]、`muted`、`streamType`(music/voicecall，**手表手环不支持**)、`meta{title,artist,album}`；事件 `onplay/onpause/onstop/onloadeddata/onended/ondurationchange/onerror` | 同步 + 事件 | 无支持表；可后台 |
| `@system.prompt` | `system.prompt` | `showToast({message, duration})`（默认 1500ms，建议 1500~10000） | 同步 | **只有 showToast**（社区"对话框"说法无依据） |
| `@system.crypto` | `system.crypto` | `hashDigest({data|uri, algo MD5/SHA1/SHA256(默认)/SHA512})`→string（同步）；`hmacDigest({data, algo, key, success{data}})`；`sign({data|uri, algo RSA-SHA256(默认), privateKey})`；`verify({data|uri, algo, signature, publicKey})`→Boolean；`encrypt/decrypt({data, algo RSA(默认)/AES, key(base64), options{transformation RSA/None/PKCS1Padding 或 AES/CBC/PKCS7Padding, iv, ivOffset 0, ivLen 16}})`；`btoa/atob`（同步） | 混合 | **仅** S3、S4、RW5、RW6 |
| `@system.battery` | `system.battery` | `getStatus({success{charging, level 0.0~1.0}})` | 异步 | **仅** B10、S4、RW5、RW6 |
| `@system.bluetooth.ble`（`import bluetoothBLE`） | `system.bluetooth.ble` | `createScanner()`→{`startBLEScan({filters[{deviceId,name,serviceUuid}], options{dutyMode 0 LOW_POWER/1 BALANCED/2 LOW_LATENCY}})`, `stopBLEScan()`, `getScanState`(0 NON_SCAN/1 SCANING), `subscribeBLEDeviceFind({callback(ScanResult[{deviceId,rssi,data,addressType}]), fail})`→id, `unsubscribeBLEDeviceFind(id)`, `close()`}；`createGattClientDevice(deviceId, addressType PUBLIC/RANDOM/ANONYMOUS/UNKNOWN)`→{`connect`(success 仅表示命令已发送), `disconnect`, `close()`, `getServices`, `read/writeCharacteristicValue`, `read/writeDescriptorValue`, `setBLEMtuSize({mtu 22~512})`(连接后), `setNotifyCharacteristicChanged({characteristic, enable})`, `onBLECharacteristicChange=fn`, `onBLEConnectionStateChange=fn`(0~3), `getDeviceName`, `getRssiValue`} | 异步 + 事件 | **仅 Xiaomi Watch S5**；**禁止后台**；错误 203、205、10001 蓝牙关、10008、10012、10013、10014 |
| `@system.brightness` | `system.brightness` | `getValue{value 0~255}`、`setValue{value}`、`getMode{mode 0 手动/1 自动}`、`setMode`、`setKeepScreenOn{keepScreenOn}` | 异步 | 无支持表 |
| `@system.event` **4+** | `system.event` | `publish({eventName, options{params, permissions[]}})`；`subscribe({eventName, callback(res{params, package})})`→id（失败 undefined）；`unsubscribe({id})`；系统事件 `usual.event.BATTERY_CHANGED`(level)、`DISCHARGING`、`CHARGING` | 订阅 | **仅** B10、S4、RW5、RW6 |
| `@system.geolocation` | `system.geolocation` + 权限 `hapjs.permission.LOCATION` | `getLocation({timeout 30000, success{longitude, latitude, altitude, speed, accuracy, accuracyInfo{horizontal,vertical}}})`（203、204）；`subscribe({callback, fail})`（最后一次生效）；`unsubscribe()` | 异步 / 订阅 | **仅** S3、S4、RW5、RW6；可后台 |
| `@system.network` | `system.network` | `getType({success{type: 2g/3g/4g/5g/wifi/bluetooth/none/others}})`；`subscribe({callback})`；`unsubscribe()` | 异步 / 订阅 | **支持** S1P、S3、S4、RW5、RW6（手环不支持） |
| `@system.record` | `system.record` | `start({duration, sampleRate 默认 8000, numberOfChannels 1/2, encodeBitRate, format pcm/opus/wav, success{uri}})`（205、202）；`stop()` | 异步 | **支持表中所有设备均不支持** |
| `@system.sensor` | `system.sensor` | `subscribePressure({callback{pressure hPa}})`/`unsubscribePressure()`；`subscribeAccelerometer({interval: game 20ms/ui 60ms/normal 200ms, callback{x,y,z}, fail})`/`unsubscribeAccelerometer()`；`subscribeCompass({callback{direction 弧度, accuracy 3/2/1/-1/0}, fail(1000)})`/`unsubscribeCompass()` | 订阅（最后一次生效） | 气压：S3、B9P、B10、S4；加速度：**仅** B9、B9P、B10；罗盘：S4、RW5、RW6 |
| `@system.vibrator` | `system.vibrator` | `vibrate({mode: long(默认)/short})`；`start({duration, interval, count})`→{id}、`stop(id)`→Boolean、`getSystemDefaultMode()`→0/1/2 | 同步 | **只有 `vibrate` 全设备支持**；start/stop/getSystemDefaultMode 支持表中全部设备列为不支持 |
| `@system.volume` | `system.volume` | `getMediaValue{value 0~1}`、`setMediaValue{value}`、`onMediaValueChanged` | 异步 | 无支持表 |
| `@system.zip` | `system.zip` | `decompress({srcUri（不能是 tmp）, dstUri（不能是资源/tmp）})`（202、300） | 异步 | — |

〔来源: 01-official-quickapp-js/features/basic/app.md；01-official-quickapp-js/features/basic/configuration.md；01-official-quickapp-js/features/basic/router.md；01-official-quickapp-js/features/basic/device.md；01-official-quickapp-js/features/data/storage.md；01-official-quickapp-js/features/data/file.md；01-official-quickapp-js/features/network/fetch.md；01-official-quickapp-js/features/network/request.md；01-official-quickapp-js/features/network/uploadtask.md；01-official-quickapp-js/features/network/interconnect.md；01-official-quickapp-js/features/other/audio.md；01-official-quickapp-js/features/other/prompt.md；01-official-quickapp-js/features/security/crypto.md；01-official-quickapp-js/features/system/battery.md；01-official-quickapp-js/features/system/bluetooth.md；01-official-quickapp-js/features/system/brightness.md；01-official-quickapp-js/features/system/event.md；01-official-quickapp-js/features/system/geolocation.md；01-official-quickapp-js/features/system/network.md；01-official-quickapp-js/features/system/record.md；01-official-quickapp-js/features/system/sensor.md；01-official-quickapp-js/features/system/vibrator.md；01-official-quickapp-js/features/system/volume.md；01-official-quickapp-js/features/system/zip.md；01-official-quickapp-js/features/grammar.md〕

### 6.4 社区错误 API 写法（禁止照抄）

| 社区写法 | 官方正确写法 | 社区来源 |
|---|---|---|
| `vibrator.vibrate({ duration: 200 })`、`vibrator.vibrateShort()` | `vibrator.vibrate({ mode: 'short' })` | 04-community/vela-doc-guide/vela-dev-guide.md |
| `brightness.set({ brightness: 0.5 })` / `brightness.get` | `brightness.setValue({ value })`（0~255）/ `getValue` | 04-community/vela-doc-guide/vela-dev-guide.md |
| `battery.getLevel`，level 0~100 | `battery.getStatus`，level 0.0~1.0 | 04-community/vela-doc-guide/vela-dev-guide.md |
| `record.start({ filename })`、`stop({ success: filePath })` | `record.start({ ..., success({uri}) })`、`record.stop()` | 04-community/vela-doc-guide/vela-dev-guide.md |
| 罗盘 direction "0-360 度" | 弧度 | 04-community/vela-doc-guide/vela-dev-guide.md |
| `prompt` "提示对话框" | 只有 `showToast` | 04-community/vela-doc-guide/AI-QUICKREF.md |
| `this.params.xxx` | public/protected 同名属性 → `this.xxx` | 04-community/vela-doc-guide/AI-QUICKREF.md |
| `event.$stop()` | `evt.stop()` | 04-community/vela-doc-guide/vela-dev-guide.md |

〔对照官方: 01-official-quickapp-js/features/system/vibrator.md；01-official-quickapp-js/features/system/brightness.md；01-official-quickapp-js/features/system/battery.md；01-official-quickapp-js/features/system/record.md；01-official-quickapp-js/features/system/sensor.md；01-official-quickapp-js/features/other/prompt.md；01-official-quickapp-js/features/basic/router.md；01-official-quickapp-js/guide/framework/template/component.md〕

### 6.5 常用代码范式

**storage 存取 JSON（社区范式，契合官方"值为字符串"）**
```js
import storage from '@system.storage'
function save(key, obj) {
  try {
    storage.set({ key, value: JSON.stringify(obj),
      fail: (data, code) => console.error('storage set fail ' + code) })
  } catch (e) {}
}
function load(key, def, cb) {
  try {
    storage.get({ key, default: JSON.stringify(def),
      success: (val) => { try { cb(JSON.parse(val)) } catch (e) { cb(def) } },
      fail: () => cb(def) })
  } catch (e) { cb(def) }
}
```
- 先同步改内存数据（UI 立即刷新），再立即调用保存，不等待异步回调。
〔来源: 04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md；01-official-quickapp-js/features/data/storage.md〕

**fetch（仅支持网络的设备）**
```js
import fetch from '@system.fetch'
fetch.fetch({ url: 'https://...', responseType: 'json' })
  .then(res => { const body = res.data.data })   // res.data = {code, data, headers}
  .catch(err => console.log(err.code))
```
〔来源: 01-official-quickapp-js/features/network/fetch.md；01-official-quickapp-js/guide/start/data-fetch.md〕

**interconnect**
```js
import interconnect from '@system.interconnect'
const conn = interconnect.instance()
conn.onmessage = (data) => { const msg = JSON.parse(data.data) }   // data.data 为字符串
conn.diagnosis({ success: (r) => { if (r.status === 0) conn.send({ data: { type: 'ping' } }) } })
```
- 有多条消息直接连续 send，不必等待；不要轮询状态。
〔来源: 01-official-quickapp-js/features/network/interconnect.md；01-official-quickapp-js/guide/best-practice/start.md；04-community/vela-doc-guide/ebook-app-tutorial.md〕

**promisify（社区）**
```js
function runAsyncFunc(fn, opts = {}) {
  return new Promise((resolve, reject) => fn(Object.assign({}, opts, { success: resolve, fail: (d, c) => reject({ data: d, code: c }) })))   // 用 Object.assign 而非对象展开（文档只承诺 ES5/ES6）
}
// 用法：runAsyncFunc(storage.get, { key: 'k' }).then(v => ...)
```
〔来源: 04-community/vela-doc-guide/ebook-app-tutorial.md；01-official-quickapp-js/guide/best-practice/start.md（官方也建议 promisify）〕

**振动反馈（社区）**
```js
import vibrator from '@system.vibrator'
function vib() { try { vibrator.vibrate({ mode: 'short' }) } catch (e) {} }  // 低电量/省电模式可能禁用马达
```
〔来源: 04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md〕

**大文件分段读取（社区，电子书）**：`file.readArrayBuffer({ uri, position, length })` 分页读取并自行解码（示例为 UTF-16LE），避免一次载入整文件。〔来源: 04-community/vela-doc-guide/ebook-app-tutorial.md；01-official-quickapp-js/features/data/file.md〕

---

## 7. 多屏适配

### 7.1 设备规格表（官方）

| 类型 | 设备 | 形状 | 尺寸 | 分辨率 | PPI | DPR | 宽度 DP | 长宽比 |
|---|---|---|---|---|---|---|---|---|
| 手表 | Xiaomi Watch S1 Pro | 圆形 | 1.47" | 480×480 | 326 | 2.0 | 240 | 1 |
| 手表 | Xiaomi Watch H1 | 圆形 | 1.43" | 466×466 | 326 | 2.0 | 233 | 1 |
| 手表 | Xiaomi Watch S3 | 圆形 | 1.43" | 466×466 | 326 | 2.0 | 233 | 1 |
| 手表 | Xiaomi Watch S4 sport | 圆形 | 1.43" | 466×466 | 326 | 2.0 | 233 | 1 |
| 手表 | Xiaomi Watch S4 | 圆形 | 1.43" | 466×466 | 326 | 2.0 | 233 | 1 |
| 手表 | REDMI Watch 5 | 矩形 | 2.07" | 432×514 | 324 | 2.0 | 216 | 0.8 |
| 手环 | 小米手环 8 Pro | 矩形 | 1.74" | 336×480 | 336 | 2.1 | 168 | 0.7 |
| 手环 | 小米手环 9 | 胶囊（跑道） | 1.62" | 192×490 | 325 | 2.0 | 96 | 0.4 |
| 手环 | 小米手环 9 Pro | 矩形 | 1.74" | 336×480 | 336 | 2.1 | 168 | 0.7 |
| 手环 | 小米手环 10 | 胶囊 | 1.725" | 212×520 | 326 | 2.0 | 106 | 0.4 |

- 屏幕形状判定：圆屏 W/H=1；矩形 0.5≤W/H<1（推荐 0.7）；胶囊 0.3<W/H<0.5（推荐 0.39）。推荐分辨率：466×466 / 336×480 / 192×490。
- 建议出三套设计（胶囊、圆、矩形）；圆与矩形可复用时出两套（圆+矩形一套、胶囊一套）。
- 圆屏、胶囊屏有**弧形安全区**，主体功能放安全区内。
- Xiaomi Watch S5（480×480，designWidth 480）、REDMI Watch 6、RW4、ECG 记录仪出现在其它文档/支持表，但规格表未列其分辨率（S5 仅在官方 AI 工作流表格中给出）。
〔来源: 01-official-quickapp-js/guide/design/multi-screens.md；01-official-quickapp-js/guide/multi-screens/index.md；01-official-quickapp-js/guide/framework/style/media-query.md；01-official-quickapp-js/tools/dev/official-site-tutorial.md〕

> ❌ 社区错误规格（**不得使用**）：手环 8Pro/9Pro "336×336"（vela-doc-guide/README.md、SKILL.md）；"胶囊 390×312, designWidth 192, REDMI Watch 5/6"（README、AI-QUICKREF、vela-ui-guide、vela-vs-web、SKILL）；"圆屏 454×454"（同上）。官方：RW5 为 432×514 矩形；胶囊屏为手环 9（192×490）/手环 10（212×520）；圆屏为 466×466 / 480×480。〔来源: 04-community/vela-doc-guide/README.md；04-community/vela-doc-guide/vela-dev/SKILL.md；04-community/vela-doc-guide/AI-QUICKREF.md；04-community/vela-doc-guide/vela-ui-guide.md；04-community/vela-doc-guide/vela-vs-web.md〕

### 7.2 designWidth 选择

| 目标 | designWidth | 依据 |
|---|---|---|
| 默认（不填） | 480 | 01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/guide/other/faq.md |
| 圆屏 466 设计稿 | 466 | 01-official-quickapp-js/guide/other/faq.md；01-official-quickapp-js/tools/dev/official-site-tutorial.md |
| S1 Pro / S5（480） | 480 | 01-official-quickapp-js/tools/dev/official-site-tutorial.md |
| RW5（432×514） | 432 | 01-official-quickapp-js/tools/dev/official-site-tutorial.md |
| 手环 8 Pro / 9 Pro（336×480） | 336 | 01-official-quickapp-js/guide/multi-screens/specs.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md |
| 手环 9（192×490） | 192 | 01-official-quickapp-js/tools/dev/official-site-tutorial.md；04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md |

- 原则：**designWidth = 设计稿宽度**，CSS 直接写设计稿 px；系统按 `设备宽 / designWidth` 等比缩放。设为目标设备物理宽时 px 与物理像素 1:1（社区：避免缩放插值模糊）。
- 同一 rpk 跑多个宽度：px 等比缩放会改变内容密度；需要"物理尺寸一致、宽屏多显示内容"时用 **dp（3+）**；需要随父容器自适应时用 **% / flex**。
〔来源: 01-official-quickapp-js/guide/multi-screens/specs.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

### 7.3 适配手段（按推荐顺序）

1. **% 与 flex**（`flex: 1` / `flex-grow`）代替固定 px；长列表 `list` 用 `flex: 1` 占满剩余高度；三段式（固定头/尾 + flex:1 中间）。
2. **媒体查询**（2+/3+，见 4.7）：按 `shape`、`width` dp 范围切样式（注意 S1 Pro/手环 8 Pro/RW4 不支持）。
3. **运行时判断**：`device.getInfo` 的 `screenShape`（circle/rect/pill-shaped）+ `if` 渲染不同结构（需声明 system.device）；例如圆屏用 `progress type="arc"`。
4. **条件编译**：编译期按设备特征剔除代码，出多个 rpk（见 7.4）。
5. 圆屏/胶囊屏标题栏可能换行，需单独处理；px 取整 ±1px 可能导致等分换行。
〔来源: 01-official-quickapp-js/guide/multi-screens/samples.md；01-official-quickapp-js/guide/multi-screens/specs.md；01-official-quickapp-js/guide/framework/style/media-query.md；04-community/vela-doc-guide/vela-ui-guide.md〕

### 7.4 条件编译（官方流程）

```bash
npm install conditional-compilation-webpack-plugin -D
npm install cross-env -D
```
```js
// quickapp.config.js（项目根）
const ConditionalCompilationWebpackPlugin = require("conditional-compilation-webpack-plugin")
module.exports = { plugins: [new ConditionalCompilationWebpackPlugin()] }
```
```json
"scripts": {
  "build:circle": "cross-env DEVICE_TYPE=WATCH SHAPE=CIRCLE aiot build --enable-custom-component",
  "build:rect":   "cross-env DEVICE_TYPE=WATCH SHAPE=RECT aiot build --enable-custom-component"
}
```
语法（ux 模板 / JS / CSS 三种注释）：
```html
<!-- if true: process.env.DEVICE_TYPE === 'WATCH' && process.env.SHAPE === 'CIRCLE' --> ... <!-- endif -->
// if true: process.env.SHAPE === 'RECT'   ...   // endif
/* if true: process.env.SHAPE === 'CIRCLE' */ ... /* endif */
```
〔来源: 01-official-quickapp-js/guide/multi-screens/conditional-compilation.md〕

### 7.5 安全区与边距（官方 + 社区）

| 屏幕 | 建议 | 来源 |
|---|---|---|
| 圆屏 | 安全 padding 上下 50px、左右 36px（官方 AI 工作流规则） | 01-official-quickapp-js/tools/dev/official-site-tutorial.md |
| 手环 9 Pro/8 Pro（336×480） | 外层 `padding: 0 14px`（内容宽 308px）；顶部 ≥10px、底部 ≥12px | 04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md |
| 手环 9（192×490） | `padding: 0 8px`（内容宽 176px）；顶部/底部 ≥24px；单列纵向；字号宜 12~14px（designWidth 192 下） | 04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md |
| 边缘横滑 | 系统右滑返回会拦截距左边缘 0~20px 的滑动；横向控件外边距 ≥14px，翻页用按钮 | 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md |

### 7.6 模拟器多屏预览

- `vela-watch-4.0` 镜像含全部机型（xiaomiWatch 466×466、redmiWatch、xiaomiBand、xiaomiBandpro、xiaomi10Band、xiaomiSoundMini）+ 自定义尺寸（100<宽高<800、类型 watch/band/smartspeaker、形状 circle/rect、dpi）。`vela-miwear-watch-4.0` 只有 466×466。
- 模拟器性能 ≠ 真机，性能结论需真机验证。
- `guide/multi-screens/simulator.md` 内容是概述页重复，**没有模拟器说明**（文档缺口），以 `tools/debug/multi-screens.md` 为准。
〔来源: 01-official-quickapp-js/tools/debug/multi-screens.md；01-official-quickapp-js/guide/multi-screens/simulator.md〕

---

## 8. API Level 差异

- 文档默认所有接口属于 **API Level 1**；更高级别会标注 `2+`/`3+`/`4+`。使用 N 级特性时 manifest `minAPILevel` 必须 ≥ N。
- 运行时可用 `device.getInfo().APILevel`（2+）、`this.$canIUse()` / `app.canIUse()`（3+）判断。

| Level | 框架 / 样式 | 组件 | 接口 |
|---|---|---|---|
| **2** | 媒体查询（仅 `shape` 特性） | 新增 `barcode`、`qrcode`、`image-animator`、`scroll`；通用方法 `getBoundingClientRect`；`swiper` 新增 `swipestart`/`swipeend` | `device.getInfo` 新增 `deviceType`、`APILevel` |
| **3** | 通用样式 `box-shadow`；全局方法 `$canIUse`；媒体查询扩展（width/height/aspect-ratio/device-type、逻辑运算、`@import` 媒体查询）；**dp 单位** | `scroll` 边缘吸附样式 | 新增 `@system.uploadtask`；`app.canIUse`；`device.getInfo` 新增 `screenDensity`，`screenShape` 新增 `pill-shaped` |
| **4** | — | — | 新增 `@system.event`（官方文件将其列在"组件"标题下，实为接口） |

- ⚠️ **文档缺口**：官方未给出"设备 → API Level"对照表。只能从媒体查询支持表推断：手环 9/9 Pro、S3 "支持 2+ 特性"；手环 10、S4、RW5、RW6 "支持"（全部）；S1 Pro、手环 8 Pro、RW4、ECG 不支持媒体查询。`@system.event`（4+）支持 B10/S4/RW5/RW6，与之吻合。**以上为推断，务必以 `device.getInfo().APILevel` 实测为准**。
〔来源: 01-official-quickapp-js/guide/version/index.md；01-official-quickapp-js/guide/version/APILevel2.md；01-official-quickapp-js/guide/version/APILevel3.md；01-official-quickapp-js/guide/version/APILevel4.md；01-official-quickapp-js/guide/framework/manifest.md；01-official-quickapp-js/guide/framework/style/media-query.md；01-official-quickapp-js/features/system/event.md〕
- 社区 vela-dev-guide 的 API Level 表只有"新增特性"占位，无信息量。〔来源: 04-community/vela-doc-guide/vela-dev-guide.md〕

---

## 9. 性能、内存、包体、UI 与表盘

### 9.1 启动性能（FMP ≤ 2000ms 验收）

1. Logo/启动页不要用 `setTimeout` 人为延时；不要在启动页发 http 请求。
2. 先渲染 UI，再加载数据；首页数据做本地缓存，下次先显示缓存。
3. 异步接口 promisify，并行请求用 `Promise.all`（社区）。
4. 隐私协议等静态内容内置；长内容用二维码（H5 链接）展示。
5. 减少 console：避免 >10 行的长日志与大 JSON 打印；调试用 `console.debug`，发布时在 `quickapp.config.js` 用 TerserPlugin `pure_funcs` 去除。
6. 较大（>100kb）动态图片：首次加 loading 页，下载缓存到本地后用 `internal://files/XXX.png` 加载。在线大图非必要不用，尺寸不超过屏幕、大小 ≤200kb，优先本地图或服务端 resize。
7. 互联：用 `diagnosis` 判断连接，不要轮询 `getApkStatus`；多条消息直接连续发送。
〔来源: 01-official-quickapp-js/guide/best-practice/start.md；01-official-quickapp-js/guide/publish/acceptance-criteria.md；04-community/vela-doc-guide/ebook-app-tutorial.md〕

### 9.2 内存

1. **与 UI 无关、无需绑定的数据不要放进 ViewModel**（放模块级 `const`），减少 observer/代理。
2. 对象**原地更新**（`this.list[0].name = 'bb'`），不要整体重新赋值。
3. 页面的属性和方法**不要缓存到全局**（如 `this.$app.$def.arr.push(this.foo)`），否则页面销毁无法释放。
4. `onDestroy` 清除未执行完的定时器（`clearTimeout/clearInterval`）。
5. 读取的文件/storage 数据用完置 `null`。
6. `global.runGC()` 可及时回收，**不要频繁调用**（会卡顿）。
7. `static` 属性：绑定值之后不再变化的节点加 `static`（`<text static>{{name}}</text>`、`<image static src=...>`）；单个属性用 `attr.static="{{v}}"`；`if`/`for` 的静态只能用 `.static`（`if.static="{{bool}}"`）；`static` 优先级高于 `.static`。
8. 自定义组件有独立 ViewModel，手表手环不建议使用。
9. 页面数量尽量少；社区：倾向单页状态机，避免频繁 `router.push`。
〔来源: 01-official-quickapp-js/guide/best-practice/memory.md；01-official-quickapp-js/guide/framework/template/component.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕

> ⚠️ 冲突：社区 SKILL.md / vela-vs-web / AI-QUICKREF 写"内存有限 → **频繁**调用 `global.runGC()`"，ebook 教程在 onDestroy、章节切换时调用。官方明确"**不要频繁调用**"。**以官方为准**：只在大对象释放后（如退出页面、切换大数据块）偶尔调用。〔来源: 04-community/vela-doc-guide/vela-dev/SKILL.md；04-community/vela-doc-guide/vela-vs-web.md；04-community/vela-doc-guide/ebook-app-tutorial.md；01-official-quickapp-js/guide/best-practice/memory.md〕

### 9.3 渲染流畅度与业务

1. list 初始化超过 **10 条**建议分页或触底加载；每页保持 **20 个 item 以内**（tips）。社区电子书示例 pageSize=6。
2. 长文本：二维码或分段渲染。
3. swiper 多图：只保留 3 个子节点，懒加载。
4. 图片不要用 border-radius 裁圆（直接用圆角切图）；图片尺寸 = 组件尺寸；减少动态样式；减少嵌套层级。
5. 图片用 PNG8 等压缩格式（tinypng 压缩）、低分辨率。
6. 全面 try/catch；数据加载显示 loading；按钮防抖；处理无网络、数据异常、JS 错误。
7. 减少请求次数、做缓存；只存储需要的字段。
〔来源: 01-official-quickapp-js/guide/best-practice/business.md；01-official-quickapp-js/guide/other/tips.md；04-community/vela-doc-guide/vela-ui-guide.md〕

### 9.4 包体积红线

| 规则 | 来源 |
|---|---|
| 依赖轻量化；**禁止 axios、lodash、echarts 等第三方库**（官方 AI 工作流规则） | 01-official-quickapp-js/tools/dev/official-site-tutorial.md；01-official-quickapp-js/guide/best-practice/memory.md |
| 公共代码抽到全局方法（app.ux 引入 global.js），避免重复打包 | 01-official-quickapp-js/guide/best-practice/memory.md |
| 删除未用的 css/js/图片；控制文件数量；低分辨率图片 | 01-official-quickapp-js/guide/best-practice/memory.md；01-official-quickapp-js/guide/other/tips.md |
| 用 IDE 审计 + 文件体积分析检查 | 01-official-quickapp-js/tools/debug/audit.md |
| **社区红线：rpk ≤ 50KB**（作者项目 30~36KB）；>100KB 在 AstroBox 传输握手失败或启动闪退（社区认为解包 OOM） | 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；04-community/xiaomi-band-dev-guide/README.md |
| 字库：放弃大型汉字库，用紧凑索引（社区）；NEORUAA 输入法字库 6763 字 | 04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；04-community/vela-doc-guide/input-method-guide.md |

> 说明：官方**未给出 rpk 体积上限数字**；50KB 是社区针对手环侧载的经验值。手表（如 S4、RW5）等设备是否同样受限，文档无依据。保守做法：手环项目按 50KB 控制，其他设备尽量小。

### 9.5 UI 与交互规范

**官方**
- 屏幕形状、安全区、三套设计稿（7.1、7.5）。〔来源: 01-official-quickapp-js/guide/design/multi-screens.md〕
- 文字必须在 `<text>`；按钮防抖；loading 态。〔来源: 01-official-quickapp-js/guide/other/tips.md〕

**社区：手环 9 Pro / 8 Pro 规范（xiaomi-band-dev-guide）**

| 项 | 值 |
|---|---|
| 背景 | `#000000`（AMOLED 纯黑像素关闭；社区称纯白全屏约 100~150mA，纯黑约 15~25mA） |
| Surface 1/2/3 | `#1c1c1e` / `#27272a` / `#38383c` |
| 强调色 | `#ff9500` |
| 主文字 / 次文字 | `#ffffff` / `#aaaaaa`、`#999999` |
| 危险操作 | `#ff453a` |
| 主操作键 | 高 44~48px，宽 308（全宽），间隙 6px |
| 九宫格键 | 高 48~53px，宽 97~100px，间隙 4px |
| 控制栏键 | 高 46px，宽 42~52px（5~6 键），间隙 2~4px |
| 列表卡片 | 高 60~72px，宽 308，间隙 8px |
| 触控最低高度 | ≥40px（盲按 44~48px） |
| 相反操作间距 | ≥6px 或高对比底色区分 |
| 小图标热区 | 外包 div ≥28×32px，居中 |
| 振动 | 每次点击第一行短振；边界事件不振或振两次；try/catch |

〔来源: 04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md；04-community/xiaomi-band-dev-guide/README.md〕

**社区：弦电子书风格（vela-doc-guide/vela-ui-guide，336×480）**

| 项 | 值 |
|---|---|
| 颜色 | 背景 #000000、卡片 #262626、强调/选中 #0D6EFF、警告 #ad0000；文字 #FFFFFF、次级 rgba(255,255,255,0.6)、辅助 0.4、禁用 0.5；章节 #aaa/#666 |
| 字号 | 顶部时间 24px/lh32 bold 0.6；页面大标题 32px/lh42 bold；列表主标题 32 bold；副标题 28 bold 0.6；正文 30/lh34；辅助 20~24/lh28 |
| 行高公式 | `lineHeight = parseInt(-0.01*fs² + 1.62*fs - 3.23)`（fs=20→28，30→34，32→36） |
| 间距 | xs 2~4、s 6、m 10~14、l 20、xl 24、xxl 36~48 |
| 结构 | 顶部 hd.png 336×102；返回 back.png 72×72 位于 (6,6)；更多 (258,6)；标题 (78,35) 宽 180；list 绝对定位 `padding: 86px 6px`；底部 bt.png 336×102 |
| 组件尺寸 | 列表项 100%×112 圆角 36；图标按钮 72×72；开关 60×42 / 102×72；输入框 324×182 圆角 36；数字选择 324×72；封面 64×84 圆角 8；箭头 48×48；勾选 40×40 |
| 选中态 | `class="item {{sel ? 'item2' : ''}}"`，`.item2` 背景 #0D6EFF |
| 开关 | 图片 Switch_ON.png / Switch_OFF.png 三元切换 |

〔来源: 04-community/vela-doc-guide/vela-ui-guide.md；04-community/vela-doc-guide/vela-ui-quickref.md；04-community/vela-doc-guide/vela-dev/SKILL.md〕

> ⚠️ 两套社区规范色板不同（#ff9500 橙 vs #0D6EFF 蓝），属风格选择，非平台约束。电子书风格样式中的 `<img>`、`background:` 简写、`!important`、`overflow: hidden`、`:root` 变量均**非官方支持写法**，套用前替换为 `<image>`、`background-color` 并删除不支持项。另：其 `.item` 写了 `border-radius: 36px` 却未设 border-width/border-color，按官方规则圆角可能不生效（官方自身示例也有同样写法，见第 10 章）。

### 9.6 表盘（Watchface）要点（社区，非 JS 快应用）

- 表盘不是 JS 快应用，由系统图形管线直接绘制；文件 `.bin`/`.face`，内含 `info.json`（作者、版本、分辨率、机型）、图层布局（XML/JSON：坐标、层级、数据源绑定）、PNG 图集、`aod/` 图集。
- 工具：EasyFace（github.com/m0tral/EasyFace，可反编译、内置模拟器）、Mi-Create（github.com/ooflet/Mi-Create，`.fprj` 工程）、AstroBox（推送）。
- 切图：背景纯黑；数字 0~9 切片等高、紧贴轮廓；透明 PNG；TinyPNG 压缩，总包 ≤2MB。
- 手环 9 Pro 336×480 左右 14px 安全边距；手环 9 192×490 上下 ≥24px。
- **AOD**：OPR（非黑像素占比）≤10%（超过 10~15% 会被降级为系统时钟或熄屏）；周期性 1~2px 像素位移防烧屏；AOD 刷新率极低（文档同时写"1Hz"和"每分钟刷新一次"，自相矛盾），不要放秒针/动画。
- 表盘热区拉起快应用：06 文档示例 `{"type":"hotspot","rect":{x,y,w,h},"action":{"type":"launch_app","package":"<pkg>","target":"pages/index"}}`；03 文档示例 `{"action":"jump_app","target":"<pkg>"}`——**两处格式不一致且无官方出处，仅供参考**。
- 部署：EasyFace/Mi-Create 导出目标机型 `.face/.bin` → 强停小米运动健康 → AstroBox "表盘管理/自定义安装" → 手环长按主屏选择。
〔来源: 04-community/xiaomi-band-dev-guide/docs/06-watchface-development.md；04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md〕

### 9.7 其他应用形态（仅了解，勿混用）

**Lua 应用（02-official-lua）**：设备环境 NuttX 12.3.0 (Xiaomi Vela) + Lua 5.4.0，验证平台为 466×466 圆形模拟器；模块 `lvgl`（UI 控件 + disp/fs/group/indev）、`dataman`（数据订阅 subscribe/pause/resume）、`topic`、`activity`（isShown）、`animengine`（x/y/rotate/opacity/scale 动画）、`navigator`（finish）、`vibrator`（start/cancel + 15 种模式）、`screen`（空表）；标准库可用 io（无 `io.popen`）、os（`os.execute` 可调 shell）、debug、math、string、table、coroutine、utf8、package。接口多为**逆向分析所得**，探索代码应放在按钮/定时器回调中执行。与 JS 快应用（.ux + @system.*）完全不同。〔来源: 02-official-lua/intro/overview.md；02-official-lua/intro/conventions.md；02-official-lua/intro/getting-started.md〕

**NuttX Shell（03-official-shell）**：设备侧 `nsh`，非 POSIX sh：支持 `;`、管道、`>`/`>>`、`set`/`test`/`expr`/`source`、if/while/until；**不支持** `$(cmd)`、`&&`/`||`、`2>&1`、glob、grep/sed/awk。挂载：`/data`（fatfs 可写）、`/tmp`（tmpfs，重启清空）、其余只读。相关运行时命令：`qjs`（QuickJS）、`lua`、`iwasm`、`vapp`（AIoT JS 应用引擎，同 `aiot`）、`aiotjsc`（JS 字节码编译）、`am start|stop <pkg>`、`pm install|uninstall <pkg|rpk>`。仅用于设备调试，快应用代码中无法调用。〔来源: 03-official-shell/index.md；03-official-shell/syntax-and-environment.md；03-official-shell/runtimes-and-media.md〕

---

## 10. 坑点总清单（编号，开发时逐条规避）

### 10.1 manifest / 工程

1. `features` 漏声明 → 接口不可用（undefined/静默失败）。每 `import '@system.xxx'` 必须声明（app/configuration/router 例外，router 声明也无害）。〔01-official-quickapp-js/features/grammar.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕
2. 页面没在 `router.pages` 注册 → 编译时被跳过，跳转失败。〔01-official-quickapp-js/guide/framework/manifest.md〕
3. `router.pages` 是**对象**（key=页面名），不是 `pages: [{src}]` 数组。〔01-official-quickapp-js/guide/framework/manifest.md；04-community/vela-doc-guide/vela-dev/SKILL.md〕
4. `path` 重复 → 非法；不写 path 默认 `/<页面名>`。〔01-official-quickapp-js/guide/framework/manifest.md〕
5. `name` 超过 6 个汉字 / 与商店名不一致。〔01-official-quickapp-js/guide/framework/manifest.md〕
6. `package` 与原生应用相同（非互联应用）；或升级时修改 `package` → 用户数据丢失。〔01-official-quickapp-js/guide/framework/manifest.md；04-community/xiaomi-band-dev-guide/docs/05-sideload-and-deployment.md〕
7. 忘记递增 `versionCode`。〔01-official-quickapp-js/guide/framework/manifest.md〕
8. 使用 N 级特性但 `minAPILevel` < N。〔01-official-quickapp-js/guide/framework/manifest.md〕
9. 不写 `deviceTypeList: ["watch"]`（社区：可能被拒装）。〔04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕
10. 后台能力只写 `config.background.features` 没写顶层 `features`。〔01-official-quickapp-js/guide/framework/manifest.md〕
11. 删除了 app.ux 中的 `/**manifest**/` 标识注释。〔01-official-quickapp-js/guide/framework/ux.md〕
12. `npm i` 失败未配置 `.npmrc` 镜像。〔01-official-quickapp-js/guide/start/use-ide.md〕
13. release 证书每次不同 → 无法更新上架；互联应用签名/包名与手机 App 不一致 → 通信失败。〔01-official-quickapp-js/guide/other/faq.md；01-official-quickapp-js/features/network/interconnect.md〕
14. 用 AstroBox 侧载 release 包 → 证书校验失败，应用 debug 包；侧载前未强停小米运动健康 → GATT 133。〔04-community/xiaomi-band-dev-guide/docs/05-sideload-and-deployment.md〕
15. 使用自定义组件却没加 `--enable-custom-component`。〔01-official-quickapp-js/guide/start/toolkit-params.md〕

### 10.2 模板 / 脚本

16. template 多个根节点，或用 `block` 作根。〔01-official-quickapp-js/guide/framework/template/index.md〕
17. 文字裸写在 `div` 里（不渲染）——必须 `<text>`。〔01-official-quickapp-js/guide/start/user-interface.md〕
18. `for` 循环对象（只支持数组）。〔01-official-quickapp-js/guide/framework/template/for.md〕
19. `for="item in list"` 别名在部分版本渲染空白（社区）——统一 `for="{{list}}"` + `$item/$idx`。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
20. 自定义循环变量以 `$`/`_` 开头；`tid` 字段不存在/不唯一/写表达式。〔01-official-quickapp-js/guide/framework/template/for.md〕
21. 同一标签同时写 `for` 和 `if`（if 先执行，易误解）。〔01-official-quickapp-js/guide/framework/template/for.md〕
22. `if/elif/else` 不相邻。〔01-official-quickapp-js/guide/framework/template/if.md〕
23. 同 `type` 的 `list-item` 结构不一致 / 用 if、show 改结构。〔01-official-quickapp-js/components/container/list-item.md；01-official-quickapp-js/guide/other/tips.md〕
24. `data` 与 `public/protected/private` 混用；页面用 `data`、组件用 `private`。〔01-official-quickapp-js/guide/framework/script/page-data.md〕
25. 数据名以 `$`/`_` 开头或用 for/if/show/tid。〔01-official-quickapp-js/guide/framework/script/page-data.md〕
26. 目标页未在 public/protected 声明参数同名属性 → 收不到 router 参数；参数值被转为字符串（数字需 parseInt）。〔01-official-quickapp-js/features/basic/router.md〕
27. 用 `this.params.xxx` 取参（社区错误）。〔04-community/vela-doc-guide/AI-QUICKREF.md〕
28. 事件参数里嵌套 `{{}}`（toolkit 2.0 不允许）：写 `onclick="fn(a, b)"`。〔01-official-quickapp-js/tools/toolkit/update.md〕
29. 子组件直接修改对象/数组 prop（会污染父组件）。〔01-official-quickapp-js/guide/framework/template/props.md〕
30. 组件通信用完不 `evt.stop()` → 一直传递；写成 `event.$stop()`（社区错误）。〔01-official-quickapp-js/guide/framework/template/component.md〕
31. `$watch` 监听数组索引（不支持）。〔01-official-quickapp-js/guide/framework/script/global-data-method.md〕
32. 在 `onInit` 里取 DOM（应在 `onReady` 之后；getBoundingClientRect 在 onShow 后）。〔01-official-quickapp-js/guide/framework/script/lifecycle.md；01-official-quickapp-js/components/general/methods.md〕
33. 把请求放 `onShow` 未意识到亮屏会重复触发。〔01-official-quickapp-js/guide/other/tips.md〕
34. `onRefresh(query)` 以为参数会自动更新数据。〔01-official-quickapp-js/guide/framework/other/launch-mode.md〕
35. 使用 `window`/`document`/`localStorage`/`fetch()`/`XMLHttpRequest`/Node `fs` → 白屏。〔01-official-quickapp-js/guide/framework/script/index.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
36. 引入 axios/lodash/echarts 等第三方库。〔01-official-quickapp-js/tools/dev/official-site-tutorial.md〕
37. 页面属性/方法挂到全局 → 内存泄漏；定时器/订阅未在 onDestroy 清理。〔01-official-quickapp-js/guide/best-practice/memory.md〕
38. 频繁 `global.runGC()` → 卡顿。〔01-official-quickapp-js/guide/best-practice/memory.md〕
39. 只在 onDestroy 存盘 → 息屏被杀丢数据；应"变动即存盘"+ onHide 兜底。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
40. storage 存对象未 `JSON.stringify`；`JSON.parse` 未 try/catch；`value: ''` 会删除 key。〔01-official-quickapp-js/features/data/storage.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕
41. 外部接口（vibrator/storage/JSON.parse）未 try/catch（社区：低电量马达可能禁用）。〔04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md〕
42. Emoji 代理对按 1 个码元删除导致乱码。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
43. `<text>` 内嵌带样式 `<span>`，社区称手环真机渲染错乱（官方允许 span）——手环上用多个并排 `<text>` 或字符串拼接。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；01-official-quickapp-js/components/basic/span.md〕
44. image `src` 中做字符串拼接（会告警）→ 预先在 JS 中拼好。〔01-official-quickapp-js/guide/other/tips.md〕
45. 被导入文件引用资源用相对路径（不同目录时失效）→ 用绝对路径；URI 中出现 `..`。〔01-official-quickapp-js/guide/framework/project-structure.md〕
46. 多次 `subscribe` 以为都会生效（只有最后一次）。〔01-official-quickapp-js/features/system/geolocation.md；01-official-quickapp-js/features/system/sensor.md〕

### 10.3 样式

47. 使用后代/子/兄弟/属性/通配选择器、伪类、伪元素；less/scss 嵌套产生后代选择器。〔01-official-quickapp-js/guide/start/user-interface.md；01-official-quickapp-js/tools/toolkit/update.md〕
48. 以为有样式继承（父 color/font-size 不会传给子 text）。〔01-official-quickapp-js/guide/start/user-interface.md〕
49. 忘记 `flex-direction: column`（默认 row）。〔01-official-quickapp-js/components/general/style.md〕
50. 黑底页面 `<text>` 未设 color（默认 rgba(0,0,0,0.54)，看不见）。〔01-official-quickapp-js/components/basic/text.md〕
51. 负 margin/padding。〔01-official-quickapp-js/components/general/style.md〕
52. border-radius 未配 border-width + border-color。〔01-official-quickapp-js/components/general/style.md〕
53. `left/top` 用 %；用 rpx/vw/em。〔01-official-quickapp-js/components/general/style.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md〕
54. `display: block/inline/grid`；`position: fixed`。〔01-official-quickapp-js/components/general/style.md〕
55. `list`/`list-item`/`scroll` 未设显式尺寸（list 需高度；list-item 宽高；scroll 竖向定高、横向定宽）。〔01-official-quickapp-js/components/container/list.md；01-official-quickapp-js/components/container/list-item.md；01-official-quickapp-js/components/container/scroll.md〕
56. list/swiper 子元素使用 absolute 定位（不生效）。〔01-official-quickapp-js/components/general/style.md〕
57. @keyframes 省略 0% 或 100%；keyframes 中 width/height 用 %；3D transform；transition 作用于 color/transform。〔01-official-quickapp-js/components/general/animation-style.md〕
58. 在不支持的设备上依赖 background-size/position；依赖 background-repeat。〔01-official-quickapp-js/components/general/background-img-styles.md〕
59. 在 S1 Pro/手环 8 Pro/RW4 上依赖媒体查询；在 2+ 设备上用 width/pill-shaped 等 3+ 特性；媒体查询 width 写了单位。〔01-official-quickapp-js/guide/framework/style/media-query.md〕
60. 角度不写 `deg`。〔01-official-quickapp-js/guide/other/tips.md〕
61. 等分布局未考虑 px 取整 ±1px 导致换行。〔01-official-quickapp-js/guide/multi-screens/samples.md〕
62. `<img>` 标签（应为 `<image>`）、`background:` 简写、`!important`、`:root` 变量（社区写法，非官方）。〔04-community/vela-doc-guide/vela-ui-guide.md；01-official-quickapp-js/components/basic/image.md〕

### 10.4 设备 / 接口

63. 在手环上用 fetch/request/uploadtask/network/geolocation（手环全不支持）。〔01-official-quickapp-js/features/network/fetch.md；01-official-quickapp-js/features/system/network.md〕
64. 用 `vibrator.start/stop/getSystemDefaultMode`（支持表全设备不支持）——只用 `vibrate({mode})`。〔01-official-quickapp-js/features/system/vibrator.md〕
65. 用 record（无设备支持）、bluetooth（仅 S5）、crypto（仅 S3/S4/RW5/RW6）、battery/event（仅 B10/S4/RW5/RW6）。〔01-official-quickapp-js/features/system/record.md；01-official-quickapp-js/features/system/bluetooth.md；01-official-quickapp-js/features/security/crypto.md；01-official-quickapp-js/features/system/battery.md；01-official-quickapp-js/features/system/event.md〕
66. 加速度计只在 B9/B9P/B10；罗盘只在 S4/RW5/RW6；气压 S3/B9P/B10/S4。〔01-official-quickapp-js/features/system/sensor.md〕
67. 以为 input 有文本输入框（没有）。〔01-official-quickapp-js/components/form/input.md〕
68. 以为 prompt 有对话框（只有 showToast）。〔01-official-quickapp-js/features/other/prompt.md〕
69. 套用社区错误设备规格（336×336、390×312、454×454）。〔见 7.1〕
70. 用社区错误 API 签名（6.4 表）。
71. 边缘 0~20px 横滑被系统返回手势拦截。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
72. rpk 过大（社区：手环 >100KB 侧载失败，目标 ≤50KB）；在线大图 >200kb。〔04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md；01-official-quickapp-js/guide/best-practice/start.md〕
73. 模拟器表现正常就以为真机正常（性能不同、真机无 DevTools）。〔01-official-quickapp-js/tools/debug/multi-screens.md；04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md〕
74. `vela-watch-4.0` 镜像启动黑屏误判为 bug（正常现象）。〔01-official-quickapp-js/tools/emulator/emulator-run.md〕

---

## 11. 最小可运行模板

> 目标：圆屏手表（466×466，designWidth 466）。其它设备按 7.2 改 `designWidth`。布局只用 flex/%，可在其他形状上运行。
> 所有写法均可在文档中找到出处（见行内注释）。图标 `/common/logo.png` 需自备 192×192 PNG。

### 11.1 `src/manifest.json`

```json
{
  "package": "com.example.velademo",
  "name": "示例应用",
  "icon": "/common/logo.png",
  "versionName": "1.0.0",
  "versionCode": 1,
  "minAPILevel": 1,
  "deviceTypeList": ["watch"],
  "features": [
    { "name": "system.router" },
    { "name": "system.storage" },
    { "name": "system.vibrator" },
    { "name": "system.prompt" }
  ],
  "config": {
    "logLevel": "log",
    "designWidth": 466
  },
  "router": {
    "entry": "pages/index",
    "pages": {
      "pages/index": {
        "component": "index"
      }
    }
  },
  "display": {
    "backgroundColor": "#000000"
  }
}
```

字段出处（JSON 不能写注释，故列于此）：
- package/name(≤6 汉字)/icon(192×192)/versionName/versionCode/minAPILevel/features/config/router/display/deviceTypeList：01-official-quickapp-js/guide/framework/manifest.md
- `deviceTypeList: ["watch"]` 显式声明、`display.backgroundColor: #000000`、`entry: "pages/index"` 写法：04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md
- `system.router` 声明（可省，声明无害）：01-official-quickapp-js/guide/start/add-interactivity.md；01-official-quickapp-js/features/basic/router.md
- designWidth 466（圆屏 466 设计稿）：01-official-quickapp-js/guide/other/faq.md；01-official-quickapp-js/tools/dev/official-site-tutorial.md
- 若页面需要跳转：新增 `"pages/detail": { "component": "detail" }` 并创建 `src/pages/detail/detail.ux`，用 `router.push({ uri: '/pages/detail' })`（01-official-quickapp-js/guide/start/project-overview.md）。

### 11.2 `src/app.ux`

```html
<script>
  // 应用级入口（01-official-quickapp-js/guide/framework/ux.md）
  // - 代码必须写在 <script> 内（01-official-quickapp-js/guide/other/tips.md）
  // - 若 IDE/脚手架生成的 app.ux 中含有 manifest 标识注释（见规范 2.8），必须原样保留（01-official-quickapp-js/guide/framework/ux.md）
  // - 导出的属性/方法在页面中通过 this.$app.$def.xxx 访问（01-official-quickapp-js/guide/framework/script/global-data-method.md）
  export default {
    // App 生命周期：onCreate/onShow/onHide/onDestroy/onError（01-official-quickapp-js/guide/framework/script/lifecycle.md）
    onCreate() {
      console.info('app onCreate')
    },
    onError(e) {
      console.error('app onError: ' + (e && e.message))
    },
    // 全局公共方法示例（01-official-quickapp-js/guide/best-practice/memory.md：公共代码放全局）
    safeParse(str, def) {
      try { return JSON.parse(str) } catch (err) { return def }
    }
  }
</script>
```

> 注意：模板代码中**故意不写出**该标识的字面文本——官方只说明 app.ux 编译后会包含 manifest 配置、不要删除该标识，未说明其处理机制（疑似为注入位置），把它写进其它注释里可能被误处理。用脚手架生成的 app.ux 自带该标识时保留即可；不要手工把标识写进别的注释。

### 11.3 `src/pages/index/index.ux`

```html
<template>
  <!-- 单根节点，且不是 block（01-official-quickapp-js/guide/framework/template/index.md） -->
  <div class="page">
    <!-- 文字必须在 text 内；黑底必须设 color（01-official-quickapp-js/components/basic/text.md） -->
    <text class="title">{{title}}</text>
    <text class="count">{{count}}</text>
    <div class="row">
      <!-- @click 简写；回调末尾自动追加 evt（01-official-quickapp-js/guide/framework/template/event.md） -->
      <text class="btn" @click="onMinus">-</text>
      <text class="btn" @click="onPlus">+</text>
    </div>
    <!-- list 只能包含 list-item，且须显式高度（01-official-quickapp-js/components/container/list.md） -->
    <list class="list">
      <!-- for 用 $item/$idx（社区保守写法，官方也支持）；tid 指向唯一字段（01-official-quickapp-js/guide/framework/template/for.md） -->
      <list-item type="item" class="item" for="{{items}}" tid="id" @click="onItemClick($idx)">
        <text class="item-text">{{$item.name}}</text>
      </list-item>
    </list>
  </div>
</template>

<style>
  /* 只用 class 选择器；不嵌套（01-official-quickapp-js/guide/start/user-interface.md） */
  .page {
    width: 100%;
    height: 100%;
    flex-direction: column;          /* 默认 row，须显式写（01-official-quickapp-js/components/general/style.md） */
    align-items: center;
    padding-top: 50px;               /* 圆屏安全区 上下 50 / 左右 36（01-official-quickapp-js/tools/dev/official-site-tutorial.md） */
    padding-bottom: 50px;
    padding-left: 36px;
    padding-right: 36px;
    background-color: #000000;
  }
  .title {
    font-size: 32px;
    font-weight: bold;
    color: #ffffff;
  }
  .count {
    margin-top: 8px;
    font-size: 60px;
    color: #ffffff;
  }
  .row {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
  }
  .btn {
    width: 120px;
    height: 64px;
    margin-left: 10px;
    margin-right: 10px;
    line-height: 64px;
    text-align: center;
    font-size: 40px;
    color: #ffffff;
    background-color: #262626;
    border-width: 1px;               /* border-radius 需同时设置 border-width 与 border-color（01-official-quickapp-js/components/general/style.md） */
    border-color: #262626;
    border-radius: 32px;
  }
  .list {
    width: 100%;
    height: 150px;                   /* list 显式高度 */
    margin-top: 10px;
  }
  .item {
    width: 100%;                     /* list-item 显式宽高（01-official-quickapp-js/components/container/list-item.md） */
    height: 64px;
    margin-bottom: 6px;
    padding-left: 20px;
    padding-right: 20px;
    align-items: center;
    background-color: #262626;
    border-width: 1px;
    border-color: #262626;
    border-radius: 32px;
  }
  .item-text {
    font-size: 28px;
    color: #ffffff;
    lines: 1;                        /* text-overflow 需配合 lines（01-official-quickapp-js/components/basic/text.md） */
    text-overflow: ellipsis;
  }
</style>

<script>
  // import 的模块都已在 manifest features 声明（01-official-quickapp-js/features/grammar.md）
  import storage from '@system.storage'
  import vibrator from '@system.vibrator'
  import prompt from '@system.prompt'

  // 与 UI 无关的常量放模块级，不进 ViewModel（01-official-quickapp-js/guide/best-practice/memory.md）
  const STORE_KEY = 'demo_count'

  export default {
    // 页面级数据用 private/protected/public，不与 data 混用（01-official-quickapp-js/guide/framework/script/page-data.md）
    private: {
      title: 'Vela Demo',
      count: 0,
      items: [
        { id: 1, name: '条目一' },
        { id: 2, name: '条目二' },
        { id: 3, name: '条目三' }
      ]
    },

    onInit() {
      this.loadCount()
    },

    // 息屏/切后台立即兜底保存（04-community/xiaomi-band-dev-guide/docs/04-pitfalls-and-solutions.md）
    onHide() {
      this.saveCount()
    },

    onDestroy() {
      this.saveCount()
    },

    // return true 拦截返回，false 放行（01-official-quickapp-js/guide/framework/script/lifecycle.md）
    onBackPress() {
      return false
    },

    loadCount() {
      // storage 值为字符串；不存在时返回 default（01-official-quickapp-js/features/data/storage.md）
      storage.get({
        key: STORE_KEY,
        default: '0',
        success: (val) => {
          const n = parseInt(val, 10)
          this.count = isNaN(n) ? 0 : n
        },
        fail: () => {
          this.count = 0
        }
      })
    },

    saveCount() {
      try {
        storage.set({ key: STORE_KEY, value: String(this.count) })
      } catch (e) {}
    },

    // 只用 vibrate({mode})，全设备支持；try/catch 防低电量禁用马达
    // （01-official-quickapp-js/features/system/vibrator.md；04-community/xiaomi-band-dev-guide/docs/03-ui-and-interaction.md）
    vib() {
      try { vibrator.vibrate({ mode: 'short' }) } catch (e) {}
    },

    onPlus() {
      this.vib()
      this.count += 1
      this.saveCount()      // 变动即存盘
    },

    onMinus() {
      this.vib()
      if (this.count > 0) {
        this.count -= 1
        this.saveCount()
      }
    },

    onItemClick(idx) {
      this.vib()
      // prompt 只有 showToast（01-official-quickapp-js/features/other/prompt.md）
      prompt.showToast({ message: this.items[idx].name, duration: 1500 })
    }
  }
</script>
```

### 11.4 构建与运行

```bash
# 依赖失败时先写 .npmrc：registry="https://registry.npmmirror.com/"
npm install
npx aiot build            # → dist/*.debug.rpk（真机/AstroBox 侧载用）
npx aiot release          # → release 包，需要 sign/private.pem + sign/certificate.pem
```
〔来源: 01-official-quickapp-js/tools/toolkit/start.md；01-official-quickapp-js/guide/start/use-ide.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

- 用 `npm create aiot` / `npx create-aiot ux --name <名>` 或 IDE 模板生成工程后，再把以上三个文件覆盖进 `src/`（推荐，可拿到脚手架自带的 package.json/app.ux 标识）。〔来源: 01-official-quickapp-js/tools/dev/official-site-tutorial.md；01-official-quickapp-js/tools/toolkit/start.md〕

---

## 12. 交付前检查清单

### 12.1 配置
- [ ] `package` 唯一、格式 `com.xxx.yyy`；升级未改动；互联应用与手机 App 包名一致。
- [ ] `name` ≤6 汉字；`icon` 存在且 192×192。
- [ ] `versionCode` 已 +1，`versionName` 已更新。
- [ ] `minAPILevel` ≥ 所用最高 API Level 特性（2+/3+/4+）。
- [ ] 每个 `@system.*` import 都在 `features` 中声明；没有声明但未用的 feature 也已删除（审计会提示"未使用系统功能"）。
- [ ] `router.entry` 存在；所有页面已在 `router.pages` 注册；path 唯一；跳转 uri 与之对应。
- [ ] `config.designWidth` 与设计稿/目标设备一致；`deviceTypeList: ["watch"]`。
- [ ] 后台能力同时写在 `config.background.features` 和顶层 `features`。
- [ ] app.ux 的 manifest 标识注释未删。

### 12.2 代码
- [ ] 无 `window/document/localStorage/fetch()/XMLHttpRequest/require('fs')`，无第三方库。
- [ ] 每个 template 单根、非 block；所有文字在 `<text>`；无 `<img>`。
- [ ] for 只循环数组、使用 `$item/$idx`、`tid` 唯一；没有 for+if 同标签。
- [ ] list-item 同 type 结构一致，宽高显式；list 有高度。
- [ ] 页面数据未混用 data；参数接收用 public/protected 同名属性。
- [ ] 子组件不修改 prop；事件通信 `evt.stop()`；自定义组件已评估内存，构建带 `--enable-custom-component`。
- [ ] 所有接口调用有 fail 处理和 try/catch；JSON.parse 有兜底。
- [ ] 定时器、订阅（geolocation/sensor/network/event）在 onDestroy 中清理。
- [ ] 关键状态"变动即存盘"，onHide/onDestroy 兜底。
- [ ] onBackPress 多级视图正确拦截。
- [ ] 未调用目标设备不支持的接口（对照 6.3 支持表），必要时 `$canIUse` 判断。
- [ ] 不在启动页 setTimeout / 发请求；首屏先渲染。
- [ ] 无长 console；发布构建去除 console（Terser pure_funcs）。

### 12.3 样式
- [ ] 只用 class（或 id/tag）选择器，无后代/伪类/嵌套。
- [ ] 纵向容器写了 `flex-direction: column`。
- [ ] 所有 text 设置了 color（黑底）。
- [ ] 无负 margin/padding；border-radius 配 border-width + border-color。
- [ ] 无 rpx/vw/em/%定位/display:block/position:fixed/z-index/overflow/!important/CSS 变量。
- [ ] 动画 keyframes 显式 0%/100%，仅用可动画属性；transition 属性在白名单内。
- [ ] 媒体查询只在支持设备上依赖；width 类查询无单位。
- [ ] 圆屏/胶囊屏内容在安全区内；触控目标 ≥40px（手环社区规范）。

### 12.4 资源与包体
- [ ] 图片为 PNG（压缩，PNG8/tinypng），尺寸 = 显示尺寸，不超过屏幕；在线图 ≤200kb，>100kb 动态图下载到 `internal://files`。
- [ ] 删除未用资源/代码；IDE 审计 9 项通过。
- [ ] 手环项目 rpk 目标 ≤50KB（社区红线）。

### 12.5 测试
- [ ] 模拟器多屏（vela-watch-4.0 镜像：圆/矩形/胶囊）预览无错位、无溢出。
- [ ] 真机：安装（小米运动健康 Debug 或 AstroBox debug 包）、启动 FMP ≤2000ms、息屏后恢复数据不丢、返回手势正确、内存快照无持续增长。
- [ ] 日志：IDE 输出无报错；真机必要时拉取固件日志。

### 12.6 发布
- [ ] 使用固定的 release 证书 `aiot release`（IDE "发布"会检查签名文件）。
- [ ] 符合验收标准（FMP ≤2000ms）；联系 zhangyuanpu@xiaomi.com 发布。
〔来源: 汇总自第 1~11 章各引用〕

---

## 附录 A：官方 vs 社区 / 文档内部冲突一览

| # | 主题 | 说法 A | 说法 B | 采信 |
|---|---|---|---|---|
| 1 | router 是否声明 | features/basic/router.md："无需声明" | guide/start/add-interactivity.md：要求声明 system.router | 声明（无害） |
| 2 | 图片 src 拼接 | guide/other/tips.md：不要拼接（告警） | guide/start/user-interface.md 教程拼接 `/common/icons/{{x}}.png` | tips（JS 中拼好） |
| 3 | 互联连接状态 | guide/other/faq.md：轮询 getApkStatus | guide/best-practice/start.md：用 diagnosis，不要轮询 | 最佳实践（diagnosis） |
| 4 | minAPILevel 缺省 | manifest.md 表格：默认 1 | 同文件："不填按内测版本处理" | 显式写 minAPILevel |
| 5 | minPlatformVersion | manifest.md 示例与社区示例都写 1000 | manifest 字段表无此字段 | 以 minAPILevel 为准 |
| 6 | border-radius | components/general/style.md：须同时设 border-width、border-color | 同文件示例、conditional-compilation 示例、社区样式都只写 border-radius | 按规则写全（零风险） |
| 7 | flex-wrap | 通用样式表未列 | guide/multi-screens/samples.md 使用 `flex-wrap: wrap` | 谨慎使用、真机验证 |
| 8 | 后代选择器 | 官方：不支持 | 官方 component.md 示例用 less 嵌套（编译成后代选择器） | 不嵌套 |
| 9 | list 高度 | list.md："需要显式设置高度" | samples.md 长列表用 `flex: 1` | 显式高度更稳 |
| 10 | 选择器范围 | 官方：class/id/tag/逗号 | 社区 AI-QUICKREF、vela-dev-guide："仅 class" | 官方；实践只用 class |
| 11 | 设备规格 | 官方：B8P/B9P 336×480；RW5 432×514 矩形；B9 192×490 胶囊；圆 466/480 | 社区 vela-doc-guide 多文件：336×336、"胶囊 390×312 = REDMI Watch 5/6"、圆 454×454 | 官方 |
| 12 | manifest 路由 | 官方：`router.pages` 对象 | SKILL.md：`"pages": [{src}]` | 官方 |
| 13 | 单位 | 官方：px/%/dp | SKILL.md："使用 rpx" | 官方（无 rpx） |
| 14 | runGC | 官方：不要频繁调用 | SKILL/vela-vs-web/AI-QUICKREF："频繁/定期调用" | 官方 |
| 15 | 页面参数 | 官方：public/protected 同名属性 | AI-QUICKREF：`this.params.xxx` | 官方 |
| 16 | launchMode | 官方：standard/singleTask | AI-QUICKREF：含 singleTop | 官方 |
| 17 | prompt | 官方：只有 showToast | AI-QUICKREF："提示对话框" | 官方 |
| 18 | 图片组件 | 官方：`<image>` | 社区多处 `<img>` | 官方 |
| 19 | 事件停止 | 官方：`evt.stop()` | vela-dev-guide：`event.$stop()` | 官方 |
| 20 | vibrator/brightness/battery/record/compass API | 官方签名（6.3） | vela-dev-guide 错误签名（6.4） | 官方 |
| 21 | file 协议 | 官方：资源路径 + internal:// | AI-QUICKREF："仅支持 internal://" | 官方 |
| 22 | for 别名 | 官方：支持 `value in list`、`(i,v) in list` | 社区 band guide：部分版本别名渲染空白，必须 $item/$idx | 采用 $item/$idx（两者兼容） |
| 23 | span 样式 | 官方：span 支持 color 等样式 | 社区：text 内带样式 span 在手环真机错乱 | 手环上避免；以真机为准 |
| 24 | 布局容器 | 官方：div/list/scroll/stack/swiper | 社区 band guide："只能使用 `<div>` 布局" | 官方（社区为简化说法） |
| 25 | toolkit 安装 | 官方：`npm create aiot` / 项目内 | 社区 README：`npm install -g aiot-toolkit` | 项目内 devDependency |
| 26 | 侧载包类型 | 官方 FAQ：小米运动健康 Debug 安装本地 rpk（未区分） | 社区：AstroBox 必须 debug 包 | 侧载用 debug；上架用 release |
| 27 | 模拟器默认镜像 | use-ide.md：推荐"正式版(4.0)" | create-emulator.md：默认 vela-miwear-watch-5.0 | 以 IDE 实际默认为准 |
| 28 | 表盘热区格式 | 社区 03：`{"action":"jump_app","target":pkg}` | 社区 06：`{"type":"hotspot",...,"action":{"type":"launch_app",...}}` | 均无官方依据 |
| 29 | AOD 刷新率 | 社区 06："1Hz" | 同句："每分钟刷新一次" | 未定，避免秒级内容 |
| 30 | 页面 protected 语义 | 官方：允许应用内部传参覆盖 | AI-QUICKREF："可被子组件读取"；public "可被子组件修改" | 官方 |
| 31 | 自定义组件 import | 官方：`<import name src></import>` + kebab-case | vela-vs-web：自闭合 `<import />` + PascalCase 标签 | 官方 |
| 32 | 路由 uri | 官方：`/pages/detail`、页面名、hap:// | vela-vs-web / SKILL：`'pages/detail/detail'` | 官方 |

## 附录 B：文档缺口

1. **无"设备 → API Level"对照表**（只能从媒体查询支持表推断）。〔01-official-quickapp-js/guide/version/index.md〕
2. `guide/multi-screens/simulator.md` 是概述页重复，**无模拟器内容**。
3. toolkit 命令名疑似笔误：`crateVelaAvd`、`deleteVelafangAvd`，文档未给正确拼写。〔01-official-quickapp-js/tools/toolkit/start.md〕
4. 官方未给出 rpk 体积上限（只有社区 50KB 经验值）、未给出内存上限数字。
5. 通用样式表未覆盖：flex-wrap、z-index、overflow、align-self、font-family、`!important` 是否支持均无说明。
6. audio、brightness、volume、zip、storage、file 等接口**无设备支持表**。
7. `system.prompt` 只有 showToast，无对话框；`input` 无文本输入类型——文本输入只能靠社区 NEORUAA 输入法组件。
8. `config.data` 只在 lifecycle 示例中出现（`this.$app.$data`），manifest config 字段表未列。
9. Promise 风格仅 fetch 有文档；其他接口是否返回 Promise 未说明。
10. 订阅回调参数名：grammar.md 用 `success`，各接口文档用 `callback`，未统一说明。
11. 动画中 `1070+` 标注（多动画）未解释其含义（疑似平台版本号）。
12. 社区 `number_choose` 等组件仅描述无源码。
13. Watch S5（蓝牙唯一支持设备）不在官方设备规格表中；REDMI Watch 6、RW4、ECG 分辨率未给出。
14. 表盘（watchface）开发无官方文档，仅社区资料。
15. `background-repeat` 文档标注"暂不支持"，又建议写 no-repeat，行为不明。

## 附录 C：工具链可用性（2026-10-21，Asia/Shanghai，box 实测）

| 项 | 结果 |
|---|---|
| `node -v` | v20.19.2（满足 create-vela-workflow 的 Node ≥16、社区推荐 v18+） |
| `npm -v` | 11.21.0 |
| `npm view aiot-toolkit version` | **2.0.5**（latest；另有 beta 2.0.6-beta.28、prender 2.1.0-prender.18 等 tag；bin：`aiot`） |
| `npm view create-aiot version` | **2.0.5**（`npm create aiot` / `npx create-aiot` 使用） |
| `npm view create-vela-workflow version` | **1.2.0** |
| `npm view velajs-mcp version` | **0.0.13** |
| `npm view conditional-compilation-webpack-plugin version` | **1.0.0** |
| 安装情况 | **未全局安装任何包**（按要求仅查询） |

文档中出现的 npm 包：aiot-toolkit、create-aiot（`npm create aiot`）、create-vela-workflow、velajs-mcp、conditional-compilation-webpack-plugin、cross-env、less / less-loader、node-sass / sass-loader、postcss-loader、precss@3.1.2、terser-webpack-plugin。〔来源: 01-official-quickapp-js/tools/toolkit/start.md；01-official-quickapp-js/tools/dev/official-site-tutorial.md；01-official-quickapp-js/guide/multi-screens/conditional-compilation.md；01-official-quickapp-js/guide/framework/style/page-style-and-layout.md；01-official-quickapp-js/guide/best-practice/start.md；04-community/xiaomi-band-dev-guide/docs/02-quickapp-development.md〕

## 附录 D：AI 开发者执行守则（浓缩）

1. 先定设备 → designWidth → 支持的接口集合（6.3 支持表）→ 再写代码。
2. 只用第 5 章组件、第 6 章接口、第 4 章样式；不在表内 = 不支持。
3. 社区文档只取经验（存盘、包体、侧载、UI 尺寸），API 写法一律回查官方。
4. 生成代码后用第 10 章坑点 + 第 12 章清单自检。
5. 不确定时：`this.$canIUse()`（3+）+ try/catch + 真机验证。
