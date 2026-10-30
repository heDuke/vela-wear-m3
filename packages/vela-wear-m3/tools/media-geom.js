// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Frozen Wear OS Material 3 media spec (google/horologist@cdf245ceee02549a16d2da519a55e1e4d96777c3,
// media/ui-material3 + androidx 2f557dc1 ButtonGroup/MotionScheme). Shared by asset generation, templates and checks.
// Tags: [src] Kotlin constant, [derived] computed from source formulas, [adapt] Vela / non-round adaptation.
const SPEC={
 button:80,              // [src] Constants.kt middle button (large screen); 64 on small screens
 icon:32,                // [src] IconButtonDefaults.LargeIconSize (play/pause, next/previous)
 seekIcon:24,            // [src] Material Icons Replay/Forward N, golden podcast_5_30.png
 innerScallop:{n:10,ratio:.82,R:20,rounding:8,size:64},   // [src] AnimatedPlayPauseButton: pillStar 10/0.82, 8dp, 80-2*8
 outerScallop:{n:10,ratio:.8,R:20,rounding:12,size:76},   // [src] RotatingWavyProgressIndicator: 10/0.8, 12dp, 80-4
 stroke:4,               // [src] progress stroke, round caps
 gapFraction:.006,       // [src] gap = 0.006 * perimeter + stroke
 rotationDegPerSec:12,   // [src] rotationProgress 0 -> -0.1 every 3000 ms (opt-in here)
 expansion:12,           // [src] ButtonGroup ExpansionWidth
 pressStiffness:5600,    // [src] fastSpatialSpec().faster(100%) = 1400*4, damping 1
 releaseStiffness:260,   // [src] slowSpatialSpec, damping 1
 sidePad:{outer:.071,inner:.03,vert:.052},  // [src] ButtonGroupLayout (fraction of screen height, large)
 info:{titleH:20,subH:18,titleW:.6672,subW:.71,title:16,sub:14,edge:8},  // [src] TextMediaDisplay
 marquee:{speed:64,pause:4000,gap:96,edge:8},  // [src] MarqueeText defaults
 loadingBars:[[40,12],[80,10]],                // [src] LoadingMediaDisplay
 colors:{button:'primary',icon:'onPrimary',side:'primaryDim',ring:'onSecondaryContainer',track:'surfaceContainerLow',
  disabledContainer:['onSurface',.16],disabledContent:['onSurface',.38],nothing:'onSurfaceVariant',placeholder:'outlineVariant'},
 // [src] DisabledContainerAlpha = 0.16 (golden player_notconnected #282629 over black); P1 used 0.12.
 circleRing:38,          // [src] paused: Morph(pill, circlePolygon = pillPolygon(80-4, 80-4)) -> circle centre line r = 38dp
};
// RoundedPolygon.star with circular corner rounding (smoothing 0), cut clamped to half edge (plan render/geom.js).
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,k)=>[a[0]*k,a[1]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],len=a=>Math.hypot(a[0],a[1]),norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l]};
// Returns the closed outline (no duplicate end point) starting exactly at the trough at 12 o'clock, clockwise (y down).
function scallop(n,ratio,R,rounding,size,N=48){
 const start=-Math.PI/2-Math.PI/n,V=[];
 for(let i=0;i<2*n;i++){const a=start+i*Math.PI/n,r=i%2?R*ratio:R;V.push([r*Math.cos(a),r*Math.sin(a)])}
 const arcs=[];
 for(let i=0;i<V.length;i++){
  const v=V[i],p=V[(i-1+V.length)%V.length],q=V[(i+1)%V.length];
  const u1=norm(sub(p,v)),u2=norm(sub(q,v)),th=Math.acos(Math.max(-1,Math.min(1,dot(u1,u2))));
  let d=rounding/Math.tan(th/2);const mx=Math.min(len(sub(p,v)),len(sub(q,v)))/2;if(d>mx)d=mx;const rr=d*Math.tan(th/2);
  const t1=add(v,mul(u1,d)),t2=add(v,mul(u2,d)),c=add(v,mul(norm(add(u1,u2)),rr/Math.sin(th/2)));
  let a1=Math.atan2(t1[1]-c[1],t1[0]-c[0]),a2=Math.atan2(t2[1]-c[1],t2[0]-c[0]),da=a2-a1;
  while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  const pts=[];for(let k=0;k<=N;k++){const a=a1+da*k/N;pts.push([c[0]+rr*Math.cos(a),c[1]+rr*Math.sin(a)])}arcs.push(pts);
 }
 // vertex 1 is the inner vertex at -90deg: start at the middle of its rounding arc
 let pts=[...arcs[1].slice(N/2)];for(let i=2;i<arcs.length;i++)pts.push(...arcs[i]);pts.push(...arcs[0],...arcs[1].slice(0,N/2));
 // RoundedPolygon.normalized(): scale so the LARGER bounding dimension equals `size`, centred on both axes.
 // For 10 lobes with a trough at 12 o'clock the troughs sit at top/bottom and peaks at 3/9 o'clock, so the
 // width (peak to peak) is the larger side: golden player_default.png measures 63x61 dp button, 80 dp ring outer.
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
 const s=size/Math.max(x1-x0,y1-y0),cx=(x0+x1)/2,cy=(y0+y1)/2;return pts.map(p=>[(p[0]-cx)*s,(p[1]-cy)*s]);
}
function cum(pts){const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+len(sub(pts[i],pts[i-1])));return L}
function closed(pts){return pts.concat([pts[0]])}
function seg(pts,L,s0,s1){const out=[];if(s1<=s0)return out;for(let i=1;i<pts.length;i++){if(L[i]<s0)continue;if(L[i-1]>s1)break;
 const a=Math.max(s0,L[i-1]),b=Math.min(s1,L[i]);const f=x=>{const t=(x-L[i-1])/(L[i]-L[i-1]||1);return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]};
 if(!out.length)out.push(f(a));out.push(f(b))}return out}
