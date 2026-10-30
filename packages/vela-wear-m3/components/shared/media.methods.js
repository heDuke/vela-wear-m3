// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Public: mdSetPlaying(b) mdSetProgress(f 0..1) mdSetLoading(b) mdSetEnabled({play,prev,next}) mdSetMeta(title,artist)
// mdSetInfo('ready'|'loading'|'none'[,text]) mdShow() mdHide(). Emits (if defined on the page): mdOnPlay() mdOnPause()
// mdOnPrev() mdOnNext() mdOnSeek(seconds). Template handlers: mdPlayDown/mdPrevDown/mdNextDown/mdUp/mdCancel, md*Tap.
mdSetPlaying(b){mdS.playing=!!b;this.mdPaint()},
mdSetLoading(b){mdS.loading=!!b;this.mdLoading=mdS.loading;this.mdPaint()},
mdSetEnabled(o){if(!o)return;['play','prev','next'].forEach(k=>{if(k in o)mdS[k+'On']=!!o[k]});if(mdS.press&&!mdS[mdS.press+'On'])this.mdRelease(true);this.mdPaint()},
mdSetProgress(f){f=+f;if(!(f>=0))f=0;if(f>1)f=1;mdS.f=f;const pct=Math.round(f*100);if(this.mdPct!==pct)this.mdPct=pct
 if(MDC.ring!=='wavy')return;const q=Math.floor(f*MDC.steps+1e-6);if(q===mdS.q)return;mdS.q=q
 const ring=[];for(let k=0;k<10;k++)ring.push(mdLobe(k,q,MDC.steps));this.mdRing=ring},
// visual state: shape (scallop / pill / circle), ring visibility, icon and side colours
mdPaint(){
 if(!MDC.ic)return this.mdPaintSides()
 const p=mdS.press,pillShape=p==='play'||(!!p&&!MDC.vertical)||mdS.rel
 const solid=pillShape||(p&&MDC.vertical)||MDC.shape==='round'
 const pc=solid?(mdS.playOn?'md-pon':'md-pdis'):'md-poff';if(this.mdPillCls!==pc)this.mdPillCls=pc
 const so=solid?0:1;if(this.mdScSt.opacity!==so)this.mdScSt={opacity:so}
 const ss=mdS.playOn?MDC.sc:MDC.scD;if(this.mdScSrc!==ss)this.mdScSrc=ss
 if(MDC.rotate){const sc=mdS.playing&&!p&&!mdS.loading?'md-spin':'';if(this.mdScCls!==sc)this.mdScCls=sc}
 const ro=pillShape||mdS.loading?0:mdS.playOn?1:.38;if(this.mdRingSt.opacity!==ro)this.mdRingSt={opacity:ro}
 const ic=mdS.playing?(mdS.playOn?MDC.ic.pause:MDC.ic.pauseD):(mdS.playOn?MDC.ic.play:MDC.ic.playD);if(this.mdIcon!==ic)this.mdIcon=ic
 if(MDC.steps&&MDC.ring==='wavy'&&!this.mdRing.length)this.mdSetProgress(mdS.f)
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
mdShow(){mdVisible=true;this.mdPaint();if(this.mdMq)this.mdMqArm();if(this.mdaShow)this.mdaShow()},
mdHide(){mdVisible=false;this.mdMqStop();this.mdRelease(true);if(this.mdaHide)this.mdaHide()},
