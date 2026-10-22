  // ---------- Confirmation overlay (partials/confirm.js) ----------
  showConfirm() {
    this.vib()
    this.cfOut = false
    this.cfOn = true
    if (cfTimer) clearTimeout(cfTimer)
    // M3 default is 4000ms; shortened so the demo flows
    cfTimer = setTimeout(() => {
      this.hideConfirm()
    }, 2200)
  },
  hideConfirm() {
    if (!this.cfOn || this.cfOut) return
    if (cfTimer) clearTimeout(cfTimer)
    cfTimer = null
    this.cfOut = true
    setTimeout(() => {
      this.cfOn = false
      this.cfOut = false
    }, 200)
  },
