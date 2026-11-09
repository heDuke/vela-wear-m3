// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Public: mdSetPlaying(b) mdSetProgress(f 0..1) mdSetLoading(b) mdSetEnabled({play,prev,next}) mdSetMeta(title,artist)
// mdSetInfo('ready'|'loading'|'none'[,text]) mdShow() mdHide(); settings row: mdSetOutput('headphones'|'watch'|'none')
// mdSetVolume(v 0..1[,show]) mdSetSettingsEnabled(b); volume level: mdShowVolume([v]) mdLvHide(); whole screen:
// mdSetState('playing'|'paused'|'loading'|'none'|'disconnected'). Emits (if defined on the page): mdOnPlay() mdOnPause()
// mdOnPrev() mdOnNext() mdOnSeek(seconds) mdOnOutput() mdOnMore(). Template handlers: mdPlayDown/mdPrevDown/
// mdNextDown/mdUp/mdCancel, md*Tap.
mdSetPlaying(b){mdS.playing=!!b;this.mdPaint()},
mdSetLoading(b){mdS.loading=!!b;this.mdLoading=mdS.loading;this.mdPaint()},
mdSetEnabled(o){if(!o)return;['play','prev','next'].forEach(k=>{if(k in o)mdS[k+'On']=!!o[k]});if(mdS.press&&!mdS[mdS.press+'On'])this.mdRelease(true);this.mdPaint()},
mdSetProgress(f){f=+f;if(!(f>=0))f=0;if(f>1)f=1;mdS.f=f
 // [perf] mdPct only feeds the circle ring's <progress>; the wavy ring repaints when its end moves by a pixel
 if(MDC.ring==='circle'){const pct=Math.round(f*100);if(this.mdPct!==pct)this.mdPct=pct}
 if(!MDC.rw)return;const R=mdS.circ?MDC.rc:MDC.rw;if(Math.round(f*R.T*R.k)===mdS.q)return;this.mdRingPaint()},
// playing: wavy ring around the scallop; paused: circle ring around the circle (RotatingWavyProgressIndicator morph
// target circlePolygon), switched instantly like the official cached Morph. Continuous (P5): indicator from gap/2 to
// e = max(fT - gap/2, gap/2 + 0.1), track from t = max(fT + gap/2, 1.5 gap) to T - gap/2 (getSegment). Whole quarter
// segments up to e, discs every <= 2px from the last one to e (+ a start cap), the gap a black bar e..t under a track disc.
mdRingPaint(){if(!MDC.rw)return;const c=!!mdS.circ,R=c?MDC.rc:MDC.rw,X=c?'mdC':'mdW',T=R.T,h=R.g/2,f=mdS.f,r=MDC.sw/2
 mdS.q=Math.round(f*T*R.k);const at=(s,d)=>{const p=mdRingPos(R,s);return {left:Math.round(p[0]-d/2)+'px',top:Math.round(p[1]-d/2)+'px',opacity:1}}
 // ring switch: other ring's segments off, start cap disc at gap/2
 if(mdS.rc!==c){mdS.rc=c;this.mdRtSrc=c?MDC.ct:MDC.rt;const Y=c?'mdW':'mdC';for(let i=0;i<40;i++){if(this[Y+i]!=='md-fo')this[Y+i]='md-fo';if(this[X+i]!=='md-fo')this[X+i]='md-fo'}
  mdS.sn=0;this.mdSd=at(h,MDC.dot)}
 // [perf] JerryScript is slow: touch only the segments whose state changed, compare styles field by field
 const e=Math.max(f*T-h,h+.1),t=Math.max(f*T+h,1.5*R.g),Q=T/40,n=Math.min(39,Math.floor(e/Q+1e-9))+(e>=T-h?1:0)
 for(let i=Math.min(n,mdS.sn),m=Math.max(n,mdS.sn);i<m;i++)this[X+i]=i<n?'md-fi':'md-fo';mdS.sn=n
 const b=n===40?T-h:n?n*Q:h,rot=(p,q)=>{const dx=q[0]-p[0],dy=q[1]-p[1];return [Math.hypot(dx,dy),JSON.stringify({rotate:(Math.atan2(dy,dx)*180/Math.PI).toFixed(1)+'deg'})]}
 // tail b..e: one rounded indicator bar along the chord (its round end is the indicator's end cap)
 const pb=mdRingPos(R,b),pe=mdRingPos(R,e),tb=rot(pb,pe)
 this.mdSt('mdTb',{left:Math.round(pb[0]-r)+'px',top:Math.round(pb[1]-r)+'px',width:Math.round(tb[0]+2*r)+'px',opacity:1,transform:tb[1]})
 // gap e..t: black bar, then the track's start cap disc at t (no track left: erase to past its end cap)
 const noTr=t>=T-h,p1=mdRingPos(R,noTr?Math.min(T-h+R.sr,T):t),er=rot(pe,p1)
 this.mdSt('mdEr',{left:Math.round(pe[0])+'px',top:Math.round(pe[1]-MDC.eh/2)+'px',width:Math.ceil(er[0])+'px',opacity:1,transform:er[1]})
 this.mdSt('mdTc',noTr?{opacity:0}:at(t,MDC.dot))},
