// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
  openHorizontalPager(){this.demoMode='hpager';this.updatePages()},
  openVerticalPager(){this.demoMode='vpager';this.updatePages()},
  updatePages(offset=0){const p=pagerState(this.pageIndex,this.pageCount,offset,this.demoMode==='vpager',this.pageWindow);this.pageWindow=p.hidden;this.dots=p.dots;this.worm=p.worm;this.pagerBox=p.style;this.pagerBackground=p.src},
  previousPage(){if(this.pageIndex>0){this.pageIndex--;this.updatePages()}},nextPage(){if(this.pageIndex<this.pageCount-1){this.pageIndex++;this.updatePages()}},
  togglePageCount(){this.pageCount=this.pageCount===8?3:8;this.pageIndex=Math.min(this.pageIndex,this.pageCount-1);this.pageWindow=0;this.updatePages()},
  pagerOwnSwipe(){},
  pagerStart(e){this.controlStart();if(pagerTimer)clearInterval(pagerTimer);pagerTimer=null;pagerTouch=e.touches&&e.touches[0];pagerDelta=0},
  pagerMove(e){const t=e.touches&&e.touches[0];if(!pagerTouch||!t)return;const vertical=this.demoMode==='vpager',size=vertical?$[Math.round(H*.4)]:$[CW-dp(20)];pagerDelta=(vertical?t.clientY-pagerTouch.clientY:t.clientX-pagerTouch.clientX)/size;pagerDelta=Math.max(-1,Math.min(1,pagerDelta));if(this.pageIndex===0&&pagerDelta>0||this.pageIndex===this.pageCount-1&&pagerDelta<0)pagerDelta*=.2;this.paintPager(pagerDelta)},
  paintPager(delta){this.updatePages(-delta);const vertical=this.demoMode==='vpager',side=delta>0?-1:1,size=vertical?$[Math.round(H*.4)]:$[CW-dp(20)];this.pagerNeighbor=Math.max(0,Math.min(this.pageCount-1,this.pageIndex+side));this.pagerNeighborStyle={opacity:delta&&this.pagerNeighbor!==this.pageIndex?1:0,transform:JSON.stringify(vertical?{translateY:Math.round((side+delta)*size)+'px'}:{translateX:Math.round((side+delta)*size)+'px'})};this.pageContentStyle={opacity:1-Math.abs(delta)*.6,transform:JSON.stringify(vertical?{translateY:Math.round(delta*$[Math.round(H*.4)])+'px'}:{translateX:Math.round(delta*$[CW-dp(20)])+'px'})}},
  pagerEnd(){if(!pagerTouch)return;pagerTouch=null;const from=pagerDelta,direction=Math.abs(from)>=.25?(from>0?1:-1):0,target=direction;let t=0;pagerTimer=setInterval(()=>{t=Math.min(1,t+.16);const delta=from+(target-from)*(1-Math.pow(1-t,3));this.paintPager(delta);if(t===1){clearInterval(pagerTimer);pagerTimer=null;this.pageIndex=Math.max(0,Math.min(this.pageCount-1,this.pageIndex-direction));pagerDelta=0;this.paintPager(0);this.controlEnd()}},33)},
  demoClose(){this.pageHide();horizontalControl=false;this.pageContentStyle={};this.pagerNeighborStyle={opacity:0}},
  pageHide(){if(pagerTimer)clearInterval(pagerTimer);pagerTimer=null;pagerTouch=null;pagerDelta=0},
