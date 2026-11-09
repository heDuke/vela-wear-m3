<!-- #set mdSet = mdSetOpts(@{left},@{right}) -->
<!-- #if mdSet.left!=='none' -->
<div class="md-cl" ontouchstart="mdSbDown('mdOut')" ontouchend="release('mdOut')" ontouchmove="cancelPress" onclick="mdOutTap"><div class="md-sb {{mdSetCls}}" style="{{feedback.mdOut}}"><image class="md-sic" src="{{mdOutIc}}"></image></div>
<!-- #if mdSet.left==='output' -->
<image class="md-badge" if="{{mdBadge}}" src="{{mdBadge}}"></image>
<!-- #endif -->
</div>
<!-- #endif -->
<!-- #if mdSet.right!=='none' -->
<div class="md-cr" ontouchstart="mdSbDown('mdMore')" ontouchend="release('mdMore')" ontouchmove="cancelPress" onclick="mdMoreTap"><div class="md-sb {{mdSetCls}}" style="{{feedback.mdMore}}"><image class="md-sic" src="{{mdMoreIc}}"></image></div></div>
<!-- #endif -->
