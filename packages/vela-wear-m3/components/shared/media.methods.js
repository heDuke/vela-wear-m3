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
mdSetProgress(f){f=+f;if(!(f>=0))f=0;if(f>1)f=1;mdS.f=f;const pct=Math.round(f*100);if(this.mdPct!==pct)this.mdPct=pct
 if(MDC.ring!=='wavy')return;const q=Math.floor(f*MDC.steps+1e-6);if(q===mdS.q)return;mdS.q=q;this.mdRingPaint()},
// playing: wavy ring around the scallop; paused: circle ring around the circle (RotatingWavyProgressIndicator morph
// target circlePolygon), switched instantly like the official cached Morph.
mdRingPaint(){if(!MDC.cl)return;const q=mdS.q,c=mdS.circ,ring=[],cr=[];let c9=''
 for(let k=0;k<10;k++){if(c){ring.push('');const n=mdCLobe(k,q,MDC.steps);if(n==='9I'){cr.push('');c9=MDC.cl['9_I']}else cr.push(n)}else{ring.push(mdLobe(k,q,MDC.steps));cr.push('')}}
 const rt=c?MDC.ct:MDC.rt;if(this.mdRtSrc!==rt)this.mdRtSrc=rt;this.mdRing=ring;this.mdCRing=cr;if(this.mdC9I!==c9)this.mdC9I=c9},
// visual state: shape (scallop while playing, circle while paused, pill while pressed), ring, icon and side colours
mdPaint(){
 this.mdPaintSet()
 if(!MDC.ic)return this.mdPaintSides()
 const p=mdS.press,pillShape=p==='play'||(!!p&&!MDC.vertical)||mdS.rel
 const solid=pillShape||(p&&MDC.vertical)||MDC.shape==='round'||!mdS.playing
 const pc=solid?(mdS.playOn?'md-pon':'md-pdis'):'md-poff';if(this.mdPillCls!==pc)this.mdPillCls=pc
 const so=solid?0:1;if(this.mdScSt.opacity!==so)this.mdScSt={opacity:so}
 const ss=mdS.playOn?MDC.sc:MDC.scD;if(this.mdScSrc!==ss)this.mdScSrc=ss
 if(MDC.rotate){const sc=mdS.playing&&!p&&!mdS.loading?'md-spin':'';if(this.mdScCls!==sc)this.mdScCls=sc}
 // the progress ring has no enabled state: full colours even when the button is disabled (golden notconnected)
 const ro=pillShape||mdS.loading?0:1;if(this.mdRingSt.opacity!==ro)this.mdRingSt={opacity:ro}
 const circ=!mdS.playing;if(mdS.circ!==circ){mdS.circ=circ;this.mdRingPaint()}
 const ic=mdS.playing?(mdS.playOn?MDC.ic.pause:MDC.ic.pauseD):(mdS.playOn?MDC.ic.play:MDC.ic.playD);if(this.mdIcon!==ic)this.mdIcon=ic
 this.mdPaintSides()
},
mdPaintSides(){if(!MDC.l)return;const lc=mdS.prevOn?'md-son':'md-sdis',rc=mdS.nextOn?'md-son':'md-sdis'
 if(this.mdLCls!==lc)this.mdLCls=lc;if(this.mdRCls!==rc)this.mdRCls=rc
 const li=mdS.prevOn?MDC.l.ic:MDC.l.icD,ri=mdS.nextOn?MDC.r.ic:MDC.r.icD;if(this.mdLIcon!==li)this.mdLIcon=li;if(this.mdRIcon!==ri)this.mdRIcon=ri},
// ButtonGroup press expansion: pressed key +12dp, neighbours -12dp (middle pressed: sides -6dp each); width transition
// .md-tin = fastSpatial (k 5600) / .md-tout = slowSpatial (k 260) fitted cubic-beziers. Radius follows min(w,h)/2.
mdWidths(id,grow){if(!MDC.w)return;const w=MDC.w[id||''],r=v=>Math.floor(Math.min(v,MDC.ph)/2)
 const side=(slot,cur)=>{const old=parseInt(cur.width),nr=w[slot]<old&&!grow?r(w[slot]):Math.min(r(w[slot]),r(old));return {width:w[slot]+'px',borderRadius:nr+'px'}}
 this.mdLSt=side(0,this.mdLSt);this.mdRSt=side(2,this.mdRSt);if(!MDC.vertical)this.mdMSt={width:w[1]+'px'}},
mdPress(id){
 if(mdRelTimer){clearTimeout(mdRelTimer);mdRelTimer=null}
 mdS.press=id;mdS.rel=false;this.mdTr='md-tin';this.mdWidths(id,true)
 if(MDC.pw)this.mdPillSt={width:(id==='play'?MDC.pw.play:MDC.vertical?MDC.pw['']:MDC.pw.side)+'px'}
 this.mdPaint()},
