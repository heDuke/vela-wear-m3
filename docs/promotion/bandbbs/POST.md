# 【开源组件库 / 测试招募】vela-wear-m3：把 Wear Material 3 Expressive 带到 Vela

最近在做一个面向小米 Vela JS 快应用的组件库：**vela-wear-m3**。希望让手表、手环上的按钮、卡片、开关和反馈动效更接近 Wear Material 3 Expressive，也让其他开发者能把这些组件用进自己的应用。

![四种屏幕布局的 Chrome 设计预览，非设备实拍](cover-light.png)

这次公开的是独立组件库，以及使用它的九页 Demo。组件库采用 GPL-3.0-or-later；Demo 使用非商业许可，两者的使用范围不同。

## 有哪些内容

按钮、CompactButton、IconButton、卡片、Switch、Checkbox、Radio、InlineSlider、Stepper、LevelIndicator、分页、Arc TimeText、ScrollIndicator，以及圆环／分段／弧形／线性进度、对话框和成功确认反馈。

![按钮与开关设计预览](components-controls.png)

提供 round、Pro、band10、band9 四种布局配置。圆屏使用弧形和贴边排布；手环采用单列布局、居中返回和分行数值控件。除了静态样式，也补了按压形变、图标状态切换等效果；官方参考、可选样式和项目适配会分别说明。

![Stepper、分页、时间与进度设计预览](components-display.png)

![圆屏局部资源动效，非设备录屏](round-motion.gif)

## 开发者怎么用

库已从 Gallery 中独立出来，在构建时生成 UX／JavaScript 和所需图片。可以从库内 GPL 最小示例起步，不需要复制非商业 Demo 页面。预发布附独立 tarball、接入教程和 API 文档，尚未发布 npm registry。

- [项目与源码](https://github.com/heDuke/vela-wear-m3)
- [下载预发布](https://github.com/heDuke/vela-wear-m3/releases/tag/v0.1.0)
- [从空目录开始接入](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/GETTING-STARTED.md)
- [API 文档](https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/API.md)

## 这次发布的状态

这是实验性版本，主要用于交流和招募测试。四种布局已做生成与构建检查，但原生性能、API 2 动画与真机兼容性尚未完成验收，完整 Demo 包体仍超预算。上面的图片与动图是设计预览／局部资源演示，不是设备实拍。

下载包区分 API 1 基础动画、API 2 增强动画，以及 debug／release；实际安装取决于固件和安装工具，release 构建不等于稳定版。

组件库允许遵守 GPL 的免费或收费商用，闭源授权可另行协商；Demo 仅限许可允许的非商业用途。原创部分 © 2026 heDuke，第三方声明随源码保留。本项目不隶属 Google 或小米。

欢迎大家体验、交流设计，或者把使用中遇到的问题告诉我。按你习惯的方式说就好。
