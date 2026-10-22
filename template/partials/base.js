  // ---------- shared page behaviour (partials/base.js) ----------
  onShow() {
    this.startClock()
    if (this.pageShow) this.pageShow()
  },
  onHide() {
    this.stopClock()
    if (this.pageHide) this.pageHide()
  },
  onDestroy() {
    this.stopClock()
    if (this.pageDestroy) this.pageDestroy()
  },
  // back gesture: close overlay first, then play the exit transition and go back (SPEC §3.9 multi-level intercept)
  onBackPress() {
    return this.doBack()
  },
  // lifecycle hooks are not callable as vm methods on Vela, so the logic lives in a normal method
  doBack() {
    if (this.overlayBack && this.overlayBack()) return true
    if (this.isHome || this.exiting) return false
    this.exiting = true
    setTimeout(() => {
      router.back()
    }, 200)
    return true
  },
  goBack() {
    this.vib()
    this.doBack()
  },
  startClock() {
    this.tick()
    if (!clockTimer) {
      clockTimer = setInterval(() => {
        this.tick()
      }, 1000)
    }
  },
  stopClock() {
    if (clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
  },
  tick() {
    const d = new Date()
    let h = d.getHours()
    if (!this.h24) {
      h = h % 12
      if (h === 0) h = 12
    }
    const s = pad2(h) + ':' + pad2(d.getMinutes())
    if (this.tt0 !== s[0]) this.tt0 = s[0]
    if (this.tt1 !== s[1]) this.tt1 = s[1]
    if (this.tt3 !== s[3]) this.tt3 = s[3]
    if (this.tt4 !== s[4]) this.tt4 = s[4]
    if (this.onTick) this.onTick(d)
  },
  vib() {
    try {
      vibrator.vibrate({ mode: 'short' })
    } catch (e) {}
  },
  press(id) {
    this.pressId = id
    this.relId = ''
  },
  release(id) {
    if (this.pressId === id) {
      this.pressId = ''
      this.relId = id
    }
  },
  setLayout(h) {
    tops = []
    hts = h
    let y = 0
    for (let i = 0; i < h.length; i++) {
      tops.push(y)
      y += h[i]
    }
    maxY = Math.max(0, y - DEV.H)
    sy = 0
    this.applyScroll()
  },
  onScroll(e) {
    // Vela list "scroll" reports the absolute offset in scrollY (verified on the vela-watch-5.0 emulator)
    sy = e.scrollY
    if (sy < 0) sy = 0
    if (sy > maxY) sy = maxY
    if (this.pressId) {
      // removing a class does not reset transform on Vela, so hand over to p-out (scale 1)
      this.relId = this.pressId
      this.pressId = ''
    }
    this.applyScroll()
    if (this.onScrolled) this.onScrolled(sy, maxY)
  },
  onTop() {
    sy = 0
    this.applyScroll()
    if (this.onScrolled) this.onScrolled(sy, maxY)
  },
  onBottom() {
    sy = maxY
    this.applyScroll()
    if (this.onScrolled) this.onScrolled(sy, maxY)
  },
  applyScroll() {
    this.siSt = siStyle(SI, maxY > 0 ? sy / maxY : 0)
    if (this.items && this.tlcBase >= 0) {
      for (let i = 0; i < this.items.length; i++) {
        const j = this.tlcBase + i
        const top = tops[j] - sy
        const st = this.tlcOn ? tlcStyle(top, top + hts[j]) : IDENT
        const it = this.items[i]
        if (!it.st || it.st.opacity !== st.opacity || it.st.transform !== st.transform) it.st = st
      }
    }
  },
