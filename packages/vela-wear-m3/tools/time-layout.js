// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
module.exports=(c,font)=>{
 // Demo Arc rows: short in-flow height (glyph line + edge pad), not W/2.
 // Glyphs are absolute at top; transformOrigin Y stays W/2 - edgePadding(2dp)
 // (imaginary watch centre) — same math as page-top TimeText overlay. Page-top
 // TimeText is unchanged (absolute on .page). Pro/rect page-top stays linear.
 const line=font.ascent+font.descent;
 c.ARC_H=Math.max(line+c.dp(2)+c.dp(4),c.dp(36));
 c.topTimeTemplate=()=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{topGlyphs}}" tid="id"></image>';
 c.arcTemplate=status=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{'+(status?'statusGlyphs':'clockGlyphs')+'}}" tid="id"></image>';
};
