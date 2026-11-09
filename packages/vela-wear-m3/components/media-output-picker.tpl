<!-- Output picker rebuilt from Wear M3 primitives (the official one is the closed-source Settings MEDIA_OUTPUT panel):
     ListHeader + Button per device (current = filled primary, others = filledTonal) + footnote. UI only: Vela cannot
     enumerate or switch audio outputs; selection emits opOnSelect(id). Wrap in a vertical <scroll class="ml-scroll">. -->
<div class="op-hd"><text class="op-t">{{opTitle}}</text></div>
<div for="{{opItems}}" class="op-it {{$item.cls}}" style="{{feedback[$item.fid]}}" ontouchstart="sqPress($item.fid,$[dp(26)],$[dp(8)])" ontouchend="release($item.fid)" ontouchmove="cancelPress" onclick="opTap($item.id)">
<!-- #if !pill -->
<image class="op-ic" src="{{$item.ic}}"></image>
<!-- #endif -->
<div class="op-tx"><text class="op-n {{$item.c1}}">{{$item.name}}</text><text class="op-s {{$item.c2}}" if="{{$item.current}}">当前</text></div>
</div>
<text class="op-ft" if="{{opFoot}}">{{opFoot}}</text>
