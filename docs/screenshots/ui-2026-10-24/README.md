# 四设备设计预览与验证证据

本目录 previews/ 均由生成后的 UX、样式和页面逻辑在 Chrome 中渲染，不是 Vela 模拟器实拍。包含九页首屏、滚动分段、Stepper、分页、Slider、进度、按压及开关状态。截图不能证明原生帧率或运行兼容性。

- [浏览全部预览](index.html)
- [四设备九页总览](comparison/all-devices-nine-pages.png)
- comparison/：每设备的动画局部关键帧、Confirmation 分阶段关键帧和两种官方组合（无／有行首图标）× 四状态 Switch 矩阵。
- design-motion/：round 与 band10 的局部资源动效示意。以 30fps 导出，属于图形采样演示，不代表设备帧率，也不是完整交互录屏。
- diagnostics/：原生环境诊断中间截图。部分存在旧页面、资源读取失败或未确认最终安装版本，不可作为最终验收截图。

最终原生录屏及三轮性能 A/B 因模拟器振动驱动、资源读取与 API 2 镜像挂载问题阻塞；Pro、band9 仅有设计预览。[完整验收与包体报告](../../UI-ACCEPTANCE-2026-10-24.md)。
