"""Generate the delivery index and truthful acceptance record from build receipts."""
import pathlib,json,html
root=pathlib.Path(__file__).resolve().parent.parent
rows=json.loads((root/'out/size-report.json').read_text(encoding='utf8'))
baseline=json.loads((root/'out/baseline-2026-10-24/size-report.json').read_text(encoding='utf8'))
base=root/'docs/screenshots/ui-2026-10-24'
devices=['round','pro','band10','band9']
lines=['# 本轮交付与验收记录（2026-10-24）','','实现与构建已完成；完整验收尚未通过。包体预算未达标，最终原生交互、动画和性能验证阻塞。','','## 构建与包体','','四设备 × API 1 / API 2 × debug / release 共 16 包；ZIP CRC、manifest、资源完整性与 SHA-256 已校验，编译无新增告警。6,038 项自动断言通过，其中包含资源引用检查，不等同于同数量的视觉用例。','','所有 16 包均超过本轮对应配置的改前包体；8 个 release 包均超过保留的原 81KB 预算。debug 不作为 81KB release 预算的合格证据。以下单位均为字节。','','|设备|API|模式|本轮基线|当前|增加|局部动画资源|','|---|---:|---|---:|---:|---:|---:|']
for row in rows:
 lines.append(f"|{row['device']}|{row['api']}|{row['mode']}|{row['currentBaseline']:,}|{row['bytes']:,}|+{row['bytes']-row['currentBaseline']:,}|{row['animationBytes']:,}|")
