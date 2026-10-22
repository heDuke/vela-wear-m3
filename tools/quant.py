# Quantise every asset to PNG8 (palette + tRNS alpha); write per-device size report (assets/sizes.json).
import os, json
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D=json.load(open(ROOT+'/tools/devices.json')); rep={}
for id in D:
    dd=f'{ROOT}/assets/{id}/'; rep[id]={}
    for f in sorted(os.listdir(dd)):
        if not f.endswith('.png'): continue
        im=Image.open(dd+f).convert('RGBA')
        n=64 if f in ('logo.png','scrim.png') else 32 if any(s in f for s in ('scroll','si_','edge','curved','timetext','spin')) else 16
        im.quantize(colors=n,method=Image.FASTOCTREE).save(dd+f,optimize=True); rep[id][f]=os.path.getsize(dd+f)
    rep[id]['_total_bytes']=sum(rep[id].values())
json.dump(rep,open(ROOT+'/assets/sizes.json','w'),indent=1)
for id in rep: print(id,len(rep[id])-1,'files',rep[id]['_total_bytes'],'B')
