<!-- #set mdCtl = mdSides(@{left},@{right}) -->
<div class="md-ctl">
<!-- #if pill -->
<!-- #component media-play-pause {"shape":"@{shape}","ring":"@{ring}","steps":"@{steps}","rotate":"@{rotate}"} -->
<div class="md-row">
<!-- #endif -->
<div class="md-side md-sl {{mdTr}} {{mdLCls}}" style="{{mdLSt}}" ontouchstart="mdPrevDown" ontouchend="mdUp" ontouchmove="mdCancel" onclick="mdPrevTap"><image class="$[mdCtl.lIc]" src="{{mdLIcon}}"></image></div>
<!-- #if !pill -->
<!-- #component media-play-pause {"shape":"@{shape}","ring":"@{ring}","steps":"@{steps}","rotate":"@{rotate}"} -->
<!-- #endif -->
<div class="md-side md-sr {{mdTr}} {{mdRCls}}" style="{{mdRSt}}" ontouchstart="mdNextDown" ontouchend="mdUp" ontouchmove="mdCancel" onclick="mdNextTap"><image class="$[mdCtl.rIc]" src="{{mdRIcon}}"></image></div>
<!-- #if pill -->
</div>
<!-- #endif -->
</div>