mdSt(k,o){const v=this[k];if(v&&v.left===o.left&&v.top===o.top&&v.width===o.width&&v.opacity===o.opacity&&v.transform===o.transform)return;this[k]=o},
// Press morph (enhanced, playing): shapeMorphProgress spring 1 (scallop) -> 0 (pill / circle) at fastSpatial.faster(100)
// (k 5600) on press and back at slowSpatial (k 260) on release, critically damped like the width transitions;
// painted as the pill (round(4m) = 0), the pre-rendered Morph frames (1..3) or the scallop (4).
mdMfAt(now){const w=Math.sqrt(mdMf.k),t=(now-mdMf.t0)/1000,A=mdMf.m0-mdMf.tgt,B=mdMf.v0+w*A,e=Math.exp(-w*t)
 mdMf.m=mdMf.tgt+(A+B*t)*e;mdMf.v=(B-w*(A+B*t))*e;if(Math.abs(mdMf.m-mdMf.tgt)<.01&&Math.abs(mdMf.v)<1){mdMf.m=mdMf.tgt;mdMf.v=0;return true}return false},
mdMfTo(tgt,k,snap){const now=Date.now();if(mdMf.t){clearTimeout(mdMf.t);mdMf.t=null;this.mdMfAt(now)}
 if(snap){mdMf.m=tgt;mdMf.v=0}mdMf.m0=mdMf.m;mdMf.v0=mdMf.v;mdMf.tgt=tgt;mdMf.k=k;mdMf.t0=now
 const step=()=>{const done=snap||this.mdMfAt(Date.now());mdMf.t=done?null:setTimeout(step,16);const q=Math.round(mdMf.m*4);if(q!==mdMf.q){mdMf.q=q;this.mdPaint()}};step()},
