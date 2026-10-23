    <div class="ovl {{cfOut ? 'ovl-out' : 'ovl-in'}}" if="{{cfOn}}" onswipe="onPageSwipe">
      <div class="cf-rot"><div class="cf-circle" if="{{!cfBlobOn}}"></div><div class="cf-blob" if="{{cfBlobOn}}"></div></div>
<!-- #if enhanced -->
      <image-animator class="cf-icon" if="{{cfIconOn}}" id="checkAnim" images="{{checkFrames}}" duration="267ms" iteration="1" fillmode="forwards"></image-animator>
<!-- #else -->
      <image if="{{cfIconOn}}" class="cf-icon cf-check-in" src="/common/img/check_primary_52.png"></image>
<!-- #endif -->
<!-- #if round -->
      <image class="cf-txt" if="{{cfTextOn}}" src="/common/img/curved_saved.png"></image>
<!-- #else -->
      <div class="cf-txt"><text class="t-titleM c-onS">已保存</text></div>
<!-- #endif -->
    </div>
