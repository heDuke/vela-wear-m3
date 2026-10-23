"""Validate every packaged RPK against its device/API receipt and ZIP CRC."""
import json,zipfile,pathlib,hashlib,io,re
from PIL import Image
root=pathlib.Path(__file__).resolve().parent.parent
rows=json.loads((root/'out/size-report.json').read_text(encoding='utf-8'))
devices=json.loads((root/'packages/vela-wear-m3/tools/devices.json').read_text(encoding='utf-8'))
expected={(d,api,mode) for d in devices for api in (1,2) for mode in ('debug','release')}
results=[]
for row in rows:
    key=(row['device'],row['api'],row['mode'])
    assert key in expected, ('duplicate or unknown configuration',key)
    expected.remove(key)
    p=root/row['file']
    assert p.stat().st_size==row['bytes'], ('size mismatch',str(p))
    with zipfile.ZipFile(p) as z:
        assert z.testzip() is None, ('CRC failure',str(p))
        manifest=json.loads(z.read('manifest.json'))
        assert manifest['package']=='com.velam3.demo'
        assert manifest['versionName']==re.search(r'"versionName":\s*"([^"]+)"',(root/'template/manifest.tpl.json').read_text()).group(1)
        assert manifest['minAPILevel']==row['api']
        assert manifest['config']['designWidth']==devices[row['device']]['W']
        assert not any('private.pem' in n for n in z.namelist())
        for legal in ['common/legal/vela-wear-m3/LICENSE.txt','common/legal/vela-wear-m3/NOTICE.txt','common/legal/vela-wear-m3/DEMO-EXCEPTION.md.txt','common/legal/vela-wear-m3/licenses/Apache-2.0.txt','common/legal/demo/PolyForm-Noncommercial-1.0.0.txt']:
            assert legal in z.namelist(), ('missing license material',key,legal)
        images=[n for n in z.namelist() if n.startswith('common/img/') and n.endswith('.png')]
        assert len(images)==row['assetFiles'], ('asset count mismatch',key,len(images))
        if row['device']=='round':
            im=Image.open(io.BytesIO(z.read('common/img/level_5.png'))).convert('RGBA')
            top=bottom=0
            for y in range(im.height):
                for x in range(im.width):
                    r,g,b,a=im.getpixel((x,y))
                    if a>128 and b>r+15 and b>g+15:
                        if y<im.height/2:top+=1
                        else:bottom+=1
            assert bottom>top*2, ('LevelIndicator must fill from bottom',key,top,bottom)
    results.append(dict(device=row['device'],api=row['api'],mode=row['mode'],bytes=row['bytes'],sha256=hashlib.sha256(p.read_bytes()).hexdigest(),archiveValid=True))
assert not expected, ('missing configurations',expected)
(root/'out/artifact-validation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print('16 RPK validated: CRC, manifest, device width, API level, resources, license material, no private key')
