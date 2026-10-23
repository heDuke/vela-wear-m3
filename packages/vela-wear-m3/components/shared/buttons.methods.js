// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
morphPress(){this.press('morph')},morphRelease(){this.release('morph')},buttonMorphPress(){this.press('buttonMorph')},buttonMorphRelease(){this.release('buttonMorph')},
onMotionFrame(id,p){const frame=$[enhanced]?Math.round(p*18):p>.5?18:0;if(id==='morph')this.morphStatic=MORPH[frame];if(id==='buttonMorph')this.buttonMorphStatic=BUTTON_MORPH[frame];if(id==='compact')this.compactSrc=COMPACT[frame]},
togglePlaying(){this.playing=!this.playing;const target=this.playing?9:0;if(playTimer)clearInterval(playTimer);if(playPosition===target)return;playTimer=setInterval(()=>{playPosition+=target>playPosition?1:-1;this.playSrc=PLAY[playPosition];if(playPosition===target){clearInterval(playTimer);playTimer=null}},33)},
pageHide(){if(playTimer)clearInterval(playTimer);playTimer=null;playPosition=this.playing?9:0;this.playSrc=PLAY[playPosition];this.morphStatic=MORPH[0];this.buttonMorphStatic=BUTTON_MORPH[0];this.compactSrc=COMPACT[0]},
