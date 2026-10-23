// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Exact Wear Compose Material3 tokens (androidx-main, read 2026-10-22). See wear-m3-vela-mapping.md §8.3.
// ColorTokens.kt + PaletteTokens.kt (default dark ColorScheme)
const C={
 background:'#000000', onBackground:'#FFFFFF',
 primary:'#E9DDFF', primaryDim:'#D0BCFF', primaryContainer:'#4D3D76', onPrimary:'#210F48', onPrimaryContainer:'#F6EDFF',
 secondary:'#DEE0FF', secondaryDim:'#BAC3FF', secondaryContainer:'#3A4376', onSecondary:'#0C1649', onSecondaryContainer:'#F0EFFF',
 tertiary:'#FFDCC2', tertiaryDim:'#FFB77A', tertiaryContainer:'#6C3A03', onTertiary:'#2E1500', onTertiaryContainer:'#FFEEE2',
 surfaceContainerLow:'#272430', surfaceContainer:'#332E3C', surfaceContainerHigh:'#494453',
 onSurface:'#F6EDFF', onSurfaceVariant:'#CAC4D0', outline:'#948F9A', outlineVariant:'#615D67',
 error:'#F2B8B5', errorDim:'#EC928E', errorContainer:'#8C1D18', onError:'#410E0B',
 // onBackground.setLuminance(80/20): TimeText + ScrollIndicator (TimeText.kt, ScrollIndicator.kt); matches golden #C6C6C7 / #2F3131
 timeText:'#C6C6C6', scrollThumb:'#C6C6C6', scrollTrack:'#303030'
};
// TypeScaleTokens.kt: [size sp, lineHeight sp, weight, tracking sp]. Vela: weight <550 -> normal, >=550 -> bold; no tracking.
const T={
 displaySmall:[24,26,550,0.2], titleLarge:[18,20,500,0.2], titleMedium:[16,18,550,0.4], titleSmall:[14,16,550,0.4],
 labelLarge:[20,22,500,0.4], labelMedium:[15,18,500,0.4], labelSmall:[13,16,500,0.4],
 bodyLarge:[16,18,450,0.4], bodyMedium:[14,16,450,0.4], bodySmall:[12,14,500,0.4], bodyExtraSmall:[10,12,500,0.2],
 arcLarge:[18,22,599,0.4], arcMedium:[15,18,599,0.6], arcSmall:[14,16,560,0.6]
};
module.exports={C,T};
