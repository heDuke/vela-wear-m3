// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
  openStepper(){this.demoMode='stepper';this.updateRange(true)},
  openLevel(){this.demoMode='level';this.updateRange(true)},
  // Value change = androidx IndicatorImpl: Animatable.animateTo(new size, tween 500ms) restarted from the CURRENT
  // animated fraction (a tween ignores the carried velocity); the first value after showing snaps; equal targets
  // are ignored (DisplayState.equals). snap=true for (re)entry.
  updateRange(snap){
    const to=this.stepValue/10,now=Date.now()
    this.lvIndSrc=this.stepEnabled?LV.ind.src:LV.indDis.src;this.lvTrkSrc=this.stepEnabled?LV.trk.src:LV.trkDis.src
    if(snap||lvTo<0){this.stopLevel();lvFrom=lvTo=to;lvT0=now-LV_MS;this.paintLevel(to);return}
    if(to===lvTo){this.paintLevel(this.levelAt(now));return}
    lvFrom=this.levelAt(now);lvTo=to;lvT0=now;this.paintLevel(this.levelAt(now,1))
    if(!lvTimer)lvTimer=setInterval(()=>{const t=Date.now();this.paintLevel(this.levelAt(t,1));if(t-lvT0>=LV_MS)this.stopLevel()},33)
  },
  // shown=1: at least one display frame (1000/60ms) of progress, like the first Compose frame after the change.
  levelAt(t,shown){return lvFrom+(lvTo-lvFrom)*lvEase(Math.max(t-lvT0,shown?1000/60:0)/LV_MS)},
  stopLevel(){if(lvTimer)clearInterval(lvTimer);lvTimer=null},
  // ScrollIndicator.kt drawCurvedIndicator: fill [start, start+sweep*f], track [.., start+sweep]; each piece is inset
  // gap/2 with round caps; a piece no longer than gap is a dot at its middle, radius and alpha lerp(0..1, sweep/gap).
  paintLevel(f){
    this.levelFill=f
    const fill=LV.sweep*f,rest=LV.sweep-fill,end=LV.start+fill,rot=a=>JSON.stringify({rotate:(a-180).toFixed(2)+'deg'})
    this.lvInd=fill>LV.gap?{opacity:1,transform:rot(end-LV.gap/2)}:{opacity:0,transform:rot(LV.start)}
    this.lvTrk=rest>LV.gap?{opacity:1,transform:rot(end+LV.gap/2)}:{opacity:0,transform:rot(LV.start+LV.sweep)}
    const dot=(sweep,from)=>{
      const q=sweep/LV.gap,r=LV.o*q;if(sweep>LV.gap||r<.25)return {opacity:0}
      const a=(from+sweep/2)*Math.PI/180,x=LV.cx+LV.r*Math.cos(a),y=LV.cy+LV.r*Math.sin(a),d=Math.max(1,Math.round(2*r))
      return {opacity:Math.round(q*100)/100,left:Math.round(x-d/2)+'px',top:Math.round(y-d/2)+'px',width:d+'px',height:d+'px',borderRadius:d/2+'px'}
    }
    this.lvDotInd=dot(fill,LV.start);this.lvDotTrk=dot(rest,end)
  },
  rangePress(id){
    if(!this.stepEnabled||(id==='plus'?this.stepValue>=10:this.stepValue<=0))return
    this.stepRepeat=false;this.stepReleased='';this.press(id);this.hold(id,()=>{this.stepRepeat=true;id==='plus'?this.stepUp():this.stepDown()},60)
  },
  rangeRelease(id){if(this.release(id))this.stepReleased=id},
  stepClick(id){if(this.stepReleased!==id)return;this.stepReleased='';if(this.stepRepeat){this.stepRepeat=false;return}id==='plus'?this.stepUp():this.stepDown()},
  stepUp(){if(this.stepEnabled&&this.stepValue<10){this.stepValue++;this.updateRange();this.vib()}},
  stepDown(){if(this.stepEnabled&&this.stepValue>0){this.stepValue--;this.updateRange();this.vib()}},
  toggleStepEnabled(){this.cancelPress();this.stepReleased='';this.stepRepeat=false;this.stepEnabled=!this.stepEnabled;this.updateRange()},
  // StepperButton: shape CornerFull -> shapes.small on fastSpatialSpec().faster(200f) (stiffness 1400*3^2=12600), back
  // on slowSpatialSpec (260), both critically damped; the ripple is a flat Primary 10% layer (no spread from the finger).
  pressSpring(id){return id==='plus'||id==='minus'?[12600,260]:null},
  pressStyle(id,p){
    if(id!=='plus'&&id!=='minus')return null
    const c='#'+KEY_IDLE.map((v,i)=>('0'+Math.round(v+(KEY_PRESSED[i]-v)*p).toString(16)).slice(-2)).join('').toUpperCase(),st={backgroundColor:c,borderColor:c}
    if($[enhanced])st.borderRadius=Math.round($[dp(24)]-$[dp(16)]*p)+'px'
    return st
  },
