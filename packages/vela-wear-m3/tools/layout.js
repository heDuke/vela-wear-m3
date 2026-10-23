// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Derive row heights and repetition from the expanded UX, never a second height table.
function describe(ux) {
 const css=(ux.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||'';
 const heights={};for(const m of css.matchAll(/\.([\w-]+)\s*\{([^{}]*)\}/g)){
  const h=m[2].match(/(?:^|;)\s*height:\s*([\d.]+)px/);if(h)heights[m[1]]=+h[1];
 }
 const list=(ux.match(/<list\b[^>]*>([\s\S]*?)<\/list>/)||[])[1]||'';
 return Array.from(list.matchAll(/<list-item\b([^>]*)>/g),m=>{
  const cls=(m[1].match(/class="([^"]*)"/)||[])[1]||'';
  const type=(m[1].match(/type="([^"]*)"/)||[])[1]||'';
  const repeat=(m[1].match(/for="\{\{(\w+)\}\}"/)||[])[1];
  const candidates=cls.split(/\s+/).filter(x=>heights[x]!==undefined);
  if(!candidates.length)throw new Error('Missing row height: '+type+' '+cls);
  return {type,height:heights[candidates[candidates.length-1]],...(repeat?{repeat}:{})};
 });
}
module.exports={describe};
