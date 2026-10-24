// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
import router from '@system.router'
import vibrator from '@system.vibrator'
import { tlcStyle, IDENT, siStyle, pad2, DEV, scrollFraction, timeGlyphs } from '../../common/m3.js'
// page-local, non-UI state lives at module level, not in the ViewModel (SPEC §9.2)
const SI = $[siJs()]
let clockTimer = null
let sy = 0 // scroll offset of the list (px)
let maxY = 0 // content height - viewport height
let tops = [] // top of every list-item (px)
let hts = [] // height of every list-item (px)

let pending = []
let scrollTimer = null
let shownPos = 0
let scrollGoal = 0
let backTimer = null
let overlayLock = false
let horizontalControl = false

const PAGE_LAYOUT = []
let active = false
let scrollDirty = false
let lastScrollFlush = 0
let lastVisible = []
let motionTimer = null
let motions = {}
let holds = {}
// Exact critically damped spring x(t)=target+(c1+c2*t)e^(-wt), c1=x0-target, c2=v0+w*c1 (t from the last retarget).
// shown=1 renders at least one display frame (1000/60ms) of progress, like the first Compose frame after the event.
const springAt=(q,now,shown)=>{const w=Math.sqrt(q.ex),e=Math.max(now-q.t0,shown?1000/60:0)/1000,c1=q.x0-q.target,c2=q.v0+w*c1,d=Math.exp(-w*e)
  const x=q.target+(c1+c2*e)*d,v=(c2-w*(c1+c2*e))*d;return {x,v,done:Math.abs(x-q.target)<.001&&Math.abs(v)<.02}}


let lastClock = ""

let rowRanges = {}
