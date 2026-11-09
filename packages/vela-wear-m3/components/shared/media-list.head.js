// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// P4 media pages (media-actions / media-queue / media-output-picker): build-time constants + module state (ml* names).
// Heights are the px rows of the scroll column, for setLayout (ScrollIndicator). Icons are literal paths (gen.js copies
// only referenced PNGs).
// IconToggleButton radii (px): unchecked CornerFull (h/2), checked shapes.medium 18dp, pressed shapes.small 8dp
const ML={rOff:$[dp(pill?22:26)],rOn:$[dp(18)],rP:$[dp(8)],hd:$[dp(56)],row:$[dp(pill?44:52)+dp(8)],card:$[dp(74)+dp(4)],item:$[dp(52)+dp(4)],padb:$[Math.round(H*.18)],
  ic:{like:'/common/img/md_ma_liket_24.png',liked:'/common/img/md_ma_liked_24.png',shuf:'/common/img/md_ma_shuf_24.png',shuft:'/common/img/md_ma_shuft_24.png',
  rep:'/common/img/md_ma_rep_24.png',rept:'/common/img/md_ma_rept_24.png',rep1:'/common/img/md_ma_rep1_24.png'},
 op:{phone:['/common/img/md_op_phone_24.png','/common/img/md_op_phonet_24.png'],watch:['/common/img/md_op_watch_24.png','/common/img/md_op_watcht_24.png'],
  headphones:['/common/img/md_op_hp_24.png','/common/img/md_op_hpt_24.png'],speaker:['/common/img/md_op_spk_24.png','/common/img/md_op_spkt_24.png'],
  bluetooth:['/common/img/md_op_bt_24.png','/common/img/md_op_btt_24.png']}}
const mlS={liked:false,shuffle:false,repeat:'off',items:[],cur:null,devices:[]}
