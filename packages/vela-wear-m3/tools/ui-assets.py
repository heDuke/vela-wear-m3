# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
"""Pinned Wear M3 local assets. 3x supersampled, PNG8; runtime never draws paths."""
import os,json,math,hashlib,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw,ImageFont,ImageColor
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV=json.load(open(ROOT+'/tools/devices.json',encoding='utf8'));S=3
P='#E9DDFF';PC='#4D3D76';SUR='#332E3C';ON='#F6EDFF';OUT='#948F9A'
def bez(x):
 lo,hi=0.,1.
 for _ in range(22):
  t=(lo+hi)/2;a=1-t
  if 3*a*a*t*.2+t*t*t<x:lo=t
  else:hi=t
 return 3*(1-t)*t*t+t*t*t
def canvas(w,h):
 im=Image.new('RGBA',(max(1,round(w*S)),max(1,round(h*S))));return im,ImageDraw.Draw(im)
def ellipse(dr,b,c):dr.ellipse(tuple(round(v*S) for v in b),fill=c)
def line(dr,pts,c,sw):
 pts=[(round(x*S),round(y*S)) for x,y in pts];dr.line(pts,fill=c,width=max(1,round(sw*S)),joint='curve');r=sw*S/2
 for x,y in (pts[0],pts[-1]):dr.ellipse((round(x-r),round(y-r),round(x+r),round(y+r)),fill=c)
def arc(dr,cx,cy,r,a,s,c,sw):
 if s<=0:return
 dr.arc(tuple(round(v*S) for v in (cx-r,cy-r,cx+r,cy+r)),a,a+s,fill=c,width=max(1,round(sw*S)))
 mid=r-sw/2
 for q in (a,a+s):
  x=cx+mid*math.cos(math.radians(q));y=cy+mid*math.sin(math.radians(q));ellipse(dr,(x-sw/2,y-sw/2,x+sw/2,y+sw/2),c)
def segment(dr,w,h,sw,a,s,c,gap,diameter=None):
 mid=min(w,h)/2-sw/2;g=math.degrees(2*math.asin(min(1,(sw+gap)/(diameter or 2*mid))))
 if s<=0:return
 if s<=g:
  cr=sw/2*s/g;c=ImageColor.getrgb(c)+(round(255*min(1,s/g)),) if isinstance(c,str) else c;q=math.radians(a+s/2);x=w/2+mid*math.cos(q);y=h/2+mid*math.sin(q);ellipse(dr,(x-cr,y-cr,x+cr,y+cr),c)
 else:arc(dr,w/2,h/2,min(w,h)/2,a+g/2,s-g,c,sw)
def save(im,name,w=None,h=None):
 im=im.resize((max(1,round(w or im.width/S)),max(1,round(h or im.height/S))),Image.Resampling.LANCZOS)
 key=hashlib.sha256(str(im.size).encode()+im.tobytes()).hexdigest();uri='/common/img/'+name+'.png'
 im.quantize(colors=16,method=Image.Quantize.FASTOCTREE).save(folder+'/'+name+'.png',optimize=True)
 return dedup.setdefault(key,uri)
SW_MS=33;SW_N=14  # androidx SwitchButton: SWITCH_PROGRESS = fastEffectsSpec, COLOR = slowEffectsSpec
def crit(k,ms):
 if ms<=0:return 0.
 w=math.sqrt(k)*ms/1000;return 1-(1+w)*math.exp(-w)
