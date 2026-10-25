# 米坛社区发布素材

- `POST.md`：完整 Markdown 正文；图片使用本目录相对链接。
- `POST.bbcode.txt`：论坛 BBCode 正文，图片指向预发布标签下的公开原图。
- `BRIEF.md`：简短介绍与入口。
- `cover-light.png` / `cover-dark.png`：1280×960，GitHub 深浅主题封面；社区默认使用浅色版。
- `layouts-stepper.png` / `layouts-stepper-dark.png`：2560 宽（1280 CSS px @2x），四种布局的 Stepper 等比例对比图，用于主 README「屏幕与 API 配置」。
- `components-controls.png` / `components-display.png`：1280×760，精选组件图。
- `round-motion.gif` / `band10-motion.gif`：从既有局部资源演示 MP4 以 8fps 采样；各 5 秒、小于 3MB，不代表设备性能。
- `motion-source.json`：动图来源、时长、采样与大小。
- [项目小帆船图标](../../design/brand/README.md)：SVG、PNG、圆形头像与裁切预览；封面已使用确认的柔和紫色版本。

图来自已保存的实际 Chrome 设计预览，动图来自 `docs/screenshots/ui-2026-10-24/design-motion/`；都不是原生设备录屏。不要将诊断目录中的中间截图作为本次验收证据。

素材由 `node tools/promotion.js` 与 `python tools/promotion-motion.py` 生成。需要 Playwright、Chrome、Pillow 和可用的中文字体；可设置 CHROME_PATH / VELA_PROMOTION_FONT（布局对比图另可设 VELA_PROMOTION_FONT_BOLD）；`--only=layouts-stepper,layouts-stepper-dark` 只重绘指定图片。渲染脚本不会生成或修改应用页面。

原始动效 MP4：[round](../../screenshots/ui-2026-10-24/design-motion/round-asset-motion.mp4)、[band10](../../screenshots/ui-2026-10-24/design-motion/band10-asset-motion.mp4)。完整画廊见[截图索引](../../screenshots/ui-2026-10-24/README.md)。

本目录原创介绍文字为 GPL 技术文档；Demo 截图、视频与衍生配图遵循仓库的 PolyForm Noncommercial 1.0.0 分区，第三方权利不变。版权与详细范围见[授权文件](../../../LICENSE.md)。帖子由维护者手动发布，不附反馈模板。