// visual state: shape (scallop while playing, circle while paused, pill while pressed), ring, icon and side colours
mdPaint(){
 this.mdPaintSet()
 if(!MDC.ic)return this.mdPaintSides()
 const p=mdS.press,pillShape=p==='play'||(!!p&&!MDC.vertical)||mdS.rel,mq=MDC.mf&&mdS.playing?mdMf.q:-1
 const solid=mq>=0?mq===0:pillShape||(p&&MDC.vertical)||MDC.shape==='round'||!mdS.playing
 const pc=solid?(mdS.playOn?'md-pon':'md-pdis'):'md-poff';if(this.mdPillCls!==pc)this.mdPillCls=pc
 const so=solid||(mq>0&&mq<4)?0:1;if(this.mdScSt.opacity!==so)this.mdScSt={opacity:so}
 if(MDC.mf)this.mdLotShow('M',mq>0&&mq<4?mdMf.seq+mq:0)
 const ss=mdS.playOn?MDC.sc:MDC.scD;if(this.mdScSrc!==ss)this.mdScSrc=ss
 if(MDC.rotate){const sc=mdS.playing&&!p&&!mdS.loading?'md-spin':'';if(this.mdScCls!==sc)this.mdScCls=sc}
 // the progress ring has no enabled state: full colours even when the button is disabled (golden notconnected)
 const ro=pillShape||mdS.loading?0:1;if(this.mdRingSt.opacity!==ro)this.mdRingSt={opacity:ro}
 const circ=!mdS.playing;if(mdS.circ!==circ){mdS.circ=circ;this.mdRingPaint()}
 const ic=mdS.playing?(mdS.playOn?MDC.ic.pause:MDC.ic.pauseD):(mdS.playOn?MDC.ic.play:MDC.ic.playD);if(this.mdIcon!==ic)this.mdIcon=ic
 if(MDC.pp)this.mdPpTo()
 this.mdPaintSides()
},
mdPaintSides(){if(!MDC.l)return;const lc=mdS.prevOn?'md-son':'md-sdis',rc=mdS.nextOn?'md-son':'md-sdis'
 if(this.mdLCls!==lc)this.mdLCls=lc;if(this.mdRCls!==rc)this.mdRCls=rc
 const li=mdS.prevOn?MDC.l.ic:MDC.l.icD,ri=mdS.nextOn?MDC.r.ic:MDC.r.icD;if(this.mdLIcon!==li)this.mdLIcon=li;if(this.mdRIcon!==ri)this.mdRIcon=ri
 if(MDC.l.lot)this.mdLotShow('L',mdS.prevOn?mdLot.l:0);if(MDC.r.lot)this.mdLotShow('R',mdS.nextOn?mdLot.r:0)},
// AnimatedPlayPauseButtonContent (enhanced): Lottie progress 1 (play) <-> 0 (pause) at speed +-10 = 167 ms end to end,
// from wherever it is (a reversal mid-way turns back). Frames: 1 pause, 2..6 Lottie 17..83, 7 play; wall-clock indexed.
// Disabled, loading, hidden or the first paint snap to the end (the static icon, which also carries the disabled colour).
mdPpTo(){const tgt=mdS.playing?1:7
 if(!mdPp.pos||!mdS.playOn||mdS.loading||!mdVisible){if(mdPp.t)clearTimeout(mdPp.t);mdPp.t=null;mdPp.pos=mdPp.tgt=tgt;this.mdLotShow('P',0);return}
 if(mdPp.tgt===tgt)return;mdPp.tgt=tgt;if(mdPp.t)clearTimeout(mdPp.t)
 const p0=mdPp.pos,t0=Date.now(),dir=tgt>p0?1:-1,step=()=>{const p=p0+dir*(Date.now()-t0)*6/167,done=dir>0?p>=tgt:p<=tgt
  mdPp.pos=done?tgt:p;mdPp.t=done?null:setTimeout(step,28);this.mdLotShow('P',done?0:Math.round(p))};step()},
// pre-mounted Lottie frames: show frame f (1..9) over a hidden static icon, 0 = static icon; two class writes per step.
// Always swap md-fo <-> md-fi: Vela keeps the old opacity when a class is only removed.
mdLotShow(S,f){const k=S,was=mdLot.s[k]||0;if(was===f)return;if(was)this['md'+S+'L'+was]='md-fo';if(f)this['md'+S+'L'+f]='md-fi'
 const st=f?'md-fo':'md-fi';if(this['md'+S+'S']!==st)this['md'+S+'S']=st;mdLot.s[k]=f},
