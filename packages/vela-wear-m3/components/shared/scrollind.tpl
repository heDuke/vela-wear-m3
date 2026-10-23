<!-- #if round -->
    <image class="si-track" if="{{siVisible}}" src="/common/img/scroll_track_arc.png"></image>
    <image class="si-thumb" if="{{siVisible}}" src="{{siSrc}}" style="{{siSt}}"></image>
<!-- #else -->
    <div class="si-track" if="{{siVisible}}"></div>
    <div class="si-thumb" if="{{siVisible}}" style="{{siSt}}"></div>
<!-- #endif -->
