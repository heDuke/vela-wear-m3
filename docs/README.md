> 当前公开仓库入口：[发布记录](OPEN-SOURCE-RELEASE.md)、[授权分区](../LICENSE.md)、[组件库文档](../packages/vela-wear-m3/README.md)。以下交接记录保留历史状态。

# docs/ 索引

| 文件 | 内容 |
|---|---|
| `HANDOFF.md` | 当前状态（完成 / 未完成 / 未测）+ 组件库路线图、里程碑 |
| `VELA_DEV_SPEC.md` | Vela JS 快应用开发规范（从官方文档蒸馏，带出处；**官方原文优先**：https://github.com/hefeishui0829/xiaomi-vela-docs ） |
| `wear-m3-vela-mapping.md` | Wear M3 令牌采集、Vela 可行性映射、多屏策略；§8.3 = v3 精确令牌与无法消除的差异 |
| `design/v3/v3_compare_m3_reference_vs_round@2x.png` | androidx golden / 官方图 vs v3 设计（圆屏）对比 |
| `design/v3/v3_overview_all_screens_all_devices@2x.png` | v3 设计：全部屏幕 × 全部设备总览 |
| `design/v3/ref/` | androidx 截图测试 golden（`*_emulator.png`）、`SOURCES.md`（来源与许可）、`golden_names.txt` |
| `ref/androidx-m3-src/*.kt` | androidx Wear Compose Material3 源码 / tokens 快照（Apache-2.0），令牌真值 |
| `screenshots/` | 当前 demo 在 vela-watch-5.0 模拟器里的实拍截图（回归基线） |

说明：SPEC / mapping 文中 `/workspace/xiaomi-vela-docs/...` 指上游 docs 仓库；`/workspace/vela-notes/preview/...` 指原 box 上的预览管线（只带了必要的图，见 `design/` 与 `tools/v3/`）。
