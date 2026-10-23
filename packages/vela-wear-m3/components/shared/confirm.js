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
    this.later(() => { if(epoch!==confirmEpoch||!this.cfOn||this.cfOut)return;this.cfBlobOn=true;this.cfIconOn=true;this.later(()=>{if(epoch!==confirmEpoch)return;try{const el=this.$element('checkAnim');if(el)el.start()}catch(e){}},0) }, 100)
    this.later(()=>{if(epoch===confirmEpoch&&this.cfOn&&!this.cfOut)this.cfTextOn=true},150)
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = setTimeout(() => { cfTimer = null; this.hideConfirm() }, 4000)
  },
  hideConfirm() {
    if (!this.cfOn || this.cfOut) return
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = null
    const epoch=++confirmEpoch
    this.cfIconOn=false
    this.cfOut = true
    this.stopAnimator('checkAnim')
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
