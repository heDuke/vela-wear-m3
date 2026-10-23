// Shared runtime helpers (device group: $[id], $[W]x$[H], k=$[k] px/dp).
// Pure functions only — nothing here is bound to a page ViewModel (memory best practice, SPEC §9.2).
export const DEV = { id: '$[id]', W: $[W], H: $[H], k: $[k], shape: '$[shape]' }

// TransformingLazyColumn (lazy/ResponsiveTransformationSpec.kt + TransitionAreaProgress.kt),
// interpolated between the 192dp and 240dp specs by screen height in dp. Same maths as preview/v3/src/geom.js.
const HDP = $[Hdp]
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const inv = (a, b, v) => clamp01((v - a) / (b - a))
const SP = (function () {
  const S = [0.2, 0.6, 0.35, 0.55, 0.7, 0.5], L = [0.15, 0.45, 0.4, 0.6, 0.6, 0.5], p = inv(192, 240, HDP)
  return S.map((v, i) => lerp(v, L[i], p))
})()
const EASE_LUT=$[tlcEaseLut()]
const STYLE_CACHE={}
function ease(t) {const x=clamp01(t)*256,i=Math.floor(x);return i===256?1:lerp(EASE_LUT[i],EASE_LUT[i+1],x-i)}
// top/bottom: item edges in px relative to the viewport top. Returns [scale, alpha].
export function tlc(top, bottom) {
  const H = $[H], t = top / H, b = bottom / H, rel = b - t
  const sr = inv(SP[0], SP[1], rel)
  const line = Math.min(lerp(SP[2], SP[3], sr), (1 + rel) / 2)
  let enc
  if (b < 1 - t) enc = Math.min(b / line - 1, 0)
  else enc = Math.max(1 - (1 - t) / line, 0)
  if (enc === 0) return [1, 1]
  const e = ease(clamp01(enc < 0 ? enc + 1 : 1 - enc))
  return [lerp(SP[4], 1, e), lerp(SP[5], 1, e)]
}
export function tlcStyle(top, bottom) {
  const r = tlc(top, bottom)
  const s = Math.round(r[0] * 100) / 100
  const alpha=Math.round(r[1]*100)/100,key=s+':'+alpha
  return STYLE_CACHE[key]||(STYLE_CACHE[key]={transform:JSON.stringify({scaleX:s,scaleY:s}),opacity:alpha})
}
export const IDENT = { transform: JSON.stringify({ scaleX: 1, scaleY: 1 }), opacity: 1 }

// ScrollIndicator thumb placement; SI = per-page constants (thumb length differs per page), pos 0..1
export function siStyle(SI, pos, fraction = 0.3) {
  pos = clamp01(pos)
  const tl = SI.L * fraction
  if (SI.round) {
    const along = -SI.L / 2 + tl / 2 + (SI.L - tl) * pos
    const deg = Math.round((along / SI.Ra) * 18000 / Math.PI) / 100
    return { transform: JSON.stringify({ rotate: deg + 'deg' }) }
  }
  return { top: Math.round(SI.y0 + (SI.L - tl) * pos) + 'px', height: Math.round(tl) + 'px' }
}

export function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

