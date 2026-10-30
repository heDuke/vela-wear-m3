// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// VolumeViewModel.displayIndicatorEvents = merge(userActionEvents, volumeUiState.drop(1)): the value read on show only
// sets the badge; every later onMediaValueChanged (hardware keys, other apps, mdvSet) shows the level indicator.
// mdShow()/mdHide() call mdvShow()/mdvHide(); the listener is removed while the page is hidden.
mdvShow(){const vm=this;mdvBound=true
 try{volume.getMediaValue({success(d){if(mdvBound&&d&&+d.value>=0)vm.mdSetVolume(+d.value,false)}})}catch(e){}
 try{volume.onMediaValueChanged=r=>{if(mdvBound&&r&&+r.value>=0)vm.mdSetVolume(+r.value,true)}}catch(e){}},
mdvHide(){mdvBound=false;try{volume.onMediaValueChanged=null}catch(e){}},
// user action (e.g. a P3 volume screen or page buttons): set the system media volume and show the indicator
mdvSet(v){v=+v;if(!(v>=0))v=0;if(v>1)v=1;v=Math.round(v*100)/100;try{volume.setMediaValue({value:v})}catch(e){}this.mdSetVolume(v,true)},
