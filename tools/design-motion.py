"""Export asset sampling demonstrations; these are not emulator recordings."""
import json,pathlib,subprocess,math,shutil
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).resolve().parent.parent
dest=root/'docs/screenshots/ui-2026-10-24/design-motion';dest.mkdir(exist_ok=True)
meta=json.loads((root/'packages/vela-wear-m3/assets/animations.json').read_text())
font=ImageFont.truetype(str(pathlib.Path.home()/'.vela/sdk/qa/font/MiSansW_Normal.ttf'),20)
small=ImageFont.truetype(str(pathlib.Path.home()/'.vela/sdk/qa/font/MiSansW_Normal.ttf'),16)
ffmpeg=root/'out/runtime/package/ffmpeg.exe'
if not ffmpeg.exists():ffmpeg=shutil.which('ffmpeg') or ffmpeg
for device in ['round','band10']:
    kinds=['morph','buttonMorph','switchOn','indeterminate','arcLoading','check']
    assets={kind:[Image.open(root/'packages/vela-wear-m3/assets'/device/pathlib.PurePosixPath(uri).name).convert('RGBA') for uri in (meta[device]['switchOn']+[meta[device]['switchOn'][-1]]*16+meta[device]['switchOff']+[meta[device]['switchOff'][-1]]*16 if kind=='switchOn' else meta[device][kind])] for kind in kinds}
    output=dest/(device+'-asset-motion.mp4')
    cmd=[str(ffmpeg),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size','960x640','-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for frame in range(150):
        canvas=Image.new('RGB',(960,640),'#161318');draw=ImageDraw.Draw(canvas)
        draw.text((16,10),device+' 局部资源动效示意 / 非模拟器录屏',font=font,fill='white')
        draw.text((16,39),'30fps 导出采样，不代表设备帧率；按压与开关为往返资源展示',font=small,fill='#c6c6c6')
        t=frame/30
        for index,kind in enumerate(kinds):
            frames=assets[kind];n=len(frames)
            if kind=='indeterminate': position=frame%n
            elif kind=='arcLoading': position=frame%n
            elif kind=='switchOn': position=frame%n  # on 14 frames + hold, off 14 frames + hold, one sprite per 33ms
            elif kind=='check': position=round(min(1,(t%2)/.267)*(n-1))
            else: position=round((.5-.5*math.cos(2*math.pi*(t%2)/2))*(n-1))
            im=frames[position].copy()
            if kind=='indeterminate': im=im.rotate(-360*t/5,resample=Image.Resampling.BICUBIC,expand=False)
            im.thumbnail((270,205))
            x=(index%3)*320;y=90+(index//3)*270
            draw.text((x+16,y),kind,font=font,fill='white')
            canvas.paste(im,(x+(320-im.width)//2,y+40+(205-im.height)//2),im)
        draw.text((16,612),f'{t:.2f}s · 图形资源对照，交互与布局由正式应用实时渲染',font=small,fill='#c6c6c6')
        proc.stdin.write(canvas.tobytes())
    proc.stdin.close()
    if proc.wait()!=0: raise RuntimeError('ffmpeg failed')
    print(output)
