# 第三方声明

本项目原创部分 Copyright © 2026 heDuke。以下原作者与原许可继续有效，不因本项目 GPL、Demo 非商业限制或商业授权而改署、撤销或变成独占权。

| 来源 | 使用位置与用途 | 许可与声明 |
|---|---|---|
| AndroidX / The Android Open Source Project | `docs/ref/androidx-m3-src/` 快照、组件几何、令牌、分页与动画算法移植 | Apache-2.0；保留各源文件原年份与版权。固定参考提交 `2f557dc1f1ec71edae73e2c16b0e446523c644b7` |
| Google Material Symbols / Material Design Icons | 库的 `tools/icons/` SVG 和对应栅格图标 | Apache-2.0，https://github.com/google/material-design-icons |
| Google Fonts / Google Sans Flex Authors | 历史 logo 与部分参考预览的排版生成输入 | OFL-1.1；不打包 Google 字体二进制，保留 OFL 文本 |
| Adobe / Noto Sans SC | 当前独立 Arc 字形 PNG 与实际字体度量的生成输入 | OFL-1.1；字体本体保持 OFL，不改为 GPL。字体下载地址、权重和 SHA-256 见库的 `tools/font-source.json` |
| 小米 MiSans / Vela 系统字体 | 设备实时文字、历史预览与模拟器截图的字体 | 小米字体使用条款；不把 SDK 或系统字体二进制纳入仓库/组件包，不将它们声明为 GPL |
| Android developer documentation | `docs/design/v3/ref/` 中注明来源的 devsite 图片及截帧 | 依来源标记 CC-BY-4.0，保留原图与来源；本项目制作的裁剪、排版和对比不改写上游权利 |
| AndroidX screenshot goldens | `docs/design/v3/ref/` 中列出的 golden 图片 | Apache-2.0；具体来源见该目录 `SOURCES.md` |

Apache 与字体许可副本在 `packages/vela-wear-m3/licenses/`，CC-BY-4.0 副本在 `licenses/`。逐项来源见 [参考图来源](docs/design/v3/ref/SOURCES.md)。库包有独立声明，不依赖 Demo 文档才能履行归属义务。

开发依赖由 npm 安装，其许可证依各自包声明；`node_modules/`、模拟器、SDK、下载字体缓存与 ffmpeg 二进制不在本仓库发行范围。它们不作为组件库运行时依赖捆绑。

Material、Material 3、Wear OS、Android 与 Google 是 Google LLC 的商标，小米与 Vela 为其权利人的商标；MiSans 等其他名称归各自权利人所有。这些名称仅用于说明兼容性和参考来源，本项目与 Google、小米无隶属、赞助或认证关系；未授予商标权。
