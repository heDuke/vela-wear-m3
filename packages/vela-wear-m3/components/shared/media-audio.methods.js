// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Provides mdOnPlay / mdOnPause / mdOnSeek for the media controls; the page keeps mdOnPrev / mdOnNext.
// mdaOpen(src, {title, artist, album}) binds audio events; mdaStop() stops playback (call it in pageDestroy).
mdaOpen(src,meta){
 const vm=this;mdaDur=0;mdaPos=0;mdaPlaying=false;mdaEnded=false
 try{
  audio.onplay=()=>{mdaPlaying=true;vm.mdSetLoading(false);vm.mdSetPlaying(true);vm.mdaPoll()}
  audio.onpause=()=>{mdaPlaying=false;vm.mdSetPlaying(false);vm.mdaTick();vm.mdaUnpoll()}
  audio.onstop=()=>{mdaPlaying=false;vm.mdSetPlaying(false);vm.mdaUnpoll()}
  audio.onended=()=>vm.mdaEnd()
  audio.ondurationchange=()=>{try{if(audio.duration>0)mdaDur=audio.duration}catch(e){}}
  audio.onloadeddata=()=>{vm.mdSetLoading(false)}
  audio.onerror=()=>{mdaPlaying=false;vm.mdSetLoading(false);vm.mdSetPlaying(false);vm.mdaUnpoll();if(vm.mdOnAudioError)vm.mdOnAudioError()}
  audio.src=src;if(meta)audio.meta=meta
 }catch(e){if(vm.mdOnAudioError)vm.mdOnAudioError(e)}
 this.mdSetProgress(0)
},
// After COMPLETED, play() alone restarts at the end (emulator: STARTED, position stays = duration, no new ended event),
// so rewind first.
mdOnPlay(){try{if(mdaEnded){mdaEnded=false;mdaPos=0;audio.currentTime=0;this.mdSetProgress(0)}if(!mdaPlaying&&!mdaDur)this.mdSetLoading(true);audio.play()}catch(e){this.mdSetLoading(false)}},
mdOnPause(){try{audio.pause()}catch(e){}},
mdOnSeek(sec){if(mdaEnded&&sec>0)return;mdaEnded=false;const now=mdaPos+(mdaPlaying&&mdaAt?(Date.now()-mdaAt)/1000:0),t=Math.max(0,mdaDur?Math.min(mdaDur,now+sec):now+sec)
 try{audio.currentTime=t}catch(e){}mdaPos=t;mdaAt=Date.now();if(mdaDur)this.mdSetProgress(t/mdaDur)},
mdaTick(){const vm=this;try{audio.getPlayState({success(d){if(!d)return;mdaPos=+d.currentTime||0;mdaAt=Date.now();if(+d.duration>0)mdaDur=+d.duration
 vm.mdSetProgress(mdaDur?mdaPos/mdaDur:(+d.percent||0)/100)
 // onended is not delivered on every build (emulator: COMPLETED in the log, polling kept running): end on position too
 if(mdaPlaying&&mdaDur>0&&mdaPos>0&&mdaPos>=mdaDur)vm.mdaEnd()}})}catch(e){}},
mdaEnd(){if(mdaEnded)return;mdaPlaying=false;mdaEnded=true;this.mdSetPlaying(false);this.mdSetProgress(1);this.mdaUnpoll();if(this.mdOnEnded)this.mdOnEnded()},
mdaPoll(){if(mdaTimer||!mdVisible||!mdaPlaying)return;mdaTimer=setInterval(()=>this.mdaTick(),1000);this.mdaTick()},
mdaUnpoll(){if(mdaTimer)clearInterval(mdaTimer);mdaTimer=null},
mdaShow(){this.mdaPoll()},
mdaHide(){this.mdaUnpoll()},
mdaStop(){this.mdaUnpoll();mdaPlaying=false;try{audio.stop()}catch(e){}},
