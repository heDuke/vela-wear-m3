# vela-wear-m3 0.1.0 / Demo 1.2.0 · 社区测试预发布

面向小米 Vela 的 Wear Material 3 Expressive 组件库，附四种布局配置和九页非商业 Demo。本次补齐项目展示、完整 API 文档与独立接入教程，适合开发者交流和实验性测试。

## 开始使用

- [项目介绍](https://github.com/heDuke/vela-wear-m3)
- [从空目录构建最小示例](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/GETTING-STARTED.md)
- [JavaScript / CLI / 模板 API](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/API.md)
- [全部 20 个模板及控制器用例](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/COMPONENTS.md)

安装 `vela-wear-m3-0.1.0.tgz` 开发自己的应用；体验 Gallery 可选择 round、pro、band10、band9 ZIP，完整 ZIP 含全部 16 个 RPK。尚未发布 npm registry。

API 1 basic 与 API 2 enhanced 是动画能力配置；debug 与 release 是构建模式，分别选择。实际安装取决于固件、API 与安装工具，不作通用侧载模式推荐。release 构建不代表稳定性认证，API 2 保留实验性标记。

## 本次交付与验证

- 深浅主题 README 封面、组件细节图、两段 5 秒 GIF，以及米坛 Markdown / BBCode 文案。
- 生成器、CLI、绑定语法、组件状态、生命周期与组合限制文档，随独立库分发。
- 在新目录实际安装依赖、复制 GPL 最小示例，并完成 round API 1 与 band10 API 2 debug 构建。
- 独立 tarball 验证四布局 × 两种 API 的生成；现有检查通过 6,038 项断言，文档覆盖全部注册模板。
- 16 个 RPK 的 CRC、manifest、资源、许可和 SHA-256 复核通过；8 个生成源码摘要与原构建记录一致。

RPK 复用提交 `a8c3af9f52e5f405af7ca5877aa6c5d767c45b2f` 的已验证构建字节，本轮未修改组件实现或界面行为。库包包含本次更新的文档。源码对应关系见附件 `RELEASE-PROVENANCE.json`；附件完整性见 `SHA256SUMS.txt`，ZIP 内另有各 RPK 的校验清单。

## 仍待验证

原生性能、API 2 动画和真机兼容性尚未完成最终验收，完整 Demo 包体仍超预算。四种布局配置不等于四类设备都已实测。图片为 Chrome 设计预览，动图来自局部资源演示；不能证明设备帧率。环境阻塞及详细差异见 [UI 验收记录](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/docs/UI-ACCEPTANCE-2026-10-24.md)。

Git 审计覆盖待发布文件、本地可达历史、常见凭据格式、忽略规则与 tarball 内容；附件含审计结果。此检查不等于所有可能的秘密或依赖风险均已排除。

## 许可

组件库及库内最小示例采用 GPL-3.0-or-later，允许遵守 GPL 的免费或收费商用。九页 Demo 和原创展示素材采用 PolyForm Noncommercial 1.0.0；不要将整仓库统称为完全开源。闭源商业授权需另行协商，第三方许可不变。详见[授权范围](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/LICENSE.md)。

原创部分 © 2026 heDuke。本项目不隶属 Google 或小米。欢迎自由交流与反馈。
