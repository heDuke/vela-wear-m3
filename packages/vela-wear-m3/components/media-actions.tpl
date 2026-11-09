<!-- Horologist EntityScreen header + buttons row (Wear M3 ButtonGroup of 3 IconToggleButton: like / shuffle / repeat,
     animatedShapes: unchecked CornerFull, checked shapes.medium, pressed shapes.small) + "接下来播放" Card.
     Compose: MediaColumn { PlayerScreen(..) MediaActions() MediaQueue() } (one vertical scroll below the player). -->
<div class="ml-hd"><text class="ml-t">{{maTitle}}</text><text class="ml-a">{{maArtist}}</text></div>
<div class="ma-row">
<div class="ma-b {{maLikeCls}}" style="{{feedback.maLike}}" ontouchstart="maDown('maLike')" ontouchend="release('maLike')" ontouchmove="cancelPress" onclick="maTap('like')"><image class="ic24" src="{{maLikeIc}}"></image></div>
<div class="ma-b {{maShufCls}}" style="{{feedback.maShuf}}" ontouchstart="maDown('maShuf')" ontouchend="release('maShuf')" ontouchmove="cancelPress" onclick="maTap('shuffle')"><image class="ic24" src="{{maShufIc}}"></image></div>
<div class="ma-b {{maRepCls}}" style="{{feedback.maRep}}" ontouchstart="maDown('maRep')" ontouchend="release('maRep')" ontouchmove="cancelPress" onclick="maTap('repeat')"><image class="ic24" src="{{maRepIc}}"></image></div>
</div>
<div class="ma-card" style="{{feedback.maNext}}" ontouchstart="press('maNext')" ontouchend="release('maNext')" ontouchmove="cancelPress" onclick="maTap('next')">
<!-- #if !pill -->
<image class="ma-ci" src="/common/img/md_ma_queue_24.png"></image>
<!-- #endif -->
<div class="ma-cc"><text class="ma-ct">接下来播放</text><text class="ma-cn">{{maNext}}</text></div>
</div>
