<!-- StepperLevelIndicator: rotated fill/track arcs under two static black masks, near-min/max dots on top. Place it
     before the rest of the screen's content (it relies on a black background and later siblings drawing above it). -->
<image class="lv-ind" src="{{lvIndSrc}}" style="{{lvInd}}"></image>
<image class="lv-trk" src="{{lvTrkSrc}}" style="{{lvTrk}}"></image>
<image class="lv-mask-low" src="/common/img/lv_mask_low.png"></image>
<image class="lv-mask-high" src="/common/img/lv_mask_high.png"></image>
<div class="lv-dot {{stepEnabled ? 'lv-dot-ind' : 'lv-dot-ind-dis'}}" style="{{lvDotInd}}"></div>
<div class="lv-dot {{stepEnabled ? 'lv-dot-trk' : 'lv-dot-trk-dis'}}" style="{{lvDotTrk}}"></div>
