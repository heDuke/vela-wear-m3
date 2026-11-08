// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Public: volSetup({max,value,output,name,binding}) volSet(v) volUp() volDown() volSetOutput('headphones'|'watch',name)
// volShow() volHide() (call from onShow / onHide). Emits (if defined): volOnChange(v) volOnDevice().
// Stepper press / long-press repeat (500 ms, then every 60 ms) and button feedback come from range.js; its
// rangeChanged hook routes every step here. The level indicator is always visible on this screen (no 2.5 s hide).
volSetup(o){o=o||{};if(+o.max>0)this.stepMax=Math.round(+o.max);if('value' in o)this.stepValue=this.volClamp(o.value);vsBind=o.binding!==false
 this.volSetOutput(o.output||'headphones',o.name);this.volPaint(true)},
volClamp(v){v=Math.round(+v);if(!(v>=0))v=0;return Math.min(v,this.stepMax)},
volSet(v){v=this.volClamp(v);if(v===this.stepValue)return;this.stepValue=v;this.rangeChanged(v)},
volUp(){this.stepUp()},
volDown(){this.stepDown()},
rangeChanged(v){this.volPaint(false);if(vsBind){try{vsVolume.setMediaValue({value:Math.round(v/this.stepMax*100)/100})}catch(e){}}if(this.volOnChange)this.volOnChange(v)},
volPaint(snap){if(MDC.lv)this.mdLvTo(this.stepValue/this.stepMax,snap)},
// DeviceButton width = content (icon + name) clamped to the screen width minus the side margins; the name wraps to
// two lines with an ellipsis (Button maxLines 2) when it does not fit on one; bands keep one line + ellipsis [adapt].
volSetOutput(kind,name){const V=MDC.vs;kind=kind==='watch'?'watch':'headphones';this.volName=name||(kind==='watch'?'手表扬声器':'耳机')
 if(!V||V.content!=='device')return;if(V.icons)this.volDevIc=V.icons[kind]
 const tw=Math.ceil(mdTextW(this.volName,V.fs,true)),inner=V.max-V.pad-V.ic,w=Math.min(tw,inner)
 this.volNameSt={width:w+'px',height:(tw>inner&&V.lines>1?2:1)*V.lh+'px'};this.volDevSt={width:(w+V.pad+V.ic)+'px'}},
volDeviceTap(){if(this.volOnDevice)this.volOnDevice()},
volShow(){mdVisible=true;mdLv.on=true;this.mdLvCls='vs-lv';this.mdLvSt={opacity:1};this.volPaint(true);vsLive=true;if(!vsBind)return;const vm=this
 const take=(r,snap)=>{if(!vsLive||!r||!(+r.value>=0))return;const v=vm.volClamp(+r.value*vm.stepMax);if(v===vm.stepValue&&!snap)return;vm.stepValue=v;vm.volPaint(snap)}
 try{vsVolume.getMediaValue({success(d){take(d,true)}})}catch(e){}
 try{vsVolume.onMediaValueChanged=r=>take(r,false)}catch(e){}},
volHide(){vsLive=false;mdVisible=false;this.cancelPress();this.mdLvStop();if(vsBind){try{vsVolume.onMediaValueChanged=null}catch(e){}}},
