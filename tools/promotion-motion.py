"""SPDX-License-Identifier: GPL-3.0-or-later
Encode the existing resource MP4s sampled by tools/promotion.js. Not device FPS.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, os

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'docs/promotion/bandbbs'
FONT=Path(os.environ.get('VELA_PROMOTION_FONT','C:/Windows/Fonts/msyh.ttc'))
def main():
    receipts=json.loads((ROOT/'out/promotion-frames/source.json').read_text())
    for row in receipts:
        frames=[]
        for i in range(row['frames']):
            a=Image.open(ROOT/'out/promotion-frames'/row['device']/f'{i:03}.png').convert('RGB')
            im=Image.new('RGB',(540,394),'#141218');im.paste(a,(0,0))
            ImageDraw.Draw(im).text((16,365),'局部资源动效演示 · 非设备录屏',font=ImageFont.truetype(str(FONT),15),fill='#D8CDE0')
            frames.append(im)
        target=OUT/(row['device']+'-motion.gif')
        frames[0].save(target,save_all=True,append_images=frames[1:],duration=125,loop=0,optimize=True)
        assert target.stat().st_size<3*1024*1024
        row.update(file=target.name,bytes=target.stat().st_size,kind='resource motion, not device recording')
    (OUT/'motion-source.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(receipts))
if __name__=='__main__':main()
