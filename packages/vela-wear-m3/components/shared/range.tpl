    <div class="demo-page step-screen" if="{{demoMode === 'stepper' || demoMode === 'level'}}" onswipe="onPageSwipe">
<!-- #if !round -->
      <div class="demo-nav"><div class="nav-back" onclick="goBack"><image class="nav-arrow" src="/common/img/back_onSurface_24.png"></image></div><text class="demo-title">音量</text></div>
<!-- #endif -->
      <div class="step-body">
        <div class="step-zone step-top"><div class="step-key {{stepEnabled && stepValue < 10 ? 'step-key-on' : 'step-key-off'}}" style="{{feedback.plus || {opacity:1}}}" ontouchstart="rangePress('plus')" ontouchend="rangeRelease('plus')" ontouchmove="cancelPress" onclick="stepClick('plus')"><image class="ic24" src="{{stepEnabled && stepValue < 10 ? '/common/img/add_primary_24.png' : '/common/img/add_disabled_24.png'}}"></image></div></div>
        <div class="step-content" onclick="toggleStepEnabled"><text class="demo-value {{stepEnabled ? '' : 'step-content-disabled'}}">{{stepValue}}</text><text class="demo-label">{{stepEnabled ? '音量 · 点数值禁用' : '已禁用 · 点数值启用'}}</text></div>
        <div class="step-zone step-bottom"><div class="step-key {{stepEnabled && stepValue > 0 ? 'step-key-on' : 'step-key-off'}}" style="{{feedback.minus || {opacity:1}}}" ontouchstart="rangePress('minus')" ontouchend="rangeRelease('minus')" ontouchmove="cancelPress" onclick="stepClick('minus')"><image class="ic24" src="{{stepEnabled && stepValue > 0 ? '/common/img/remove_primary_24.png' : '/common/img/remove_disabled_24.png'}}"></image></div></div>
      </div>
<!-- #component level-indicator {} -->

    </div>