export function scrollFraction(viewport, content) {
  return Math.max(0.3, Math.min(0.7, viewport / Math.max(viewport, content)))
}
// Port of pinned PageIndicator.PagesState, including its extra zero-size window sentinel.
const PAGER=$[pagerJs()]
export function pagerState(current,count,offset=0,vertical=false,hidden=0){
 const n=Math.min(6,count),position=Math.max(0,Math.min(count-1,current+offset));current=Math.floor(position);offset=position-current
 if(current>hidden+n-2)hidden=Math.min(current-(n-2),count-n)
 else if(position<=hidden)hidden=Math.max(current-1,0)
 hidden=Math.max(0,hidden)
 const right=position>hidden+n-2&&position<count-2,left=position>1&&position<hidden+1,smooth=left||right?offset:0
 const sizes=[],alpha=[],spaces=[]
 for(let i=0;i<n+1;i++){
  alpha[i]=i===0?1-smooth:i===n?smooth:1
  if(i===0)sizes[i]=(hidden===0||hidden===1&&left?1:.66)*(1-smooth)
  else if(i===1)sizes[i]=1-.34*smooth
  else if(i===n-1)sizes[i]=right||left?.66+.34*smooth:hidden<count-n?.66:1
  else if(i===n)sizes[i]=(hidden===count-n-1&&right||hidden===count-n&&left?1:.66)*smooth
  else sizes[i]=1
 }
 for(let i=0;i<n+2;i++)spaces[i]=i===0?1-smooth:i===n+1?smooth:1
 const selected=Math.max(0,left?1:current-hidden),prev=inv(.9,.6,offset),next=inv(.1,.4,offset)
 sizes[selected]*=1-prev;sizes[selected+1]*=1-next;alpha[selected]*=inv(0,.5,sizes[selected]);alpha[selected+1]*=inv(0,.5,sizes[selected+1])
 spaces[selected]=1-prev/3;spaces[selected+1]=1+next/3+prev/3;spaces[selected+2]=1-next/3
 const box=PAGER[(vertical?'v':'h')+(n<=3?3:6)],spacing=$[dp(10)],dot=$[dp(6)],direction=vertical?1:-1,anchor=vertical?0:Math.PI/2,start=anchor-direction*spacing*(n-1)/2/box.radius
 function point(distance,size,opacity){const angle=start+direction*distance/box.radius;return {left:Math.round(box.cx+box.radius*Math.cos(angle)-box.x-size/2)+'px',top:Math.round(box.cy+box.radius*Math.sin(angle)-box.y-size/2)+'px',width:size+'px',height:size+'px',borderRadius:size/2+'px',opacity}}
 const dots=[],worm=[];let distance=-spacing
 for(let i=0;i<n+1;i++){
  if(i===selected){const tail=Math.max(0,offset*2-1),head=Math.max(0,1-offset*2),length=Math.max(.01,1-tail-head)*spacing;const begin=distance+spacing+tail*spacing;const steps=Math.ceil(length/Math.max(1,dot/3));for(let j=0;j<=steps;j++)worm.push({id:j,st:point(begin+length*j/steps,dot,1)})}
  distance+=spacing*spaces[i];dots.push({id:i,st:point(distance,dot*sizes[i],alpha[i]*.3)})
 }
 return {dots,worm,hidden,src:box.src,style:{left:box.x+'px',top:box.y+'px',width:box.w+'px',height:box.h+'px'}}
}
export function pageDots(current,count,vertical=false){return pagerState(current,count,0,vertical).dots}
export function progressImage(images, value) {
  const v=Math.max(0,Math.min(100,value));return images[v<5?Math.round(v):4+Math.round(v/5)]
}

const FONT=$[fontJs()]
export function timeGlyphs(time,status=false,width=DEV.W){
 const base=width/2-$[dp(2)],radius=base-FONT.ascent,limit=radius*70*Math.PI/180
 const measure=text=>Array.from(text).reduce((n,ch)=>n+FONT.adv[ch]+$[dp(.6)],0)
 let label=status?'同步':''
 while(label&&measure(label)+measure('·')+$[dp(8)]+measure(time)>limit)label=label.slice(0,-1)
 const prefix=label?label+'·':''
 const chars=Array.from(prefix+time),adv=chars.map(ch=>FONT.adv[ch]+$[dp(.6)])
 if(label){const dot=prefix.indexOf('·');adv[dot]+=$[dp(8)]}
 let x=-adv.reduce((a,b)=>a+b,0)/2
 return chars.map((ch,i)=>{const a=adv[i],angle=(x+a/2)/Math.max(1,radius)*180/Math.PI;x+=a;const w=Math.ceil(FONT.adv[ch])+4;return {id:i,src:FONT.glyphs[ch],st:{left:Math.round(width/2-w/2)+'px',top:'$[dp(2)]px',width:w+'px',height:(FONT.ascent+FONT.descent)+'px',transform:JSON.stringify({rotate:angle+'deg'}),transformOrigin:w/2+'px '+base+'px'}}})
}
