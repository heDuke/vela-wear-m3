// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
  showConfirm() {
    this.clearConfirm()
    const epoch=++confirmEpoch
    this.vib()
    this.cfOut = false
    this.cfIconOn = false
    this.cfOn = true
    this.cfBlobOn=false;this.cfTextOn=false
    this.later(() => { if(epoch!==confirmEpoch||!this.cfOn||this.cfOut)return;this.cfBlobOn=true;this.cfIconOn=true;this.cfTextOn=true;this.later(()=>{if(epoch!==confirmEpoch)return;try{const el=this.$element('checkAnim');if(el)el.start()}catch(e){}},0) }, 100)
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = setTimeout(() => { cfTimer = null; this.hideConfirm() }, 4000)
  },
  hideConfirm() {
    if (!this.cfOn || this.cfOut) return
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = null
    const epoch=++confirmEpoch
    // Icon keeps its last frame and fades/scales out with the overlay (Wear M3 Dialog hide).
    this.cfOut = true
    this.later(() => { if(epoch!==confirmEpoch)return;this.cfOn = false; this.cfOut = false; this.cfIconOn = false }, 200)
  },
  clearConfirm() {
    ++confirmEpoch
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = null
    this.stopAnimator('checkAnim')
    this.cfBlobOn=false;this.cfTextOn=false
    this.cfOn = false
    this.cfOut = false
    this.cfIconOn = false
  },
