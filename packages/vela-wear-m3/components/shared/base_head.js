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


let lastClock = ""

let rowRanges = {}
