// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
mdTr:'md-tin',mdRing:MDC.lobes?[0,1,2,3,4,5,6,7,8,9].map(k=>mdLobe(k,0,MDC.steps)):[],mdPct:0,mdRingSt:{opacity:1},mdLoading:false,
mdScSrc:MDC.sc||'',mdScSt:{opacity:1},mdScCls:'',mdPillCls:MDC.shape==='round'?'md-pon':'md-poff',mdPillSt:{width:$[mdGeo.pill64]+'px'},mdIcon:MDC.ic?MDC.ic.play:'',
mdMSt:$[mdStyle(1)],mdLSt:$[mdStyle(0)],mdRSt:$[mdStyle(2)],mdLCls:'md-son',mdRCls:'md-son',
mdLIcon:MDC.l?MDC.l.ic:'',mdRIcon:MDC.r?MDC.r.ic:'',
mdInfo:'ready',mdTitle:'',mdArtist:'',mdOver:false,mdAOver:false,mdMq:false,mdNoneText:'未在播放',