// ButtonGroup press expansion: pressed key +12dp, neighbours -12dp (middle pressed: sides -6dp each); width transition
// .md-tin = fastSpatial (k 5600) / .md-tout = slowSpatial (k 260) fitted cubic-beziers. Radius follows min(w,h)/2.
mdWidths(id,grow){if(!MDC.w)return;const w=MDC.w[id||''],r=v=>Math.floor(Math.min(v,MDC.ph)/2)
 const side=(slot,cur)=>{const old=parseInt(cur.width),nr=w[slot]<old&&!grow?r(w[slot]):Math.min(r(w[slot]),r(old));return {width:w[slot]+'px',borderRadius:nr+'px'}}
 this.mdPut('mdLSt',side(0,this.mdLSt));this.mdPut('mdRSt',side(2,this.mdRSt));if(!MDC.vertical)this.mdPut('mdMSt',{width:w[1]+'px'})},
mdPress(id){
 if(mdRelTimer){clearTimeout(mdRelTimer);mdRelTimer=null}
 mdS.press=id;mdS.rel=false;this.mdTr='md-tin';this.mdWidths(id,true)
 if(MDC.pw)this.mdPut('mdPillSt',{width:(id==='play'?MDC.pw.play:MDC.vertical?MDC.pw['']:MDC.pw.side)+'px'})
 // the spring runs while paused too: a release that starts playback morphs pill -> scallop
 if(MDC.mf){mdMf.seq=MDC.vertical||id==='play'?0:3;this.mdMfTo(0,5600)}
 this.mdPaint()},
mdRelease(now){
 if(!mdS.press)return;const was=mdS.press;mdS.press='';mdS.rel=!MDC.vertical||was==='play';this.mdTr='md-tout';this.mdWidths('',false)
 if(MDC.pw)this.mdPut('mdPillSt',{width:MDC.pw['']+'px'})
 if(MDC.mf)this.mdMfTo(1,260,now)
 const done=()=>{mdRelTimer=null;mdS.rel=false;if(MDC.w)this.mdWidths('',false);this.mdPaint()}
 if(mdRelTimer)clearTimeout(mdRelTimer);if(now){done();return}mdRelTimer=setTimeout(done,450);this.mdPaint()},
mdPlayDown(){if(mdS.playOn&&!mdS.loading)this.mdPress('play')},
mdPrevDown(){if(mdS.prevOn&&MDC.l)this.mdPress('prev')},
mdNextDown(){if(mdS.nextOn&&MDC.r)this.mdPress('next')},
// the Lottie starts on release (Compose click = pointer up); Vela's onclick arrives ~250 ms after touchend
mdUp(){const was=mdS.press;this.mdRelease(false);if(was==='prev'||was==='next')this.mdLotRun(was==='prev'?'l':'r')},
mdCancel(){this.mdRelease(false)},
mdPlayTap(){if(!mdS.playOn||mdS.loading)return;if(mdS.playing){if(this.mdOnPause)this.mdOnPause()}else if(this.mdOnPlay)this.mdOnPlay()},
// AnimatedMediaButton: each click restarts lottieAnimatable.animate() from frame 0 (500 ms); here 9 frames x 50 ms,
// indexed by wall clock so a busy JS thread skips frames instead of stretching the animation
mdLotRun(k){const s=k==='l'?MDC.l:MDC.r;if(!s||!s.lot)return;if(mdLot.t[k])clearTimeout(mdLot.t[k]);mdLot[k]=0
 const t0=Date.now(),S=k==='l'?'L':'R',step=()=>{const dt=Date.now()-t0,f=1+Math.floor(dt/50);mdLot[k]=f>9?0:f;mdLot.t[k]=f>9?null:setTimeout(step,51-dt%50)
  this.mdLotShow(S,(k==='l'?mdS.prevOn:mdS.nextOn)?mdLot[k]:0)};step()},