function button(){const o=SPEC.innerScallop;return scallop(o.n,o.ratio,o.R,o.rounding,o.size)}
// Parallel offset of a closed clockwise (y-down) outline by d (outward > 0). Normals from central differences of the
// dense arc samples; valid while d < the smallest concave corner radius (8dp*scale ≈ 12.8dp here, d = 6dp).
function offset(pts,d){const n=pts.length;return pts.map((p,i)=>{const a=pts[(i-1+n)%n],b=pts[(i+1)%n],t=norm(sub(b,a));return [p[0]+t[1]*d,p[1]-t[0]*d]})}
// [adapt] Ring centre line = the button scallop offset outward by (76-64)/2 = 6dp: same polygon, centre, lobe count and
// phase, so the black gap to the button is uniform (6 - stroke/2 = 4dp) all the way round. Horologist draws the ring
// from its own pillStar (10/0.8, 12dp, 76dp), whose gap to the button swings 2.8-4.0dp; outerScallop is kept as reference.
function ringOffset(){return (SPEC.outerScallop.size-SPEC.innerScallop.size)/2}
function ring(){const p=closed(offset(button(),ringOffset())),L=cum(p),T=L[L.length-1];return {pts:p,L,T,gap:T*SPEC.gapFraction+SPEC.stroke}}
// Paused ring (circlePolygon): circle of radius 38dp from 12 o'clock clockwise; same gap rule.
function circleRing(N=720){const r=SPEC.circleRing,p=[];for(let i=0;i<=N;i++){const a=-Math.PI/2+2*Math.PI*i/N;p.push([r*Math.cos(a),r*Math.sin(a)])}const L=cum(p),T=L[L.length-1];return {pts:p,L,T,gap:T*SPEC.gapFraction+SPEC.stroke}}
// Wavy progress ring (PLAN §4.1, revised): ONE continuous track image (md_ring_t) drawn under ten indicator overlays.
// The outline is split into 10 equal trough-to-trough lobes; overlay images are drawn in place (never rotated, so
// they stay in phase with the scallop and leave no seams). For quantised progress p=q/steps the boundary position in
// lobe units is b = q*10/steps - k:  b<=0 -> no overlay;  0<b<1 -> Pj (indicator to j/4 of the lobe, j=4b);
// b>=1 -> I (indicator to the lobe end; lobe 9 ends with a cap at the start gap = 100 %).
// Indicator and track share the same stroke width. Every overlay except lobe 9's I ends with: indicator round cap at p*T-gap/2, a background-coloured eraser over the
// track up to p*T+gap/2 and a track-coloured round cap there (the official indicator/track gap). Overlays of lobe
// k>=1 start gap/2 (+overlap) before the lobe so they repaint the previous lobe's eraser; images are stacked k=0..9.
// q=0: Z = the official minimum indicator segment (gap/2 .. gap/2+0.1px, round caps = a 4dp dot) with the track
// starting at 1.5*gap (RotatingWavyProgressIndicator getSegment max(...)).
function lobeState(k,q,steps){
 if(q===0&&k===0)return 'md_r0_Z';
 const n=q*10-k*steps;if(n<=0)return '';if(n>=steps)return 'md_r'+k+'_I';return 'md_r'+k+'_P'+Math.round(n*4/steps);
}
function lobeNames(steps){const set=new Set();for(let q=0;q<=steps;q++)for(let k=0;k<10;k++){const n=lobeState(k,q,steps);if(n)set.add(n)}return [...set].sort()}
// arc-length layout of one overlay: {ind:[a,b], capStart, capEnd, erase:[a,b]|null, trackCap:s|null}
function lobeSegments(name,T,gap){
 const [,ks,st]=name.match(/^md_[rc](\d)_(\w+)$/),k=+ks,Lb=T/10,h=gap/2,ov=2;
 if(st==='Z')return {ind:[h,h],capStart:true,capEnd:false,erase:[h,1.5*gap],trackCap:1.5*gap};
 const a=k===0?h:k*Lb-h-ov,p=k*Lb+(st==='I'?4:+st.slice(1))/4*Lb;
 if(k===9&&st==='I')return {ind:[a,T-h],capStart:false,capEnd:true,erase:null,trackCap:null};
 return {ind:[a,p-h],capStart:k===0,capEnd:true,erase:[p-h,p+h],trackCap:p+h};
}
// Critically damped spring progress, and a cubic-bezier fitted to it over a duration (Vela has no spring easing). [derived]
const crit=(k,ms)=>{const w=Math.sqrt(k),s=ms/1000;return 1-(1+w*s)*Math.exp(-w*s)};
function bezierY(x1,y1,x2,y2,x){let lo=0,hi=1,t=x;for(let i=0;i<30;i++){t=(lo+hi)/2;const a=1-t,px=3*a*a*t*x1+3*a*t*t*x2+t*t*t;if(px<x)lo=t;else hi=t}const a=1-t;return 3*a*a*t*y1+3*a*t*t*y2+t*t*t}
function fitSpring(k,ms){let best=null;for(let x1=0;x1<=.6;x1+=.02)for(let x2=0;x2<=.6;x2+=.02){let e=0;for(let i=1;i<20;i++){const x=i/20;e=Math.max(e,Math.abs(bezierY(x1,0,x2,1,x)-crit(k,x*ms)/crit(k,ms)))}if(!best||e<best.e)best={x1:+x1.toFixed(2),x2:+x2.toFixed(2),e:+e.toFixed(4)}}return best}
// Device layout (dp) — PLAN §5. Horizontal ButtonGroup on round/pro, vertical stack on pill (band).
function layout(d){
 const k=d.k,W=d.W/k,H=d.H/k,pill=d.shape==='pill',rect=d.shape==='rect',HP=Math.ceil(W*.052),CW=W-2*HP;
 const B=SPEC.button;
 if(!pill){
  const mid=Math.max(B,H/3),side=(W-B)/2;
  const pad=rect?{outer:6,inner:4,vert:13}:{outer:Math.ceil(H*SPEC.sidePad.outer),inner:Math.ceil(H*SPEC.sidePad.inner),vert:Math.ceil(H*SPEC.sidePad.vert)};
  const topH=Math.max(68,(H-mid)/2),infoBottom=topH-6;
  return {W,H,HP,CW,vertical:false,midH:mid,side,pad,pillW:side-pad.outer-pad.inner,pillH:mid-2*pad.vert,topH,
   info:{top:infoBottom-38,titleW:rect?CW:W*SPEC.info.titleW,subW:rect?CW:W*SPEC.info.subW,title:16,sub:14},
   playCY:topH+mid/2};
 }
 const band9=W<125,info=band9?40:44,play=band9?88:94,row=band9?176:184,rowH=band9?48:52,gap=8;
 return {W,H,HP,CW,vertical:true,pad:{gap},info:{top:info,titleW:CW,subW:CW,title:15,sub:13},playTop:play,rowTop:row,rowH,pillW:(CW-gap)/2,playCY:play+B/2};
}
// Paused circle ring overlays: the circle is rotation invariant, so lobes 1..8 (and lobe 9 before its end) reuse lobe 1
// rotated by 36*(k-1) deg about the ring centre; lobe 0 (start cap / Z dot) and lobe 9 'I' (end cap at 100 %) are own images.
function circleNames(steps){const set=new Set();for(const n of lobeNames(steps)){const [,k,st]=n.match(/^md_r(\d)_(\w+)$/);set.add(k==='0'?'md_c0_'+st:k==='9'&&st==='I'?'md_c9_I':'md_c1_'+st)}return [...set].sort()}
module.exports={SPEC,scallop,offset,ringOffset,cum,seg,closed,ring,circleRing,button,lobeState,lobeNames,lobeSegments,circleNames,crit,fitSpring,bezierY,layout};
// Horologist LottiePlaceholders.kt static frames (24-unit viewport, Apache-2.0): pause / play / next (previous = mirrored).
const ICON_PATHS={
 pause:'M7.68 4.416h-.008a2.16 2.16 0 0 0-2.16 2.16v10.8a2.16 2.16 0 0 0 2.16 2.16h.008a2.16 2.16 0 0 0 2.16-2.16v-10.8a2.16 2.16 0 0 0-2.16-2.16zM16.328 4.416h-.008a2.16 2.16 0 0 0-2.16 2.16v10.8a2.16 2.16 0 0 0 2.16 2.16h.008a2.16 2.16 0 0 0 2.16-2.16v-10.8a2.16 2.16 0 0 0-2.16-2.16z',
 play:'M18.072 13.04l-8.336 5.272c-1.376.816-2.104.176-2.088-.768V6.24c0-1.272.68-1.632 1.84-1.008c.16.064 1.76 1.096 3.568 2.216l4.984 3.112c1.152.792 1.184 1.664.032 2.496v-.016z',
 next:'M7.28 16.224a.73.73 0 0 1-.384-.104a.77.77 0 0 1-.392-.68V8.56c0-.28.152-.544.392-.68c.248-.136.544-.136.784.008l5.736 3.44c.232.144.376.392.376.672s-.144.528-.376.672l-5.736 3.44c-.12.072-.264.112-.4.112zm.776-6.288v4.128L11.496 12l-3.44-2.064zM15.6 15.8V8.2a.64.64 0 0 1 .64-.64h.32a.64.64 0 0 1 .64.64v7.6a.64.64 0 0 1-.64.64h-.32a.64.64 0 0 1-.64-.64z'};
module.exports.ICON_PATHS=ICON_PATHS;
// side-key kinds -> [icon file stem, Kotlin component, seek seconds]
module.exports.SIDE={prev:['md_prev_32','SeekToPreviousButton',0],next:['md_next_32','SeekToNextButton',0],
 back5:['md_back5_24','SeekBackButton',-5],back10:['md_back10_24','SeekBackButton',-10],back30:['md_back30_24','SeekBackButton',-30],
 fwd5:['md_fwd5_24','SeekForwardButton',5],fwd10:['md_fwd10_24','SeekForwardButton',10],fwd30:['md_fwd30_24','SeekForwardButton',30]};
