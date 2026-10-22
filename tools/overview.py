# out/screens/*.png -> out/screens_overview.png (圆屏一行组 + 手环一行组，带标签)
import glob, os
from PIL import Image, ImageDraw, ImageFont
D = os.path.join(os.path.dirname(__file__), '..', 'out')
try:
    F = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 18)
    FB = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 30)
except Exception:
    F = FB = ImageFont.load_default()
groups = [('round', '圆屏 466×466（Vela 模拟器 vela-watch-5.0）', 233, 8), ('band10', '小米手环 10 212×520（Vela 模拟器 vela-watch-5.0）', 212 * 0.75, 11)]
rows = []
for dev, title, sw, cols in groups:
    fs = sorted(glob.glob(f'{D}/screens/{dev}_*.png'))
    ims = []
    for f in fs:
        im = Image.open(f).convert('RGB'); w, h = im.size; s = sw / w
        ims.append((os.path.basename(f)[len(dev) + 1:-4], im.resize((int(w * s), int(h * s)))))
    cw, ch = ims[0][1].size
    r = (len(ims) + cols - 1) // cols
    g = Image.new('RGB', (cols * (cw + 14) + 14, 56 + r * (ch + 40)), (24, 22, 28)); d = ImageDraw.Draw(g)
    d.text((14, 10), title, font=FB, fill=(233, 221, 255))
    for i, (n, im) in enumerate(ims):
        x = 14 + (i % cols) * (cw + 14); y = 56 + (i // cols) * (ch + 40)
        g.paste(im, (x, y)); d.text((x, y + ch + 6), n, font=F, fill=(202, 196, 208))
    rows.append(g)
W = max(g.size[0] for g in rows); H = sum(g.size[1] for g in rows)
out = Image.new('RGB', (W, H), (24, 22, 28)); y = 0
for g in rows: out.paste(g, (0, y)); y += g.size[1]
out.save(f'{D}/screens_overview.png', optimize=True)
print(out.size)