// Enhanced prev / next: the page callback runs 180 ms after the click. Vela delivers touchend and click back to back and
// renders once after both, and a track change (title, marquee, keys, list ...) costs ~100 ms of rendering on the
// emulator: run synchronously it held back the release and the first Lottie frames; deferred, frames 1-4 (the visible
// part of M3Next) play on time and the track change lands after them. [adapt]
mdSideTap(s,on,named){if(!s||!on)return;const run=()=>{if(s.seek){if(this.mdOnSeek)this.mdOnSeek(s.seek)}else if(this[named])this[named]()}
 if(!s.lot){run();return}this.mdTapFlush();mdS.tapFn=run;mdS.tapT=setTimeout(()=>this.mdTapFlush(),MDC.tapDefer)},
// run a deferred key callback now (a second tap, page hide): every tap still reaches the page, in order
mdTapFlush(){if(mdS.tapT)clearTimeout(mdS.tapT);mdS.tapT=null;const f=mdS.tapFn;mdS.tapFn=null;if(f)f()},
mdPrevTap(){this.mdSideTap(MDC.l,mdS.prevOn,'mdOnPrev')},
mdNextTap(){this.mdSideTap(MDC.r,mdS.nextOn,'mdOnNext')},
// MediaInfo: title + artist, ellipsis + 8dp right fade when overflowing; optional MarqueeText (64dp/s, 4s pause, 96dp gap)
mdSetMeta(title,artist){this.mdTitle=title||'';this.mdArtist=artist||'';this.mdInfo='ready';this.mdMeasure()},
mdSetInfo(mode,text){this.mdInfo=mode;if(text)this.mdNoneText=text;this.mdMeasure()},
mdMeasure(){if(!MDC.info)return;const I=MDC.info,ready=this.mdInfo==='ready'
 const over=ready&&mdTextW(this.mdTitle,I.fs,true)>I.tw,aover=ready&&mdTextW(this.mdArtist,I.afs,false)>I.aw
 this.mdAOver=aover;this.mdMqStop();this.mdMq=false;this.mdOver=over;if(over&&I.marquee){this.mdMq=true;this.mdMqArm()}},
mdMqArm(){if(mdMqTimer)clearTimeout(mdMqTimer);mdMqTimer=null;if(!mdVisible||!this.mdMq)return
 mdMqTimer=setTimeout(()=>{try{const el=this.$element('mdMarquee');if(el)el.stop()}catch(e){}
  mdMqTimer=setTimeout(()=>{mdMqTimer=null;try{const el=this.$element('mdMarquee');if(el)el.start()}catch(e){}},MDC.info.pause)},34)},
mdMqStop(){if(mdMqTimer)clearTimeout(mdMqTimer);mdMqTimer=null;try{const el=this.$element('mdMarquee');if(el)el.stop()}catch(e){}},
mdMqBounce(){this.mdMqStop();this.mdMqArm()},
// ---- settings row (MediaPlayerTestCase: VolumeButtonWithBadge + SettingsButton(MoreVert)) --------------------------
// Output icon: headphones / watch speaker when connected, media_output_off (no badge) for 'none'. Badge / volume icon:
// VolumeMute at the minimum, VolumeDown below the maximum, VolumeUp at the maximum or when unknown.
mdSetOutput(kind){mdS.out=kind==='watch'||kind==='none'?kind:'headphones';if(kind!=='none')mdS.outPref=mdS.out;this.mdPaintSet()},
mdSetSettingsEnabled(b){mdS.setOn=!!b;this.mdPaintSet()},
mdSetVolume(v,show){v=+v;if(!(v>=0))v=0;if(v>1)v=1;mdS.vol=v;this.mdPaintSet();if(!MDC.lv)return
 if(show)this.mdLvShow();else if(this.mdLvLive())this.mdLvTo(v,false)},
