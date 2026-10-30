<!-- #set mdPP = mdOpts(@{shape},@{ring},@{steps},@{rotate}) -->
<div class="md-pp {{mdTr}}" style="{{mdMSt}}" ontouchstart="mdPlayDown" ontouchend="mdUp" ontouchmove="mdCancel" onclick="mdPlayTap">
<!-- #if mdPP.ring==='wavy' -->
<div class="md-ring" style="{{mdRingSt}}">$[mdLobes()]</div>
<!-- #elif mdPP.ring==='circle' -->
<div class="md-ring" style="{{mdRingSt}}"><progress class="md-arc" type="arc" percent="{{mdPct}}"></progress></div>
<!-- #endif -->
<div class="md-load" if="{{mdLoading}}"><progress class="md-larc" type="arc" percent="25"></progress></div>
<!-- #if mdPP.shape==='scallop' -->
<image class="md-sc {{mdScCls}}" style="{{mdScSt}}" src="{{mdScSrc}}"></image>
<!-- #endif -->
<div class="md-pill {{mdTr}} {{mdPillCls}}" style="{{mdPillSt}}"><image class="md-ic" src="{{mdIcon}}"></image></div>
</div>
