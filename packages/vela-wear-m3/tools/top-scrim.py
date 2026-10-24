# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
"""Top-edge fade under page-top TimeText (Wear M3: content fades as it scrolls under the time).
Vela documents no CSS gradient, so bake a per-device PNG: #000 opaque over the time glyph band,
then eased fade to transparent ~10dp below the glyph bottom. Deterministic (no browser)."""
import json,pathlib
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent
FADE_DP=10
def spec(d,font):
 dp=lambda v:round(v*d['k'])
 # glyph bottom: arc glyphs top=2dp, box=ascent+descent; rect linear .tt-rect top=2dp, line 18dp
 bottom=dp(2)+(dp(18) if d['shape']=='rect' else font['ascent']+font['descent'])
 solid=round(bottom*0.75)
 return solid,bottom+dp(FADE_DP)
def render(d,font):
 # PNG8 with an explicit 64-level black alpha ramp (exact 255 at top, 0 at bottom); no octree drift.
 solid,h=spec(d,font);N=64;im=Image.new('P',(d['W'],h))
 im.putpalette([0,0,0]*N);trns=bytes(round(255*i/(N-1)) for i in range(N))
 for y in range(h):
  t=0 if y<solid else (y-solid)/max(1,h-1-solid);a=1-t*t*(3-2*t)  # smoothstep
  im.paste(round(a*(N-1)),(0,y,d['W'],y+1))
 im.info['transparency']=trns
 return im
if __name__=='__main__':
 devices=json.loads((ROOT/'tools/devices.json').read_text());meta=json.loads((ROOT/'assets/animations.json').read_text())
 for name,d in devices.items():
  im=render(d,meta[name]['font']);im.save(str(ROOT/'assets'/name/'top_scrim.png'),optimize=True,transparency=im.info['transparency'])
  print(name,'top_scrim',im.size,'solid',spec(d,meta[name]['font'])[0])
 # keep assets/sizes.json in step without re-quantising other assets
 sp=ROOT/'assets/sizes.json';rep=json.loads(sp.read_text())
 for name in devices:
  r=rep.setdefault(name,{});r.pop('_total_bytes',None);r['top_scrim.png']=(ROOT/'assets'/name/'top_scrim.png').stat().st_size
  rep[name]=dict(sorted(r.items()));rep[name]['_total_bytes']=sum(rep[name].values())
 sp.write_text(json.dumps(rep,indent=1))
