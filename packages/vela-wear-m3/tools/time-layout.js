// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
module.exports=(c,font)=>{
 // Arc demo panel must fit transform-origin Y = W/2 - edgePadding(2dp) below glyph top
 // plus the glyph box (ascent+descent). Matches Wear M3 TimeText on round (cy=H/2) / pill (cy=W/2).
 const line=font.ascent+font.descent;
 c.ARC_H=Math.round(c.W/2-c.dp(2)+line);
 c.topTimeTemplate=()=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{topGlyphs}}" tid="id"></image>';
 c.arcTemplate=status=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{'+(status?'statusGlyphs':'clockGlyphs')+'}}" tid="id"></image>';
};
