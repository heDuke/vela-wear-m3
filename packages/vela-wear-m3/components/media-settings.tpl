<!-- #set mdSet = mdSetOpts(@{left},@{right}) -->
<!-- #if mdSet.left!=='none' -->
<div class="md-cl" onclick="mdOutTap"><div class="md-sb {{mdSetCls}}"><image class="md-sic" src="{{mdOutIc}}"></image></div>
<!-- #if mdSet.left==='output' -->
<image class="md-badge" if="{{mdBadge}}" src="{{mdBadge}}"></image>
<!-- #endif -->
</div>
<!-- #endif -->
<!-- #if mdSet.right!=='none' -->
<div class="md-cr" onclick="mdMoreTap"><div class="md-sb {{mdSetCls}}"><image class="md-sic" src="{{mdMoreIc}}"></image></div></div>
<!-- #endif -->
