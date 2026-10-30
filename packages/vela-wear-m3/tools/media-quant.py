# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
# PNG8-quantise only the media (md_*) assets and refresh their entries in assets/sizes.json (other files untouched).
# Palette = most frequent colours, greedily kept when far enough apart (premultiplied RGBA), so the exact flat
# colours (track, indicator, the opaque black eraser of ring overlays) always survive; edge pixels map to nearest.
import os, json
import numpy as np
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));D=json.load(open(ROOT+'/tools/devices.json'))
rep=json.load(open(ROOT+'/assets/sizes.json'))
def pm(c):c=c.astype(float);return np.concatenate([c[...,:3]*c[...,3:4]/255,c[...,3:4]],-1)
def quant(im,n):
    a=np.asarray(im.convert('RGBA')).reshape(-1,4).copy();a[a[:,3]==0]=0
    cols,counts=np.unique(a,axis=0,return_counts=True);order=np.argsort(-counts);pal=[]
    for md in (40,24,12,6,0):
        for i in order:
            c=cols[i]
            if len(pal)>=n:break
            if all(np.abs(pm(c)-pm(p)).sum()>md for p in pal):pal.append(c)
        if len(pal)>=n:break
    P=np.array(pal);d=np.abs(pm(a)[:,None,:]-pm(P)[None,:,:]).sum(2);idx=d.argmin(1).astype(np.uint8)
    out=Image.fromarray(idx.reshape(im.size[1],im.size[0]),'P')
    flat=[];[flat.extend(int(v) for v in p[:3]) for p in P];out.putpalette(flat);out.info['transparency']=bytes(int(p[3]) for p in P)
    return out
for id in D:
    dd=f'{ROOT}/assets/{id}/';r=rep.setdefault(id,{})
    for f in sorted(os.listdir(dd)):
        if not f.startswith('md_') or not f.endswith('.png'):continue
        im=Image.open(dd+f)
        if im.mode!='P':
            n=12 if f.startswith('md_r') else 24 if f.startswith('md_scallop') else 16
            q=quant(im,n);q.save(dd+f,optimize=True,transparency=q.info['transparency'])
        r[f]=os.path.getsize(dd+f)
    for k in [k for k in r if k.startswith('md_') and not os.path.exists(dd+k)]:del r[k]
    r.pop('_total_bytes',None);r['_total_bytes']=sum(v for k,v in r.items())
json.dump(rep,open(ROOT+'/assets/sizes.json','w'),indent=1)
for id in D:print(id,sum(v for k,v in rep[id].items() if k.startswith('md_')),'B media;',sum(v for k,v in rep[id].items() if k.startswith('md_r')),'B ring')