mdRelease(now){
 if(!mdS.press)return;const was=mdS.press;mdS.press='';mdS.rel=!MDC.vertical||was==='play';this.mdTr='md-tout';this.mdWidths('',false)
 if(MDC.pw)this.mdPillSt={width:MDC.pw['']+'px'}
 const done=()=>{mdRelTimer=null;mdS.rel=false;if(MDC.w)this.mdWidths('',false);this.mdPaint()}
 if(mdRelTimer)clearTimeout(mdRelTimer);if(now){done();return}mdRelTimer=setTimeout(done,450);this.mdPaint()},
mdPlayDown(){if(mdS.playOn&&!mdS.loading)this.mdPress('play')},
mdPrevDown(){if(mdS.prevOn&&MDC.l)this.mdPress('prev')},
mdNextDown(){if(mdS.nextOn&&MDC.r)this.mdPress('next')},
mdUp(){this.mdRelease(false)},
mdCancel(){this.mdRelease(false)},
mdPlayTap(){if(!mdS.playOn||mdS.loading)return;if(mdS.playing){if(this.mdOnPause)this.mdOnPause()}else if(this.mdOnPlay)this.mdOnPlay()},
mdSideTap(s,on,named){if(!s||!on)return;if(s.seek){if(this.mdOnSeek)this.mdOnSeek(s.seek)}else if(this[named])this[named]()},
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
mdLvPaint(f){const L=MDC.lv
 if(L.arc){const fill=L.sweep*f,rest=L.sweep-fill,end=L.start+fill,rot=a=>JSON.stringify({rotate:(a-180).toFixed(2)+'deg'})
  this.mdLvI=fill>L.gap?{opacity:1,transform:rot(end-L.gap/2)}:{opacity:0,transform:rot(L.start)}
  this.mdLvT=rest>L.gap?{opacity:1,transform:rot(end+L.gap/2)}:{opacity:0,transform:rot(L.start+L.sweep)}
  const dot=(sweep,from)=>{const q=sweep/L.gap,r=L.o*q;if(sweep>L.gap||r<.25)return {opacity:0}
   const a=(from+sweep/2)*Math.PI/180,x=L.cx+L.r*Math.cos(a),y=L.cy+L.r*Math.sin(a),d=Math.max(1,Math.round(2*r))
   return {opacity:Math.round(q*100)/100,left:Math.round(x-d/2)+'px',top:Math.round(y-d/2)+'px',width:d+'px',height:d+'px',borderRadius:d/2+'px'}}
  this.mdLvDI=dot(fill,L.start);this.mdLvDT=dot(rest,end);return}
 const w=L.w,yb=L.ht-w/2,s=L.lc*f,r=L.lc-s
 const piece=(u0,u1)=>({opacity:1,left:'0px',top:Math.round(yb-u1-w/2)+'px',width:w+'px',height:Math.round(u1-u0+w)+'px',borderRadius:w/2+'px'})
 const dot=(len,u)=>{const q=len/L.gap,d=Math.round(w*q);if(d<1)return {opacity:0}
  return {opacity:Math.round(q*100)/100,left:Math.round((w-d)/2)+'px',top:Math.round(yb-u-d/2)+'px',width:d+'px',height:d+'px',borderRadius:d/2+'px'}}
 this.mdBarI=s>L.gap?piece(0,s-L.gap/2):dot(s,s/2);this.mdBarT=r>L.gap?piece(s+L.gap/2,L.lc):dot(r,s+r/2)},
// ---- whole screen (PlayerScreen states) -----------------------------------------------------------------------------
// playing / paused: media ready, keys and settings enabled; loading: placeholders + loading ring; none: "未在播放"
// (connected, no media); disconnected: golden notconnected = "未在播放", every key disabled, output off, no badge.
mdSetState(st){const on=st!=='disconnected'
 if(MDC.ic){this.mdSetLoading(st==='loading');if(st==='playing'||st==='paused')this.mdSetPlaying(st==='playing');else if(!on)this.mdSetPlaying(false)}
 this.mdSetEnabled(on?{play:true}:{play:false,prev:false,next:false})
 if(st==='loading')this.mdSetInfo('loading');else if(st==='none'||!on){this.mdSetInfo('none');this.mdSetProgress(0)}else if(this.mdInfo!=='ready')this.mdSetInfo('ready')
 if(MDC.set){mdS.setOn=on;this.mdSetOutput(on?mdS.outPref:'none')}},
mdShow(){mdVisible=true;this.mdPaint();if(this.mdMq)this.mdMqArm();if(this.mdaShow)this.mdaShow();if(this.mdvShow)this.mdvShow()},
mdHide(){mdVisible=false;this.mdMqStop();this.mdRelease(true);this.mdLvHide(true);if(this.mdaHide)this.mdaHide();if(this.mdvHide)this.mdvHide()},
