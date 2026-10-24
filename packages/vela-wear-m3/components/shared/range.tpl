    <div class="demo-page step-screen" if="{{demoMode === 'stepper' || demoMode === 'level'}}" onswipe="onPageSwipe">
<!-- #component level-indicator {} -->
      <div class="step-body">
        <div class="step-zone step-top"><div class="step-key {{stepEnabled && stepValue < 10 ? 'step-key-on' : 'step-key-off'}}" style="{{stepEnabled && stepValue < 10 ? feedback.plus : keyIdle}}" ontouchstart="rangePress('plus')" ontouchend="rangeRelease('plus')" ontouchmove="cancelPress" onclick="stepClick('plus')"><image class="ic24" src="{{stepEnabled && stepValue < 10 ? '/common/img/add_primary_24.png' : '/common/img/add_disabled_24.png'}}"></image></div></div>
        <div class="step-content" onclick="toggleStepEnabled"><text class="demo-value {{stepEnabled ? '' : 'step-content-disabled'}}">{{stepValue}}</text><text class="demo-label {{stepEnabled ? '' : 'step-content-disabled'}}">{{stepEnabled ? '音量 · 点数值禁用' : '已禁用 · 点数值启用'}}</text></div>
        <div class="step-zone step-bottom"><div class="step-key {{stepEnabled && stepValue > 0 ? 'step-key-on' : 'step-key-off'}}" style="{{stepEnabled && stepValue > 0 ? feedback.minus : keyIdle}}" ontouchstart="rangePress('minus')" ontouchend="rangeRelease('minus')" ontouchmove="cancelPress" onclick="stepClick('minus')"><image class="ic24" src="{{stepEnabled && stepValue > 0 ? '/common/img/remove_primary_24.png' : '/common/img/remove_disabled_24.png'}}"></image></div></div>
      </div>
    </div>