mdPaintSet(){const T=MDC.set;if(!T)return;const on=mdS.setOn,k=on?'on':'off',v=mdS.vol,lvl=v<0||v>=.995?'up':v<=.005?'mute':'down'
 const cls=on?'md-sbon':'md-sbdis';if(this.mdSetCls!==cls)this.mdSetCls=cls;let oi='',b=''
 if(T.out){oi=T.out[mdS.out][k];b=mdS.out==='none'?'':T.badge[lvl][on?0:1]}else if(T.vol)oi=T.vol[lvl][k]
 if(this.mdOutIc!==oi)this.mdOutIc=oi;if(this.mdBadge!==b)this.mdBadge=b;const mi=T.more[k];if(this.mdMoreIc!==mi)this.mdMoreIc=mi},
// press squish (IconButton animatedShapes: CornerFull -> shapes.small); disabled keys ignore the touch
mdSbDown(id){if(mdS.setOn&&MDC.set)this.sqPress(id,MDC.set.r,MDC.set.rp)},
mdOutTap(){if(mdS.setOn&&this.mdOnOutput)this.mdOnOutput()},
mdMoreTap(){if(mdS.setOn&&this.mdOnMore)this.mdOnMore()},
// ---- volume level indicator (VolumeLevelIndicator: arc on round, straight bar elsewhere) ---------------------------
// Each event shows it for 2500 ms (a new event restarts the delay, collectLatest); fadeIn fastEffects (178 ms),
// fadeOut slowEffects (412 ms) as opacity transitions. While visible (or fading out) value changes tween 500 ms;
// a fresh entry snaps to the current value.
mdShowVolume(v){if(v!==undefined&&v!==null)this.mdSetVolume(v,true);else this.mdLvShow()},
mdLvLive(){return mdLv.on||Date.now()<mdLv.outEnd},
mdLvShow(){if(!MDC.lv||!mdVisible||mdS.vol<0)return;this.mdLvTo(mdS.vol,!this.mdLvLive())
 if(!mdLv.on){mdLv.on=true;mdLv.outEnd=0;this.mdLvCls='md-lvin';this.mdLvSt={opacity:1}}
 if(mdLvTimer)clearTimeout(mdLvTimer);mdLvTimer=setTimeout(()=>{mdLvTimer=null;this.mdLvHide(false)},MDC.lvMs)},
mdLvHide(now){if(mdLvTimer)clearTimeout(mdLvTimer);mdLvTimer=null;if(!MDC.lv)return
 if(now){this.mdLvStop();mdLv.on=false;mdLv.outEnd=0;this.mdLvCls='';this.mdLvSt={opacity:0};return}
 if(!mdLv.on)return;mdLv.on=false;mdLv.outEnd=Date.now()+412;this.mdLvCls='md-lvout';this.mdLvSt={opacity:0}},
mdLvTo(v,snap){const now=Date.now()
 if(snap||mdLv.to<0){this.mdLvStop();mdLv.from=mdLv.to=v;mdLv.t0=now-500;this.mdLvPaint(v);return}
 if(v===mdLv.to)return;mdLv.from=this.mdLvAt(now);mdLv.to=v;mdLv.t0=now;this.mdLvPaint(this.mdLvAt(now,1))
 if(!mdLvTween)mdLvTween=setInterval(()=>{const t=Date.now();this.mdLvPaint(this.mdLvAt(t,1));if(t-mdLv.t0>=500)this.mdLvStop()},33)},
