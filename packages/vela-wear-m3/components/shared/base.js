// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
  onShow() {
    active = true
    this.startClock()
    overlayLock = false
    this.exiting = false
    if (this.pageShow) this.pageShow()

  },
  onHide() { this.cleanup(); if (this.pageHide) this.pageHide() },
  onDestroy() { this.cleanup(); if (this.pageDestroy) this.pageDestroy() },
  later(fn, ms) {
    const id = setTimeout(() => {
      const i = pending.indexOf(id)
      if (i >= 0) pending.splice(i, 1)
      fn()
    }, ms)
    pending.push(id)
    return id
  },
  cleanup() {
    active=false
    this.stopClock()
    this.cancelPress()
    pending.forEach(id => clearTimeout(id))
    pending = []
    scrollDirty=false
    if(motionTimer)clearInterval(motionTimer)
    motionTimer=null;motions={}
    const reset={};Object.keys(this.feedback).forEach(id=>{reset[id]={opacity:1}});this.feedback=reset;this.pressId='';this.relId=''
    Object.keys(holds).forEach(k=>clearTimeout(holds[k]));holds={}
    if (backTimer) clearTimeout(backTimer)
    if (scrollTimer) clearTimeout(scrollTimer)
    backTimer = scrollTimer = null
    horizontalControl = false
    if (this.clearConfirm) this.clearConfirm()
    this.stopAnimator('spinAnim')
    this.stopAnimator('morphAnim')
    if(this.stopLevel)this.stopLevel()
    this.stopAnimator('buttonMorphAnim')
    this.stopAnimator('checkAnim')
  },
  stopAnimator(id) {
    try { const el = this.$element(id); if (el) el.stop() } catch (e) {}
  },
  onBackPress() { return this.doBack() },
  onPageSwipe(e) {
    if (e.direction === 'right' && !horizontalControl) {
      this.cancelPress()
      this.doBack()
    }
  },
  controlStart() { horizontalControl = true },
  controlEnd() { this.later(() => { horizontalControl = false }, 80) },
  doBack() {
    if (this.exiting || overlayLock) return true
    if (this.overlayBack && this.overlayBack()) {
      overlayLock = true
      this.later(() => { overlayLock = false }, 240)
      return true
    }
    if (this.demoMode) {this.cancelPress();if(this.demoClose)this.demoClose();this.demoMode='';return true}
    if (this.isHome) return false
    this.exiting = true
    backTimer = setTimeout(() => { backTimer = null; router.back() }, 220)
    return true
  },
  goBack() { this.vib(); this.doBack() },
  startClock() {
    this.tick()
    if (!clockTimer){const seconds=this.onTick&&(!this.clockSecondsVisible||this.clockSecondsVisible());const period=seconds?1000:60000;clockTimer=setTimeout(()=>{clockTimer=null;this.startClock()},period-Date.now()%period)}
  },
  stopClock() { if (clockTimer) clearTimeout(clockTimer); clockTimer = null },
  tick() {
    const d = new Date()
    let h = d.getHours()
    if (!this.h24) h = h % 12 || 12
    const s = pad2(h) + ':' + pad2(d.getMinutes())
    if(s!==lastClock){lastClock=s;this.topGlyphs=timeGlyphs(s);this.clockGlyphs=timeGlyphs(s,false,$[W]);this.statusGlyphs=timeGlyphs(s,true,$[W])}
    this.tt0 = s[0]; this.tt1 = s[1]; this.tt3 = s[3]; this.tt4 = s[4]
    if (this.onTick) this.onTick(d)
  },
  vib() { try { vibrator.vibrate({ mode: 'short' }) } catch (e) {} },
  press(id) {
    if(this.pressId && this.pressId!==id)this.cancelPress()
    this.pressId=id;this.relId='';this.animateControl(id,1)
  },
  release(id) {
    if(this.pressId!==id)return false
    this.pressId='';this.relId=id;this.animateControl(id,0);this.stopHold(id);return true
  },
  cancelPress() {
    const id=this.pressId;if(!id)return
    this.pressId='';this.relId='';this.stopHold(id);this.animateControl(id,0)
    if(this.onPressCancel)this.onPressCancel(id)
  },
  stopHold(id){if(holds[id])clearTimeout(holds[id]);delete holds[id]},
  // every=120 for list/demo holds; Stepper passes androidx repeatableClickable's 60ms (initialDelay 500).
  hold(id,fn,every=120){this.stopHold(id);const repeat=()=>{if(this.pressId!==id||!active)return;fn();holds[id]=setTimeout(repeat,every)};holds[id]=setTimeout(repeat,500)},
  animateControl(id,target,initial=0,stiffness=0) {
    // stiffness>0 = one critically damped spring both ways (e.g. androidx fastEffects 1400); 0 keeps press feedback
    // (fast 1400 in, slow 260 out). Ids listed by pressSpring(id) -> [kIn,kOut] use the exact critically damped
    // solution on the wall clock instead (stiff springs such as 12600 are not stable in the 120Hz Euler loop).
    const m=motions[id]||(motions[id]={x:initial,v:0,target:initial});const pair=!stiffness&&this.pressSpring&&this.pressSpring(id)
    if(pair){const now=Date.now();if(m.ex){const c=springAt(m,now);m.x=c.x;m.v=c.v}m.x0=m.x;m.v0=m.v;m.t0=now;m.ex=pair[target?0:1]}else m.ex=0
    m.target=target;m.k=stiffness
    const step=only=>{
      let moving=false
      ;(only?[only]:Object.keys(motions)).forEach(key=>{
        const q=motions[key]
        if(q.ex){const c=springAt(q,Date.now(),1);q.x=c.x;q.v=c.v;if(c.done){q.x=q.target;q.v=0}else moving=true}
        else{
        const dt=1/120,stiff=q.k||(q.target?1400:260)
        for(let n=0;n<4;n++){q.v+=(stiff*(q.target-q.x)-2*Math.sqrt(stiff)*q.v)*dt;q.x+=q.v*dt}
        if(Math.abs(q.x-q.target)<.002&&Math.abs(q.v)<.02){q.x=q.target;q.v=0}else moving=true
        }
        const value=Math.max(0,Math.min(1,q.x)),st=this.pressStyle?this.pressStyle(key,value):null
        const previous=this.feedback[key]||{},next=st||{opacity:Math.round((1-.08*value)*100)/100}
        if(Object.keys(next).some(name=>previous[name]!==next[name]))this.feedback[key]=next
        if(this.onMotionFrame)this.onMotionFrame(key,value)
      })
      if(!only&&!moving&&motionTimer){clearInterval(motionTimer);motionTimer=null}
      return moving
    }
    // Explicit-stiffness and exact motions render their first frame now instead of one tick late.
    if((stiffness>0||pair)&&!step(id))return
    if(!motionTimer)motionTimer=setInterval(()=>step(),33)
  },
  setLayout(h) {
    const feedback={};['back','plus','minus','morph','buttonMorph','compact','compactStatic','secondary','a','b','c','tg','eb','dec','inc'].forEach(id=>{feedback[id]={opacity:1}})
    ;['items','variants','iconVariants','radios','switches'].forEach(name=>{(this[name]||[]).forEach(it=>{feedback[it.id]={opacity:1}})})
    this.feedback=feedback
    if(PAGE_LAYOUT.length){h=[];PAGE_LAYOUT.forEach(row=>{const n=row.repeat?(this[row.repeat]||[]).length:1;if(row.repeat==='items')this.tlcBase=h.length;for(let i=0;i<n;i++)h.push(row.height)})}
    tops = []; hts = h;lastVisible=[]
    rowRanges={}
    let cursor=0,index=0;PAGE_LAYOUT.forEach(row=>{const count=row.repeat?(this[row.repeat]||[]).length:1;rowRanges[row.type]={top:cursor,bottom:cursor+row.height*count,index};cursor+=row.height*count;index+=count})
    let y = 0
    h.forEach(v => { tops.push(y); y += v })
    maxY = Math.max(0, y - DEV.H)
    sy = shownPos = scrollGoal = 0
    this.siVisible = maxY > 0
    this.applyScroll()
    this.siSt=siStyle(SI,0,scrollFraction(DEV.H,maxY+DEV.H))
  },
  rowBounds(type){return rowRanges[type]||{top:0,bottom:0}},
  onScroll(e){if(!active)return;sy=Math.max(0,Math.min(maxY,e.scrollY));this.cancelPress();scrollDirty=true;this.scheduleScroll()},
  scheduleScroll(){
    if(scrollTimer)return
    scrollTimer=setTimeout(()=>{scrollTimer=null;this.flushScroll()},Math.max(1,33-(Date.now()-lastScrollFlush)))
  },
  flushScroll(){
    lastScrollFlush=Date.now()
    if(scrollDirty){scrollDirty=false;this.applyScroll();if(this.onScrolled)this.onScrolled(sy,maxY)}
    shownPos+=(scrollGoal-shownPos)*.24
    if(Math.abs(shownPos-scrollGoal)<.001)shownPos=scrollGoal
    const st=siStyle(SI,shownPos,scrollFraction(DEV.H,maxY+DEV.H))
    if(st.transform!==this.siSt.transform||st.top!==this.siSt.top||st.height!==this.siSt.height)this.siSt=st
    if(scrollDirty||shownPos!==scrollGoal)this.scheduleScroll()
  },
  onTop(){this.onScroll({scrollY:0})},onBottom(){this.onScroll({scrollY:maxY})},
  applyScroll() {
    scrollGoal = maxY > 0 ? sy / maxY : 0
    const fraction = scrollFraction(DEV.H, maxY + DEV.H)
    const src=SI.round?SI.images[Math.round(fraction*100)-30]:''
    if(this.siSrc!==src)this.siSrc=src
    if (this.items && this.tlcBase >= 0) {
      let first=0,last=this.items.length-1
      while(first<this.items.length&&tops[this.tlcBase+first]+hts[this.tlcBase+first]<sy)first++
      while(last>=first&&tops[this.tlcBase+last]>sy+DEV.H)last--
      first=Math.max(0,first-1);last=Math.min(this.items.length-1,last+1)
      const visible=[];for(let i=first;i<=last;i++)visible.push(i)
      const update=visible.concat(lastVisible.filter(i=>visible.indexOf(i)<0));lastVisible=visible
      for(let n=0;n<update.length;n++){const i=update[n]
        const j = this.tlcBase + i, top = tops[j] - sy
        const st = this.tlcOn ? tlcStyle(top, top + hts[j]) : IDENT
        const it = this.items[i]
        if (!it.st || it.st.opacity !== st.opacity || it.st.transform !== st.transform) it.st = st
      }
    }
  },
