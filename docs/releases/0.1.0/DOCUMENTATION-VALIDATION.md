# 文档与社区发布验收 · 2026-10-24

## 文档

根 README 改为项目展示入口，组件库 README 改为开发入口；新增 GETTING-STARTED 与 API 参考，组件指南覆盖全部 20 个注册模板。接口描述对照当前导出、CLI、注册表和实际模板，不增加通用 props、运行时组件或自动生命周期合并的承诺。

`node tools/verify-docs.js` 检查组件示例绑定与新入口的本地链接。`npm run test:library` 检查真实 tarball 独立生成；`npm run verify` 通过 6,038 项断言，断言数量不是视觉用例数。

## 阅读与配图

README 使用 GitHub GFM API 渲染结果，在本地近似 GitHub CSS 的页面中检查 1280 / 390 像素 × 深浅主题。四种情况均无缺失图片或整页横向溢出，主题封面选择正确。该检查不等于直接操控 GitHub 网站主题设置；输出位于忽略目录 out/readme-qa。

封面与组件图来自已保存的实际 Chrome 预览。两段 GIF 来源为既有 30fps 局部资源演示 MP4，以 8fps 采样，时长均为 5 秒，分别约 0.85MB / 0.82MB；不是设备录屏或帧率证据。

## 从零构建

独立目录 out/readme-consumer 实际执行 npm init、GPL 示例许可标记、安装 tarball 与 aiot-toolkit 2.0.5 / @aiot-toolkit/jsc 1.0.10、复制最小 template、CLI 生成、aiot build。环境为 Windows x64 / Node.js 24.21.0 / npm 11.19.0。

- round / basic / minAPILevel 1：debug 构建成功。
- band10 / enhanced / minAPILevel 2：debug 构建成功。
- 结果是 com.example.wearm3.debug.0.1.0.rpk，不是 Gallery 包；不代表设备安装和运行通过。

首次离线安装因缓存不完整未能完成，改为联网安装后成功。安装工具报告工具链依赖存在 16 项已知漏洞（3 low、11 high、2 critical）；本轮未更新上游工具链或执行破坏性自动修复。组件库没有增加第三方运行时依赖；此记录是安装时的工具输出，不是运行时安全结论。

## 分发与 Git

16 个原 RPK 的 SHA-256 保持不变；重新生成八种配置并与 sourceDigest 逐项核对，确认可复用安装包。只更新 ZIP 中的安装说明、独立库文档与发布元数据，未修改签名私钥。

当前 Git 与可达历史审计没有发现排除材料或所检查的凭据格式。既有截图、参考图、两段原始 MP4 和锁文件有明确用途，保留；缓存、SDK、字体二进制、私钥和安装包仍被忽略。release-audit.json 是发布前工作树及已有历史的快照；最终提交后的审计随 Release 附件交付。审计仅覆盖本地可达引用与列出的检查范围。

公开下载附件在发布后重新下载并核对 SHA-256，结果保存在 out/public-download-validation.json；该记录以实际运行成功为准，不提前计入源码检查通过项。