mdLvAt(t,shown){return mdLv.from+(mdLv.to-mdLv.from)*mdLvEase(Math.max(t-mdLv.t0,shown?1000/60:0)/500)},
mdLvStop(){if(mdLvTween)clearInterval(mdLvTween);mdLvTween=null},
// arc: ScrollIndicator.kt drawCurvedIndicator (same as the Stepper level); bar [adapt]: fill from the bottom, track
// above, gap 3dp at the join, round caps; a piece no longer than the gap is a dot (size and alpha ~ length / gap).
// [perf] mdPut: write a style object only when its content changed (no-op writes still trigger a re-render).
mdPut(k,v){if(JSON.stringify(this[k])===JSON.stringify(v))return;this[k]=v},
mdLvPaint(f){const L=MDC.lv
 if(L.arc){const fill=L.sweep*f,rest=L.sweep-fill,end=L.start+fill,rot=a=>JSON.stringify({rotate:(a-180).toFixed(2)+'deg'})
  this.mdPut('mdLvI',fill>L.gap?{opacity:1,transform:rot(end-L.gap/2)}:{opacity:0,transform:rot(L.start)})
  this.mdPut('mdLvT',rest>L.gap?{opacity:1,transform:rot(end+L.gap/2)}:{opacity:0,transform:rot(L.start+L.sweep)})
  const dot=(sweep,from)=>{const q=sweep/L.gap,r=L.o*q;if(sweep>L.gap||r<.25)return {opacity:0}
   const a=(from+sweep/2)*Math.PI/180,x=L.cx+L.r*Math.cos(a),y=L.cy+L.r*Math.sin(a),d=Math.max(1,Math.round(2*r))
   return {opacity:Math.round(q*100)/100,left:Math.round(x-d/2)+'px',top:Math.round(y-d/2)+'px',width:d+'px',height:d+'px',borderRadius:d/2+'px'}}
  this.mdPut('mdLvDI',dot(fill,L.start));this.mdPut('mdLvDT',dot(rest,end));return}
 const w=L.w,yb=L.ht-w/2,s=L.lc*f,r=L.lc-s
 const piece=(u0,u1)=>({opacity:1,left:'0px',top:Math.round(yb-u1-w/2)+'px',width:w+'px',height:Math.round(u1-u0+w)+'px',borderRadius:w/2+'px'})
 const dot=(len,u)=>{const q=len/L.gap,d=Math.round(w*q);if(d<1)return {opacity:0}
  return {opacity:Math.round(q*100)/100,left:Math.round((w-d)/2)+'px',top:Math.round(yb-u-d/2)+'px',width:d+'px',height:d+'px',borderRadius:d/2+'px'}}
 this.mdPut('mdBarI',s>L.gap?piece(0,s-L.gap/2):dot(s,s/2));this.mdPut('mdBarT',r>L.gap?piece(s+L.gap/2,L.lc):dot(r,s+r/2))},
// ---- whole screen (PlayerScreen states) -----------------------------------------------------------------------------
// playing / paused: media ready, keys and settings enabled; loading: placeholders + loading ring; none: "未在播放"
// (connected, no media); disconnected: golden notconnected = "未在播放", every key disabled, output off, no badge.
mdSetState(st){const on=st!=='disconnected'
 if(MDC.ic){this.mdSetLoading(st==='loading');if(st==='playing'||st==='paused')this.mdSetPlaying(st==='playing');else if(!on)this.mdSetPlaying(false)}
 this.mdSetEnabled(on?{play:true}:{play:false,prev:false,next:false})
 if(st==='loading')this.mdSetInfo('loading');else if(st==='none'||!on){this.mdSetInfo('none');this.mdSetProgress(0)}else if(this.mdInfo!=='ready')this.mdSetInfo('ready')
 if(MDC.set){mdS.setOn=on;this.mdSetOutput(on?mdS.outPref:'none')}},
mdShow(){mdVisible=true;this.mdPaint();if(this.mdMq)this.mdMqArm();if(this.mdaShow)this.mdaShow();if(this.mdvShow)this.mdvShow()},
mdHide(){this.mdTapFlush();mdVisible=false;['l','r'].forEach(k=>{if(mdLot.t[k])clearTimeout(mdLot.t[k]);mdLot.t[k]=null;mdLot[k]=0});this.mdMqStop();this.mdRelease(true);this.mdLvHide(true);if(this.mdaHide)this.mdaHide();if(this.mdvHide)this.mdvHide()},