def _rgba(c):return ImageColor.getrgb(c)+(255,) if isinstance(c,str) else tuple(c)
def _lin(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def _gam(v):return 12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055
def _lab(c):
 r,g,b=(_lin(v/255) for v in c[:3]);l=(.4122214708*r+.5363325363*g+.0514459929*b)**(1/3);m_=(.2119034982*r+.6806995451*g+.1073969566*b)**(1/3);s_=(.0883024619*r+.2817188376*g+.6299787005*b)**(1/3)
 return (.2104542553*l+.793617785*m_-.0040720468*s_,1.9779984951*l-2.428592205*m_+.4505937099*s_,.0259040371*l+.7827717662*m_-.808675766*s_)
def _rgb(L,a,b):
 l=(L+.3963377774*a+.2158037573*b)**3;m_=(L-.1055613458*a-.0638541728*b)**3;s_=(L-.0894841775*a-1.291485548*b)**3
 return tuple(round(255*max(0,min(1,_gam(max(0,v))))) for v in (4.0767416621*l-3.3077115913*m_+.2309699292*s_,-1.2684380046*l+2.6097574011*m_-.3413193965*s_,-.0041960863*l-.7034186147*m_+1.707614701*s_))
def oklab_mix(a,b,t):
 a,b=_rgba(a),_rgba(b);la,lb=_lab(a),_lab(b);return _rgb(*(x+(y-x)*t for x,y in zip(la,lb)))+(round(a[3]+(b[3]-a[3])*t),)
def switch_frame(k,p,colors):
 # SWITCH_WIDTH 32, outer 24, inner (track) 22, border 2, thumb radius 6->9, padding 5/2, tick 2dp at the official path.
 track,border,thumb,tick=colors;W,H=round(32*k),round(24*k);cy=H/2;layers=[]
 def layer():
  im,dr=canvas(W,H);layers.append(im);return dr
 box=(0,round(k*S),W*S-1,round(23*k*S)-1)
 if track[3]:layer().rounded_rectangle(box,radius=11*k*S,fill=track)
 if border[3] and border!=track:layer().rounded_rectangle(box,radius=11*k*S,outline=border,width=round(2*k*S))
 r=(6+3*p)*k;cx=(1-p)*(r+5*k)+p*(32*k-r-2*k)  # lerp(r+padUnchecked, W-r-padChecked, p) with the animated radius
 if thumb[3]:ellipse(layer(),(cx-r,cy-r,cx+r,cy+r),thumb)
 sc=1-(1-max(0,min(1,p)))**3
 if tick[3] and sc>0:
  dr=layer()
  for (x1,y1),(x2,y2) in (((-4.6,1),(-2.1,3.5)),((-1.5,3.1),(4.5,-2.9))):line(dr,[(cx+x1*k*sc,cy+y1*k*sc),(cx+x2*k*sc,cy+y2*k*sc)],tick,2*k*sc)
 out=canvas(W,H)[0]
 for im in layers:out=Image.alpha_composite(out,im)
 return out
def pal8(im):
 # Exact-ish PNG8 (pure Pillow): exact colours when <=256, else snap RGB to a 4-level grid (alpha kept exact), keep the
 # 256 most frequent and map the rest by premultiplied distance. Low-alpha antialias edges keep every alpha level
 # (FASTOCTREE/16 colours kept ~5, which read as jagged dotted edges on the disabled frames).
 b=im.convert('RGBA').tobytes();raw=[tuple(b[i:i+4]) for i in range(0,len(b),4)];raw=[(0,0,0,0) if c[3]==0 else c for c in raw]
 px=raw if len(set(raw))<=256 else [c if c[3]==0 else tuple(min(255,(v+1)//4*4) for v in c[:3])+(c[3],) for c in raw];cnt={}
 for c in px:cnt[c]=cnt.get(c,0)+1
 keep=sorted(cnt,key=lambda c:-cnt[c])[:256];pm=lambda c:(c[0]*c[3]/255,c[1]*c[3]/255,c[2]*c[3]/255,c[3])
 kp=[pm(c) for c in keep];pos={c:j for j,c in enumerate(keep)};index={}
 for c in cnt:
  q=pm(c);index[c]=pos[c] if c in pos else min(range(len(keep)),key=lambda j:sum((x-y)**2 for x,y in zip(q,kp[j])))
 out=Image.new('P',im.size);pal=[v for c in keep for v in c[:3]];out.putpalette(pal+[0]*(768-len(pal)))
 out.putdata([index[c] for c in px]);out.info['transparency']=bytes(c[3] for c in keep);return out
def save_sw(im,name):
 im=im.resize((round(im.width/S),round(im.height/S)),Image.Resampling.LANCZOS)
 key=hashlib.sha256(str(im.size).encode()+im.tobytes()).hexdigest();uri='/common/img/'+name+'.png'
 if key in dedup:return dedup[key]
 p=pal8(im);p.save(folder+'/'+name+'.png',optimize=True,transparency=p.info['transparency'])
 return dedup.setdefault(key,uri)
allmeta={}
for ident,d in DEV.items():
 k=d['k'];px=lambda n:round(n*k);W,H=d['W'],d['H'];pill=d['shape']=='pill';folder=ROOT+'/assets/'+ident;os.makedirs(folder,exist_ok=True);dedup={};m={}
 im,dr=canvas(px(24),px(24));line(dr,[(px(19),px(12)),(px(5),px(12)),(px(12),px(5))],ON,px(2));line(dr,[(px(5),px(12)),(px(12),px(19))],ON,px(2));save(im,'back_onSurface_24')
 for name in ('add','remove'):
  im,dr=canvas(px(24),px(24));line(dr,[(px(5),px(12)),(px(19),px(12))],(246,237,255,97),px(2))
  if name=='add':line(dr,[(px(12),px(5)),(px(12),px(19))],(246,237,255,97),px(2))
  save(im,name+'_disabled_24')
 cw=W-2*round(math.ceil(W/k*.052)*k)
 for kind,w,h,rest,pressed in [('morph',px(52),px(52),26,8),('buttonMorph',cw,px(52),26,8),('compactMorph',px(72),px(32),16,8)]:
  frames=[]
  for i in range(19):
   im,dr=canvas(w,h);r=px(rest+(pressed-rest)*i/18);dr.rounded_rectangle((0,0,im.width-1,im.height-1),radius=r*S,fill=P);frames.append(save(im,kind+'_'+str(i)))
  m[kind]=frames
 # SwitchButton (androidx SwitchButton.kt Switch/drawThumbAndTick + AnimateTick.drawScalingTick). Official default only:
 # the thumb always carries the tick. Thumb progress = fastEffectsSpec (critically damped, stiffness 1400) and every
 # colour (track, border, thumb, tick alpha) = slowEffectsSpec (stiffness 260), Oklab-interpolated like animateColorAsState.
 # Frames are time-indexed per direction (one per 33ms page tick, 0..396ms, last frame = exact end state), so the two
 # specs stay decoupled without a 2-D sprite. Layers are alpha-composited in the official draw order.
 m['switchFrameMs']=SW_MS;m['switchThumb']={}
 for dirn,name in ((1,'On'),(0,'Off')):
  frames=[];thumbs=[]
  for i in range(SW_N):
   last=i==SW_N-1;Pf=1. if last else crit(1400,i*SW_MS);Cc=1. if last else crit(260,i*SW_MS)
   p=Pf if dirn else 1-Pf;c=Cc if dirn else 1-Cc
   frames.append(save_sw(switch_frame(k,p,(oklab_mix(SUR,P,c),oklab_mix(OUT,P,c),oklab_mix(OUT,PC,c),oklab_mix((0,0,0,0),P,c))),'sw_'+name.lower()+'_'+str(i)))
   thumbs.append(round(p,4))
  m['switch'+name]=frames;m['switchThumb'][name.lower()]=thumbs
 OS12=(246,237,255,31)
 m['switchDisabled']=[save_sw(switch_frame(k,0,((0,0,0,0),OS12,OS12,(0,0,0,0))),'sw_dis_0'),save_sw(switch_frame(k,1,(OS12,OS12,(0,0,0,97),OS12)),'sw_dis_1')]
 for kind in ('ring','seg','segBinary','arc','linear','linearThick','overflow'):
  frames=[]
  for pct in [0,1,2,3,4]+list(range(5,101,5)):
   linear=kind.startswith('linear');size=px(72 if kind=='ringLarge' else 48);w,h=(px(100 if pill else 140),px(12)) if linear else (size,size)
   im,dr=canvas(w,h);p=pct/100;sw=px(3 if kind=='ringThin' else (12 if kind=='ringLarge' and W/k>=225 else 8 if kind=='ringLarge' else (8 if W/k>=225 else 5)));gap=sw/3
   if linear:
    stroke=px(12 if kind=='linearThick' else 8);x0=px(2)+stroke/2;x1=w-px(2)-stroke/2;y=h/2;end=px(2)+(w-2*px(2))*p
    if end+stroke/2+px(4)<x1:line(dr,[(max(x0,end+stroke/2+px(4)),y),(x1,y)],SUR,stroke)
    if p>0:line(dr,[(x0,y),(max(x0,end-stroke/2),y)],P,stroke)
    dot=px(2);cx=w-px(2)-dot
    if end+px(4)<cx-dot:ellipse(dr,(cx-dot,y-dot,cx+dot,y+dot),P)
   elif kind in ('seg','segBinary'):
    for j in range(5):
     part=max(0,min(1,p*5-j));part=(1 if part>=1 else 0) if kind=='segBinary' else part
     segment(dr,w,h,sw,270+j*72,72,SUR,gap)
     if part:segment(dr,w,h,sw,270+j*72,72*part,P,gap)
   else:
    start,total=(130,280) if kind=='arc' else (270,360);track='#8C8599' if kind=='overflow' else SUR
    if p<1:segment(dr,w,h,sw,start+total*p,total*(1-p),track,gap)
    if p>=1 and total==360:arc(dr,w/2,h/2,w/2,start,360,P,sw)
    elif p>0:segment(dr,w,h,sw,start,total*p,P,gap*(1-min(1,max(0,(p-.95)/.05))))
   frames.append(save(im,kind+'_'+str(pct)))
  m[kind]=frames
 m['ringThin']=m['ring'];m['ringLarge']=m['ring']
 frames=[];rotations=[];size=px(24);sw=px(3);mid=size/2-sw/2
 for i in range(150):
  ms=i*1000/30;t=ms/1250;phase=int(t);q=bez(t-phase);sweep=[.8*q,.8-.6*q,.2+.6*q,.8*(1-q)][phase]*360
  step=math.degrees(1.8/mid);sweep=round(sweep/step)*step
  im,dr=canvas(size,size)
  segment(dr,size,size,sw,270+sweep,360-sweep,SUR,sw/3);segment(dr,size,size,sw,270,max(.01,sweep),P,sw/3)
  frames.append(save(im,'ind_'+str(i)));rotations.append(1440*ms/5000+(0 if phase==0 else 360*q if phase==1 else 360 if phase==2 else 360+360*q))
 m['indeterminate']=frames;m['spinRotation']=rotations
 # Official default is a 65..115 degree BOTTOM arc, not a 65..115 degree sweep.
 diam=round(min(H*.8124,(cw-px(12))/math.sin(math.radians(25))));stroke=px(6);gap=stroke/3
 im,dr=canvas(diam,diam);segment(dr,diam,diam,stroke,65,50,SUR,gap,diam);bb=im.getbbox();box=(math.floor(bb[0]/S),math.floor(bb[1]/S),math.ceil(bb[2]/S),math.ceil(bb[3]/S));frames=[]
 def arcseg(dr,start,sweep,color):
  if sweep<0:start+=sweep;sweep=-sweep
  segment(dr,diam,diam,stroke,start,sweep,color,gap,diam)
 def curve03(x):
  x=max(0,min(1,x));lo,hi=0.,1.
  for _ in range(22):
   t=(lo+hi)/2;a=1-t
   if 3*a*a*t*.3+3*a*t*t*.7+t*t*t<x:lo=t
   else:hi=t
  return 3*(1-t)*t*t+t*t*t
 for i in range(60):
  ms=i*1000/30;head=curve03(ms/600);tail=curve03((ms-300)/600);im,dr=canvas(diam,diam)
  arcseg(dr,65,(1-head)*50,SUR);arcseg(dr,115-tail*50,(tail-head)*50,P);arcseg(dr,115,-tail*50,SUR)
  im=im.crop(tuple(v*S for v in box));frames.append(save(im,'arcLoad_'+str(i),box[2]-box[0],box[3]-box[1]))
 m['arcLoadingBox']={'w':box[2]-box[0],'h':box[3]-box[1]}
 m['arcLoading']=frames
 frames=[];size=px(26)
 for i in range(10):
  t=i/9;im,dr=canvas(size,size);dr.polygon([(px(8)*S,px(5)*S),(px(8)*S,px(21)*S),(px(21)*S,px(13)*S)],fill=(33,15,72,round(255*(1-t))))
  for x in (8,16):dr.rounded_rectangle((px(x)*S,px(5)*S,px(x+4)*S,px(21)*S),radius=S,fill=(33,15,72,round(255*t)))
  frames.append(save(im,'playPause_'+str(i)))
 m['playPause']=frames
 from glyphs import generate as generate_glyphs
 m['font']=generate_glyphs(folder,px)
 frames=[];size=px(52);pts=[(size*(252+x*1.05507)/520,size*(294+y*1.05556)/520) for x,y in [(-147.5,-20),(-51.5,76),(151.5,-127)]];lengths=[math.dist(pts[0],pts[1]),math.dist(pts[1],pts[2])];total=sum(lengths)
 for i in range(9):
  im,dr=canvas(size,size);remain=total*bez(i/8);out=[pts[0]]
  for j,ln in enumerate(lengths):
   q=max(0,min(1,remain/ln));a,b=pts[j],pts[j+1]
   if q>0:out.append((a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q))
   remain-=ln
   if q<1:break
  if len(out)>1:line(dr,out,P,px(34*1.05556/10))
  frames.append(save(im,'check_draw_'+str(i)))
 m['check']=frames
 if d['shape']=='circle':
  R=W/2;stroke=px(6 if W/k>=225 else 5);ra=R-px(2)-stroke/2;L=px(50);gap=px(3);tw=stroke+12;hh=L+2*gap+2*stroke+4;frames=[]
  for f in range(30,71):
   im,dr=canvas(W,H);length=L*f/100;half=math.degrees(max(0,length-stroke)/(2*ra));arc(dr,R,R,ra+stroke/2,-half-math.degrees((gap+stroke)/ra),2*half+2*math.degrees((gap+stroke)/ra),'#000000',stroke+2);arc(dr,R,R,ra+stroke/2,-half,2*half,'#C6C6C6',stroke)
   im=im.crop((round((W-tw)*S),round((R-hh/2)*S),W*S,round((R+hh/2)*S)));frames.append(save(im,'scroll_'+str(f),tw,hh))
  m['scroll']=frames;m['scrollBox']={'w':tw,'h':hh,'L':L,'Ra':ra,'sw':stroke}
 # StepperLevelIndicator (androidx LevelIndicator.kt + ScrollIndicator.kt IndicatorImpl/drawCurvedIndicator), every
 # device: arc on the screen-width circle, edgePadding 2dp, stroke 6dp, SweepAngle 72 -> indicatorHeight, total sweep =
 # height sweep + gapSweep(stroke+3dp); fill from the bottom, track above, each piece inset gapSweep/2 with round caps.
 # Runtime draws it from layers: the full-length fill / track arcs (cap-centre span L = sweep - gap) are rotated about
 # the screen centre so their moving ends sit at the fill boundary +-gap/2; static black masks beyond the two fixed ends
 # (with a cap-radius cut-out) hide the overshoot; short pieces (sweep*f <= gap) become a dot (radius/alpha lerp) drawn
 # as a div above the masks.
 kf=k;Wd=W/kf;lsw=6;Ru=Wd/2-2;lar=Ru-lsw/2;lh=2*math.sin(math.radians(36))*lar
 lgap=math.degrees(2*math.asin((lsw+3)/2/Ru));lsweep=math.degrees(2*math.asin(lh/2/Ru))+lgap;lst=180-lsweep/2;LL=lsweep-lgap
 lcx,lcy,lR,lo=W/2,H/2,lar*kf,lsw/2*kf
 def lv_img(name,color,draw):
  im=Image.new('L',(W*S,H*S),0);dr=ImageDraw.Draw(im);draw(dr);im=im.resize((W,H),Image.Resampling.LANCZOS);bb=im.getbbox()
  im=im.crop(bb);out=Image.new('RGBA',im.size,ImageColor.getrgb(color)+(0,));out.putalpha(im)
  pal=pal8(out);pal.save(folder+'/'+name+'.png',optimize=True,transparency=pal.info['transparency'])
  return {'src':'/common/img/'+name+'.png','x':bb[0],'y':bb[1],'w':bb[2]-bb[0],'h':bb[3]-bb[1]}
 def lv_arc(a0,a1,r=None,o=None):
  r=lR if r is None else r;o=lo if o is None else o
  def f(dr):
   dr.arc(tuple(round(v*S) for v in (lcx-r-o,lcy-r-o,lcx+r+o,lcy+r+o)),a0,a1,fill=255,width=round(2*o*S))
   for a in (a0,a1):x=lcx+r*math.cos(math.radians(a));y=lcy+r*math.sin(math.radians(a));dr.ellipse(tuple(round(v*S) for v in (x-o,y-o,x+o,y+o)),fill=255)
  return f
 def lv_mask(a0,a1,cut):
  def f(dr):
   ro=lo+2
   dr.arc(tuple(round(v*S) for v in (lcx-lR-ro,lcy-lR-ro,lcx+lR+ro,lcy+lR+ro)),a0,a1,fill=255,width=round(2*ro*S))
   x=lcx+lR*math.cos(math.radians(cut));y=lcy+lR*math.sin(math.radians(cut));dr.ellipse(tuple(round(v*S) for v in (x-lo,y-lo,x+lo,y+lo)),fill=0)
  return f
 s1=lst+lgap/2;eTop=lst+lsweep-lgap/2
 m['level']={'cx':lcx,'cy':lcy,'r':round(lR,3),'o':round(lo,3),'sweep':round(lsweep,4),'gap':round(lgap,4),'start':round(lst,4),'span':round(LL,4),
  'ind':lv_img('lv_ind','#BAC3FF',lv_arc(180-LL,180)),'trk':lv_img('lv_trk',SUR,lv_arc(180,180+LL)),
  'indDis':lv_img('lv_ind_dis','#5D5A61',lv_arc(180-LL,180)),'trkDis':lv_img('lv_trk_dis','#1E1C1F',lv_arc(180,180+LL)),
  'maskLow':lv_img('lv_mask_low','#000000',lv_mask(s1-LL-2,s1,s1)),'maskHigh':lv_img('lv_mask_high','#000000',lv_mask(eTop,eTop+LL+2,eTop))}
 m['pager']={}
 for vertical in (False,True):
  for n in (3,6):
   radius=W/2-px(8);cx=W/2 if not vertical or d['shape']=='circle' else W-radius-px(8);cy=H/2 if vertical or d['shape']=='circle' else H-radius-px(8)
   anchor=0 if vertical else 90;half=math.degrees(px(10)*(n-1)/2/radius);im,dr=canvas(W,H)
   arc(dr,cx,cy,radius+px(6),anchor-half,half*2,(0,0,0,217),px(12))
   box=im.getbbox();box=(math.floor(box[0]/S),math.floor(box[1]/S),math.ceil(box[2]/S),math.ceil(box[3]/S));im=im.crop(tuple(v*S for v in box));src=save(im,'pager_'+('v' if vertical else 'h')+str(n),box[2]-box[0],box[3]-box[1])
   m['pager'][('v' if vertical else 'h')+str(n)]={'x':box[0],'y':box[1],'w':box[2]-box[0],'h':box[3]-box[1],'cx':cx,'cy':cy,'radius':radius,'src':src}
 allmeta[ident]=m
json.dump(allmeta,open(ROOT+'/assets/animations.json','w',encoding='utf8'),indent=1)
print('UI assets generated:',','.join(DEV))
