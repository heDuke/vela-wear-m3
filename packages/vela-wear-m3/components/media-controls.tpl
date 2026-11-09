<!-- #set mdCtl = mdSides(@{left},@{right}) -->
<div class="md-ctl">
<!-- #if pill -->
<!-- #component media-play-pause {"shape":"@{shape}","ring":"@{ring}","steps":"@{steps}","rotate":"@{rotate}"} -->
<div class="md-row">
<!-- #endif -->
<div class="md-side md-sl {{mdTr}} {{mdLCls}}" style="{{mdLSt}}" ontouchstart="mdPrevDown" ontouchend="mdUp" ontouchmove="mdCancel" onclick="mdPrevTap">
<!-- #if mdCtl.lLot -->
<stack class="md-lb"><image class="md-ic {{mdLS}}" src="{{mdLIcon}}"></image>$[mdLotImgs('l',mdCtl.left)]</stack>
<!-- #else -->
<image class="$[mdCtl.lIc]" src="{{mdLIcon}}"></image>
<!-- #endif -->
</div>
<!-- #if !pill -->
<!-- #component media-play-pause {"shape":"@{shape}","ring":"@{ring}","steps":"@{steps}","rotate":"@{rotate}"} -->
<!-- #endif -->
<div class="md-side md-sr {{mdTr}} {{mdRCls}}" style="{{mdRSt}}" ontouchstart="mdNextDown" ontouchend="mdUp" ontouchmove="mdCancel" onclick="mdNextTap">
<!-- #if mdCtl.rLot -->
<stack class="md-lb"><image class="md-ic {{mdRS}}" src="{{mdRIcon}}"></image>$[mdLotImgs('r',mdCtl.right)]</stack>
<!-- #else -->
<image class="$[mdCtl.rIc]" src="{{mdRIcon}}"></image>
<!-- #endif -->
</div>
<!-- #if pill -->
</div>
<!-- #endif -->
</div>
