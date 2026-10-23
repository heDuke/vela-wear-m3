// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
const PROGRESS=$[progressAssets()]
const KINDS=['ring','ringThin','ringLarge','indeterminate','seg','segBinary','arcLoading','linear','linearThick','overflow','arc']
const LABELS=['确定圆环','小尺寸圆环','大圆环','不确定圆环','连续分段','独立分段','弧形加载','线性 · 8dp','线性 · 12dp','溢出圆环','局部确定弧形 · 适配']
let progressTimer=null,autoTimer=null,loadingEpoch=0,pendingProgress=null,autoPending=false
