# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
"""Render the bundled glyph sprites from an OFL font, never from SDK font files."""
import os,pathlib,math,json
from PIL import Image,ImageDraw,ImageFont
ROOT=pathlib.Path(__file__).resolve().parent.parent
def generate(folder,px):
 source=os.environ.get('VELA_FONT') or str(ROOT/'.cache/fonts/NotoSansSC.ttf')
 if not pathlib.Path(source).is_file():raise RuntimeError('Run node tools/fetch-font.js in the library, or set VELA_FONT to a properly licensed font')
 ft=ImageFont.truetype(source,px(15))
 try:ft.set_variation_by_axes([600])
 except (OSError,AttributeError):pass
 asc,desc=ft.getmetrics();chars='0123456789:同步 ·'
 meta={'size':px(15),'ascent':asc,'descent':desc,'adv':{ch:ft.getlength(ch) for ch in chars},'glyphs':{},'family':'Noto Sans SC','sourceLicense':'OFL-1.1'}
 for index,ch in enumerate(chars):
  fw=math.ceil(ft.getlength(ch))+4;fh=asc+desc;im=Image.new('RGBA',(fw,fh));ImageDraw.Draw(im).text((2,asc),ch,font=ft,fill='#C6C6C6',anchor='ls')
  im.quantize(colors=16,method=Image.Quantize.FASTOCTREE).save(str(pathlib.Path(folder)/('font_'+str(index)+'.png')),optimize=True);meta['glyphs'][ch]='/common/img/font_'+str(index)+'.png'
 return meta
if __name__=='__main__':
 devices=json.loads((ROOT/'tools/devices.json').read_text());meta=json.loads((ROOT/'assets/animations.json').read_text())
 for name,d in devices.items():meta[name]['font']=generate(ROOT/'assets'/name,lambda v:round(v*d['k']))
 (ROOT/'assets/animations.json').write_text(json.dumps(meta,ensure_ascii=False,indent=1)+'\n',encoding='utf8')
 print('OFL glyph images and actual font metrics updated for four devices')
