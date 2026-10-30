// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
// Optional @system.audio adapter for the media controls (declare system.audio in manifest features).
// No timeupdate event exists: progress is polled with getPlayState every 1000 ms while the page is visible and playing.
import audio from '@system.audio'
let mdaTimer=null,mdaDur=0,mdaPos=0,mdaAt=0,mdaPlaying=false,mdaEnded=false
