// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
  openStepper(){this.demoMode='stepper';this.updateRange()},
  openLevel(){this.demoMode='level';this.updateRange()},
  updateRange(){this.levelSrc=(this.stepEnabled?LEVELS:DISABLED_LEVELS)[this.stepValue]},
  rangePress(id){
    if(!this.stepEnabled||(id==='plus'?this.stepValue>=10:this.stepValue<=0))return
    this.stepRepeat=false;this.stepReleased='';this.press(id);this.hold(id,()=>{this.stepRepeat=true;id==='plus'?this.stepUp():this.stepDown()})
  },
  rangeRelease(id){if(this.release(id))this.stepReleased=id},
  stepClick(id){if(this.stepReleased!==id)return;this.stepReleased='';if(this.stepRepeat){this.stepRepeat=false;return}id==='plus'?this.stepUp():this.stepDown()},
  stepUp(){if(this.stepEnabled&&this.stepValue<10){this.stepValue++;this.updateRange();this.vib()}},
  stepDown(){if(this.stepEnabled&&this.stepValue>0){this.stepValue--;this.updateRange();this.vib()}},
  toggleStepEnabled(){this.cancelPress();this.stepReleased='';this.stepRepeat=false;this.stepEnabled=!this.stepEnabled;this.updateRange()},
