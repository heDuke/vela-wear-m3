<!-- Horologist PlayerScreen: MediaInfo (top) + controls (middle) + settings row (bottom) + VolumeLevelIndicator + TimeText.
     Put it directly inside the page root <div class="page">. -->
<!-- #if @{level} -->
<!-- #component media-volume-level {} -->
<!-- #endif -->
<div class="md-at-info">
<!-- #component media-info {"marquee":"@{marquee}"} -->
</div>
<div class="md-at-ctl">
<!-- #component media-controls {"shape":"@{shape}","ring":"@{ring}","steps":"@{steps}","rotate":"@{rotate}","left":"@{left}","right":"@{right}"} -->
</div>
<!-- #if @{settings} -->
<!-- #component media-settings {"left":"@{settingsLeft}","right":"@{settingsRight}"} -->
<!-- #endif -->
<!-- #component time-text {} -->
