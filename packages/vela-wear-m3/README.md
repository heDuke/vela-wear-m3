# vela-wear-m3

**面向小米 Vela 的 Wear Material 3 Expressive 组件库。**

在构建时展开组件模板、样式、状态逻辑与所需资源，输出普通 UX／JavaScript，不创建额外的自定义组件 ViewModel。适合希望在 Vela JS 快应用中使用 Wear M3 风格，并愿意按当前模板契约组合页面的开发者。

[快速上手](docs/GETTING-STARTED.md) · [API 参考](docs/API.md) · [全部组件与用例](docs/COMPONENTS.md) · [项目展示与下载](https://github.com/heDuke/vela-wear-m3)

## 提供什么

- 20 个注册模板：按钮、卡片、选择控件、数值与分页指示器、时间、列表变换、进度及覆盖层。
- `round`、`pro`、`band10`、`band9` 四种布局配置，`basic`／`enhanced` 分别要求最低 API 1／API 2。
- 随包图片和 GPL 最小示例；日常生成不依赖 Python、Chrome、字体下载或父仓库 Demo。
- CLI 与 CommonJS 接口，分别用于项目构建脚本和工具集成。

```js
const { generate } = require('vela-wear-m3')

const result = generate({
  input: 'template',
  output: 'src',
  device: 'round',
  animation: 'basic'
})
console.log(result.device, result.images)
```

首次接入请按[完整教程](docs/GETTING-STARTED.md)准备模板与工具链，再执行生成和构建。当前通过 GitHub 预发布 tarball 安装，**尚未发布 npm registry**。

## 使用前了解

组件是**编译期模板**，不是可直接 `<import>` 的自定义组件。绑定字符串是表达式；消费页面负责业务状态、回调及生命周期组合。部分 0.1 控制器保留固定字段和范围，未提供通用 props 或自动 mixin 合并。

只编译可信模板：模板表达式会在构建机器上执行。输出目录默认必须为空或带有生成器标记；后续生成会替换它，不要在里面存放手写文件。详见 [generate() 的覆盖行为](docs/API.md#generateoptions)。

AndroidX 参考固定在提交 `2f557dc1f1ec71edae73e2c16b0e446523c644b7`。官方参考样式、可选变体和项目适配变体见组件指南。本库不代表 Google 或小米官方实现，也不承诺完整复现所有 Wear OS 能力。

API 1 存在形变、对勾和弧段动画降级；API 2 使用 `image-animator`。四布局生成与构建已检查，最终原生性能与 API 2 动画验收仍未完成；完整 Gallery 包体仍超预算。文档展示不作为设备性能证明。

## 资源与许可

重新生成资源时才需要 Pillow、Chrome 等开发工具。Arc 字形使用 Noto Sans SC；输入来源及校验值见 `tools/font-source.json`，字体二进制不随包分发。普通运行时文字使用设备系统字体。

原创部分 © 2026 heDuke，采用 **GPL-3.0-or-later**，包括库内最小示例。生成代码包含库实现，分发时仍须履行适用许可义务。遵守 GPL 可免费或收费商用；闭源商业授权需另行协商。

九页 Gallery 采用单独的非商业许可，不属于这个独立包。指定组合的额外权限见[本项目 Demo 集成许可](DEMO-EXCEPTION.md)；第三方权利和许可不变，详见 [LICENSE](LICENSE) 与[第三方声明](THIRD_PARTY_NOTICES.md)。
