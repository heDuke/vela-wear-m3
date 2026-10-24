"""Compose labeled design previews. No image generation or native screenshot claims."""
from PIL import Image,ImageDraw,ImageFont
import pathlib,json,math
root=pathlib.Path(__file__).resolve().parent.parent
base=root/'docs/screenshots/ui-2026-10-24';folder=base/'previews';dest=base/'comparison';dest.mkdir(exist_ok=True)
font=ImageFont.truetype(str(pathlib.Path.home()/'.vela/sdk/qa/font/MiSansW_Normal.ttf'),18)
small=ImageFont.truetype(str(pathlib.Path.home()/'.vela/sdk/qa/font/MiSansW_Normal.ttf'),14)
names=['home','buttons','cards','list','edge','time','switches','dialogs','progress'];labels=['首页','按钮','卡片','列表','边缘','时间','开关','对话框','进度']
width=180;devices=['round','pro','band10','band9'];heights=[]
for d in devices:
 im=Image.open(folder/(d+'_home.png'));heights.append(round(im.height*width/im.width)+52)
canvas=Image.new('RGB',(9*(width+8)+8,sum(heights)+48),'#161318');draw=ImageDraw.Draw(canvas);draw.text((12,8),'设计预览 / Chrome，非模拟器实拍',font=font,fill='white');y=40
for device,rowh in zip(devices,heights):
 for i,(name,label) in enumerate(zip(names,labels)):
  im=Image.open(folder/(device+'_'+name+'.png')).convert('RGB');im=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS);x=8+i*(width+8);draw.text((x,y),device+' · '+label,font=small,fill='white');canvas.paste(im,(x,y+28))
 y+=rowh
canvas.save(dest/'all-devices-nine-pages.png')
# Actual sampled asset frames (graphics only, no runtime timing claim).
a=json.loads((root/'packages/vela-wear-m3/assets/animations.json').read_text())
for device in devices:
 cases=[('morph',[0,4,9,14,18]),('buttonMorph',[0,4,9,14,18]),('switchOn',[0,1,2,4,13]),('indeterminate',[0,37,75,112,149]),('arcLoading',[0,6,12,18,27]),('check',[0,2,4,6,8])]
 sheet=Image.new('RGB',(800,len(cases)*160+40),'#161318');dr=ImageDraw.Draw(sheet);dr.text((12,8),device+' 动画局部关键帧 / 固定参考采样',font=font,fill='white')
 for row,(kind,indexes) in enumerate(cases):
  dr.text((8,44+row*160),kind,font=small,fill='white')
  for col,index in enumerate(indexes):
   uri=a[device][kind][index];im=Image.open(root/'packages/vela-wear-m3/assets'/device/uri.split('/')[-1]).convert('RGBA');im.thumbnail((140,110));x=5+col*160+(150-im.width)//2;y=70+row*160+(110-im.height)//2;sheet.paste(im,(x,y),im);dr.text((10+col*160,185+row*160),str(index),font=small,fill='#c6c6c6')
 sheet.save(dest/(device+'-motion-keyframes.png'))
 frames=[0,50,100,167,300,500,900,3900,4100,4250];cw=180;ch=round(Image.open(folder/(device+'_confirmation-0.png')).height*cw/Image.open(folder/(device+'_confirmation-0.png')).width)
 sheet=Image.new('RGB',(cw*5,(ch+30)*2+30),'#161318');dr=ImageDraw.Draw(sheet);dr.text((8,4),device+' Confirmation / 设计预览',font=small,fill='white')
 for i,t in enumerate(frames):
  im=Image.open(folder/(device+'_confirmation-'+str(t)+'.png')).convert('RGB').resize((cw,ch));x=(i%5)*cw;y=30+(i//5)*(ch+30);sheet.paste(im,(x,y));dr.text((x+4,y+ch),str(t)+'ms',font=small,fill='white')
 sheet.save(dest/(device+'-confirmation-keyframes.png'))
 # Each cell is an actual element crop from the generated interactive page.
 sheet=Image.new('RGB',(1120,560),'#161318');dr=ImageDraw.Draw(sheet)
 dr.text((12,8),device+' Switch 状态矩阵 / 设计预览，非模拟器实拍',font=font,fill='white')
 states=['开启','关闭','禁用开启','禁用关闭']
 for kind in range(2):
  for state in range(4):
   im=Image.open(folder/(device+f'_switch-k{kind}-s{state}.png')).convert('RGBA');im.thumbnail((260,86))
   x=280+kind*280;y=40+state*130
   dr.text((x+8,y),f'组合 {kind+1} · '+states[state],font=small,fill='white')
   sheet.paste(im,(x+(280-im.width)//2,y+28),im)
 sheet.save(dest/(device+'-switch-matrix.png'))
print('Visual overviews and keyframes:',dest)
