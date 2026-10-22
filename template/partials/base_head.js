import router from '@system.router'
import vibrator from '@system.vibrator'
import { tlcStyle, IDENT, siStyle, pad2, DEV } from '../../common/m3.js'
// page-local, non-UI state lives at module level, not in the ViewModel (SPEC §9.2)
const SI = $[siJs()]
let clockTimer = null
let sy = 0 // scroll offset of the list (px)
let maxY = 0 // content height - viewport height
let tops = [] // top of every list-item (px)
let hts = [] // height of every list-item (px)
