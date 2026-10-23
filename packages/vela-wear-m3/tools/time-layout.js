// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
module.exports=c=>{
 c.topTimeTemplate=()=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{topGlyphs}}" tid="id"></image>';
 c.arcTemplate=status=>'<image class="arc-g" style="{{$item.st}}" src="{{$item.src}}" for="{{'+(status?'statusGlyphs':'clockGlyphs')+'}}" tid="id"></image>';
};
