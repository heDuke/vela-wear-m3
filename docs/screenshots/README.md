# 模拟器截图基线

> 这组截图反映 **2026-10-23 的 Demo（2026-10-24 UI 重做之前）**，不代表当前界面。当前界面见 [ui-2026-10-24 设计预览](ui-2026-10-24/README.md)（Chrome 渲染，非模拟器）；Stepper 重做后的 `vela-watch-5.0` 模拟器实测（round／band10）记录在 [Wear M3 → Vela 映射](../wear-m3-vela-mapping.md) 的 Stepper 行。

- `emulator/round_*.png`（466×466）、`emulator/band10_*.png`（212×520）：2026-10-23 的 demo 在 Vela 官方模拟器（`vela-watch-5.0` 镜像，AVD `Vela_Round_466` / `Vela_Band10_212x520`）里由 `tools/tour.js` + `tools/emu-drive.js --settle` 自动截取（2026-10-23，UTC+8）。时间显示为截图时刻。
- `screens_overview.png`：`tools/overview.py` 拼的总览。
- 重新截取：`node tools/gen.js <dev> && node tools/tour.js <dev> docs/screenshots/emulator > /tmp/tour.json`，安装并启动 debug rpk 后等约 15 s（debug 包先等调试器），再 `node tools/emu-drive.js <grpcPort> /tmp/tour.json --settle`。
- pro（336×480）与 band9（192×490）暂无截图（没有对应 AVD）。
