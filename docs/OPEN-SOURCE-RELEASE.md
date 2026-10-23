# 组件库拆分与 GitHub 发布记录

发布目标：https://github.com/heDuke/vela-wear-m3 。本轮组件库版本 `0.1.0`，Demo 版本 `1.2.0`（versionCode 3）。未向 npm registry 发布，也未自动授予闭源商业许可。

## 结构与兼容

- `packages/vela-wear-m3` 可单独 npm pack；自带组件、运行片段、生成器、四设备资产和 GPL 最小示例，不读取父仓库的 Demo 文件。
- Demo 通过 package.json 的本地依赖消费库；共享模板、样式、几何、状态控制器与资产有一份真值。原 tools/gen.js 与常用构建入口保留为适配器。
- 保留包名、九页路由、basic / enhanced 和现有界面方向，包括圆屏无返回按钮、band 返回按钮居中。
- 抽离初次对照 72 个设备/API/页面组合，除空白外与改前输出一致。随后因授权分发需要，将独立 Arc 字形和度量换成 OFL Noto Sans SC；设备运行时普通文字仍使用系统字体。
- 生成代码附带库的 GPL、第三方声明与指定 Demo 集成许可；Demo 构建另附非商业许可。资源生成所需字体二进制仅下载缓存，未打包或提交。

## 授权边界

组件库 GPL-3.0-or-later；Demo PolyForm Noncommercial 1.0.0；指定 Demo 获得额外集成许可。GPL 下允许免费或收费商用。额外闭源授权需要另行达成协议且限于维护者有权授权的部分。上游 Apache-2.0、OFL、CC-BY 等声明分别保留。

Demo 是源码可见、限制商业用途的软件，不能将本仓库整体宣传为完全开源。Google 的设计风格、商标或 AndroidX 代码并不变成维护者的独占资产。贡献者不会因提交 PR 自动转让版权或授予额外商业权利。

## 发布验证

- `npm run test:library`：实际打包并解压 tarball，在独立目录执行四设备 × 两种 API 的生成，检查最小例子、许可、资源和目录保护。
- 新目录使用实际 tarball 构建 band9 API 1 debug / release 成功，不依赖旧 out 基线或原签名私钥。
- `npm run verify`：沿用 6,038 项断言，覆盖资源、状态转换和计时器生命周期。
- 四设备 × API 1 / API 2 × debug / release 共 16 包，验证 CRC、manifest、资源、许可文件与 SHA-256。
- 当前设计预览在 docs/screenshots/ui-2026-10-24，明确标为 Chrome 设计预览，不用它证明 Vela 性能。
- 发布前检查待提交文件与现有历史的敏感路径；缓存、依赖、SDK、私钥、字体本体与构建产物排除在 Git 之外。

发布验证与包体记录已保存到 [releases/0.1.0](releases/0.1.0)，包括库包完整性、16 包校验、包体及改前基线数据。忽略的本地产物不视为 GitHub 仓库附件；从源码可重建，安装包与库 tarball在本地交付。

原生性能验收、API 2 镜像运行和包体预算仍存在未达标项，详见 [UI 验收记录](UI-ACCEPTANCE-2026-10-24.md)。不将拆分或开源发布解释为这些目标已达成。