lines+=['','局部动画资源列为当前源资源字节数，ZIP 压缩后的包体增量不能与该列直接相加。完整旧／新统计保存在 out/baseline-2026-10-24/size-report.json 与 out/size-report.json。','','## 资源与主机验证','','不确定圆环专用图形将旋转与弧长变化分离：round / Pro 从 143 个独立图形、83,308 字节减至 56 个、41,776 字节（减少 49.9%）；band 从 146 个、74,666 字节减至 47 个、28,855 字节（减少 61.4%）。这项局部资源目标达成，整包预算仍未达成。','','以下主机数据取自组件库拆分前的 UI 优化阶段，不作为库发布后的原生性能结论。主机 VM 三轮相同脚本中，滚动应用次数每轮 240 → 58，样式写入 697 → 199；隐藏后遗留计时器为 0。事件回调 p95 下降，但延后执行的 apply p95 没有稳定下降：改前 0.206–0.376ms，当前 0.334–1.163ms。不能只用事件回调耗时宣称原生性能目标达成。原始记录：[拆分前主机测量记录](releases/0.1.0/host-js-before-library.json)。','','## 原生验证阻塞','','隔离 pre4 模拟器可启动 API 1 界面，但基线和新包均会因振动接口触发 libuv async.c:212 断言重启。诊断时使用仅关闭振动的测量副本；正式安装包保留原功能。随后出现图形文件 ENOENT 和 adb 批量传输 EOF，无法保证最终安装目录完整。因此中间截图与基线录屏仅作为故障诊断，不作为最终版本视觉或性能验收证据。','','API 2 watch5 镜像存在文件系统挂载错误，未形成可靠运行环境。Pro、band9 仅完成构建、状态检查与设计预览。没有四设备最终原生实拍，也没有可信的三轮 release A/B 性能结论。30fps、超过 100ms 的停顿减少 50%、原生 JS p95 降低 30% 均标记为阻塞；物理返回键的模拟器映射尚未验证。','','## 兼容与设计差异','','- API 1：形变采用端点降级，对勾淡入；官方弧形加载使用固定活动弧段与透明度反馈，不能连续复现 API 2 路径变化。','- API 2：局部帧与原生播放器补足图形变化；交互形变保留当前状态与速度，其设备播放表现仍待可用镜像确认。','- 无滑块图标的开关、CompactButton 额外形变、播放／暂停过渡、局部确定弧形及 band Slider 排布均为项目适配变体。','- Arc TimeText 当前按 OFL Noto Sans SC 实际字体度量生成字形（发布前替换原 SDK 字形），运行设备必须使用相同资源；与 Android 原字体仍存在字形差异。','- 原生进度替代方案尚未通过 ≤1 物理像素及性能不回退的联合验证，正式实现保留局部 PNG。','','## 交付入口','','- 安装包在本地 `out/velam3demo-1.2.0-all-devices.zip`（不随 Git 提交）；[SHA-256](releases/0.1.0/SHA256SUMS.txt) · [包验证记录](releases/0.1.0/artifact-validation.json)','- [四设备九页总览](screenshots/ui-2026-10-24/comparison/all-devices-nine-pages.png) · [预览索引](screenshots/ui-2026-10-24/index.html)','- [组件与动画实现说明](UI-REWORK-2026-10-24.md) · [截图与动效证据说明](screenshots/ui-2026-10-24/README.md)','','改前源码、16 包、统计及基线截图保存在 out/baseline-2026-10-24/；原有交接文件与记录保留。']
(root/'docs/UI-ACCEPTANCE-2026-10-24.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
readme='''# 四设备设计预览与验证证据

本目录 previews/ 均由生成后的 UX、样式和页面逻辑在 Chrome 中渲染，不是 Vela 模拟器实拍。包含九页首屏、滚动分段、Stepper、分页、Slider、进度、按压及开关状态。截图不能证明原生帧率或运行兼容性。

- [浏览全部预览](index.html)
- [四设备九页总览](comparison/all-devices-nine-pages.png)
- comparison/：每设备的动画局部关键帧、Confirmation 分阶段关键帧和四组合 × 四状态 Switch 矩阵。
- design-motion/：round 与 band10 的局部资源动效示意。以 30fps 导出，属于图形采样演示，不代表设备帧率，也不是完整交互录屏。
- diagnostics/：原生环境诊断中间截图。部分存在旧页面、资源读取失败或未确认最终安装版本，不可作为最终验收截图。

最终原生录屏及三轮性能 A/B 因模拟器振动驱动、资源读取与 API 2 镜像挂载问题阻塞；Pro、band9 仅有设计预览。[完整验收与包体报告](../../UI-ACCEPTANCE-2026-10-24.md)。
'''
(base/'README.md').write_text(readme,encoding='utf8')
native=base/'native'
if native.exists():
 diagnostics=base/'diagnostics';diagnostics.mkdir(exist_ok=True)
 for path in native.iterdir():
  if path.is_file(): path.replace(diagnostics/path.name)
 if not any(native.iterdir()): native.rmdir()
body=['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>Wear M3 设计预览</title><style>body{background:#161318;color:#eee;font:16px sans-serif;margin:24px}a{color:#d6bcff}section{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0 0 28px}img{max-height:400px;max-width:100%;background:#000}figcaption{max-width:240px;overflow-wrap:anywhere}video{width:460px;max-width:100%}</style><h1>Wear M3 设计预览</h1><p>Chrome 设计预览与局部资源采样，非模拟器实拍。原生性能与 API 2 验收阻塞；包体预算未达标。</p><p><a href="../../UI-ACCEPTANCE-2026-10-24.md">完整验收报告</a></p>']
for device in devices:
 body.append('<h2>'+device+'</h2><section>')
 for path in sorted((base/'previews').glob(device+'_*.png')):
  src=path.relative_to(base).as_posix();body.append(f'<figure><a href="{src}"><img loading="lazy" src="{src}"></a><figcaption>{html.escape(path.stem)}</figcaption></figure>')
 body.append('</section>')
 for path in sorted((base/'comparison').glob(device+'-*.png')):
  src=path.relative_to(base).as_posix();body.append(f'<p><a href="{src}">{html.escape(path.stem)}</a></p>')
 if device in ['round','band10']:body.append(f'<p>局部资源示意，非模拟器录屏</p><video controls preload="metadata" src="design-motion/{device}-asset-motion.mp4"></video>')
body.append('</html>');(base/'index.html').write_text('\n'.join(body),encoding='utf8')
record={'buildConfigurations':len(rows),'assertions':6038,'newCompilerWarnings':sum(len(x['warnings']) for x in rows),'currentPackageBudgetPassed':sum(x['currentBudgetPassed'] for x in rows),'nativePerformance':'blocked','nativeApi2':'blocked','visualEvidence':'Chrome design preview, not native acceptance'}
(root/'out/acceptance-report.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
report=root/'docs/UI-REWORK-2026-10-24.md'
text=report.read_text(encoding='utf8').replace('6,022','6,038')
if '最终原生验证还出现资源读取' not in text:
 text=text.replace('## 交付入口','最终原生验证还出现资源读取 ENOENT 与 adb 传输 EOF，不能保证安装完整，故中间原生图片仅保留在 diagnostics/，最终三轮 A/B 性能验证标记为阻塞。API 1 官方弧形加载采用固定活动弧段与透明度反馈；完整差异和未达标项见[最终验收记录](UI-ACCEPTANCE-2026-10-24.md)。\n\n## 交付入口')
report.write_text(text,encoding='utf8')
print('Acceptance report and preview index generated')
