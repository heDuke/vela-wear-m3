# 从空目录到第一个 Vela 包

本教程使用组件库内的 **GPL 最小示例**，不复制非商业 Gallery。Node.js 最低 18，推荐 20；以下命令在 PowerShell、bash 中均可逐行执行。

## 1. 创建消费项目

在你希望放置新项目的目录执行：

```sh
mkdir my-vela-app
cd my-vela-app
npm init -y
npm pkg set license=GPL-3.0-or-later
npm install --save-dev https://github.com/heDuke/vela-wear-m3/releases/download/v0.1.0/vela-wear-m3-0.1.0.tgz aiot-toolkit@2.0.5 @aiot-toolkit/jsc@1.0.10
```

如果已经下载 tarball，可把上面的 URL 替换为它的本地绝对路径。Windows 路径带空格时加引号。库未发布 npm registry，不要直接运行 `npm install vela-wear-m3`。

## 2. 复制并生成最小示例

继续在 `my-vela-app` 执行：

```sh
node -e "require('fs').cpSync('node_modules/vela-wear-m3/examples/minimal/template','template',{recursive:true,errorOnExist:true,force:false})"
npx vela-wear-m3 gen --input template --out src --device round --animation basic
```

`template/` 是你维护的源目录；`src/` 是生成目录。示例已包含 app、manifest、公共 runtime 引用和按钮页面，生成器会复制所需图标、logo 与许可文本。

命令中的 `round` 可替换为 `pro`、`band10`、`band9`。`basic` 要求最低 API 1；`enhanced` 要求最低 API 2，不代表已通过所有对应设备验证。

## 3. 构建 debug 包

继续在同一目录执行：

```sh
npx aiot build
```

成功后得到 `dist/com.example.wearm3.debug.0.1.0.rpk`。这是最小示例包，不是九页 Demo 的 `com.velam3.demo`。

修改模板后先重新执行生成命令，再构建。验证增强配置时：

```sh
npx vela-wear-m3 gen --input template --out src --device band10 --animation enhanced
npx aiot build
```

实际安装取决于设备固件、API 等级与安装工具。debug／release 是构建模式；API 1／API 2 是能力配置，二者分别选择。本教程的 debug 构建仅用于验证接入流程，不是通用侧载推荐。

## 4. 开始编写页面

修改 `template/pages/index/index.ux.tpl` 中的 `label` 和 `toggle()`，即可观察业务状态如何连接组件。新增组件时同时引入其样式、状态和控制器，详见[组件指南](COMPONENTS.md)。生成器及模板语法见 [API 参考](API.md)。

注意：

- 不在 `src/` 中保存手写内容；生成器会整体替换已标记的输出目录。
- 只处理可信模板，表达式在构建机器上执行。
- 不同页面各有一份基础状态；同一页面多个控制器须显式合并同名钩子。
- 生成文件包含库代码，分发时保留适用的 GPL、版权及第三方材料。

## 离线准备

已下载的 tarball 和 npm 缓存可用于离线安装；完整首次安装仍需要工具链依赖。库的日常生成本身不需要联网、下载字体或安装模拟器。需要从源码打包时，在仓库根目录执行 `npm pack ./packages/vela-wear-m3`，将所得 `.tgz` 安装到独立消费项目即可。
