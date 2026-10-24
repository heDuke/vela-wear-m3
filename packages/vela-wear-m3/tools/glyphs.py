# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
"""Render the bundled glyph sprites from an OFL font, never from SDK font files."""
import os,pathlib,math,json
from PIL import Image,ImageDraw,ImageFont
ROOT=pathlib.Path(__file__).resolve().parent.parent
SS=2  # bake at 2× then Lanczos-downscale for cheaper AA on rotate
def generate(folder,px):
 source=os.environ.get('VELA_FONT') or str(ROOT/'.cache/fonts/NotoSansSC.ttf')
 if not pathlib.Path(source).is_file():raise RuntimeError('Run node tools/fetch-font.js in the library, or set VELA_FONT to a properly licensed font')
 size=px(15)
 ft=ImageFont.truetype(source,size)
 ft_hi=ImageFont.truetype(source,size*SS)
 try:ft.set_variation_by_axes([600]);ft_hi.set_variation_by_axes([600])
 except (OSError,AttributeError):pass
 asc,desc=ft.getmetrics();asc_hi,desc_hi=ft_hi.getmetrics();chars='0123456789:同步 ·'
 meta={'size':size,'ascent':asc,'descent':desc,'adv':{ch:ft.getlength(ch) for ch in chars},'glyphs':{},'family':'Noto Sans SC','sourceLicense':'OFL-1.1'}
 for index,ch in enumerate(chars):
  # 1× layout metrics (runtime transformOrigin / advances)
  fw=math.ceil(ft.getlength(ch))+4;fh=asc+desc
  # 2× bake then downscale
  fw_hi=math.ceil(ft_hi.getlength(ch))+4*SS;fh_hi=asc_hi+desc_hi
  im_hi=Image.new('RGBA',(fw_hi,fh_hi));ImageDraw.Draw(im_hi).text((2*SS,asc_hi),ch,font=ft_hi,fill='#C6C6C6',anchor='ls')
  # Noto SC middot advance is near-fullwidth; Wear M3 separator needs a narrow · (ink + small pad).
  if ch=='·':
   alpha=im_hi.split()[-1];bb=alpha.getbbox()
   if bb:
    pad=2*SS;left=max(0,bb[0]-pad);right=min(fw_hi,bb[2]+pad);im_hi=im_hi.crop((left,0,right,fh_hi))
    meta['adv'][ch]=max(1,round(im_hi.size[0]/SS)-4)
    fw=math.ceil(meta['adv'][ch])+4
  im=im_hi.resize((max(1,round(im_hi.size[0]/SS)),fh),Image.Resampling.LANCZOS)
  if ch!='·' and im.size[0]!=fw:
   # pad/crop width to 1× advance box
   canvas=Image.new('RGBA',(fw,fh));canvas.paste(im,(0,0),im);im=canvas
  im.quantize(colors=16,method=Image.Quantize.FASTOCTREE).save(str(pathlib.Path(folder)/('font_'+str(index)+'.png')),optimize=True);meta['glyphs'][ch]='/common/img/font_'+str(index)+'.png'
 return meta
if __name__=='__main__':
 devices=json.loads((ROOT/'tools/devices.json').read_text());meta=json.loads((ROOT/'assets/animations.json').read_text())
 for name,d in devices.items():meta[name]['font']=generate(ROOT/'assets'/name,lambda v:round(v*d['k']))
 (ROOT/'assets/animations.json').write_text(json.dumps(meta,ensure_ascii=False,indent=1)+'\n',encoding='utf8')
 print('OFL glyph images and actual font metrics updated for four devices')
