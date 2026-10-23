# tools/v3 —— 从 v3 预览管线搬来的 PNG（供 tools/assets.js 复用）

`tools/assets.js` 会把这里的 `assets/<设备>/*.png` 原样拷进 `assets/<设备>/`（EdgeButton 轮廓、弯曲 TimeText 背景、
弯曲"已保存"、对勾/关闭/删除图标、圆屏 ScrollIndicator 轨道）。这些图由 v3 预览管线按 androidx 源码几何绘制
（原始位置：box 上 `/workspace/vela-notes/preview/v3/`，未随包提供）。

可选：放 `fonts/GoogleSansFlex.ttf`（OFL，https://github.com/google/fonts/tree/main/ofl/googlesansflex），
仅用于绘制应用图标 logo.png 里的 "M3" 字样；没有则回退 sans-serif。

运行 `node tools/assets.js` 需要：`npm i --no-save playwright-core` + 本机 Chrome/Chromium（`CHROME_PATH=/path/to/chrome`），
之后 `python3 tools/quant.py`（Pillow）量化为 PNG8。注意 assets.js 会**删除并重建** `assets/<设备>/`。
