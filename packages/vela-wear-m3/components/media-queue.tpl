<!-- Horologist PlaylistStreamingScreen media items: FilledTonalButton (label 1 line ellipsis + secondary label), optional
     current-track highlight (filled primary) and artwork (watch only). header:true adds the EntityScreen title header. -->
<!-- #if @{header} -->
<div class="ml-hd"><text class="ml-t">{{maTitle}}</text><text class="ml-a">{{maArtist}}</text></div>
<!-- #endif -->
<div for="{{mqItems}}" class="mq-it {{$item.cls}}" style="{{feedback[$item.fid]}}" ontouchstart="sqPress($item.fid,$[dp(26)],$[dp(8)])" ontouchend="release($item.fid)" ontouchmove="cancelPress" onclick="mqTap($item.id)">
<!-- #if !pill -->
<image class="mq-art" if="{{$item.art}}" src="{{$item.art}}"></image>
<!-- #endif -->
<div class="mq-tx"><text class="mq-n {{$item.c1}}">{{$item.title}}</text><text class="mq-s {{$item.c2}}">{{$item.artist}}</text></div>
</div>
