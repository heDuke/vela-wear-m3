<!-- #set mdVs = mdVsOpts(@{content}) -->
<!-- Horologist VolumeScreen: androidx Stepper (VolumeUp / VolumeDown) + StepperLevelIndicator + DeviceButton or "音量".
     Put it directly inside the page root <div class="page">; the level (arc on round, bar elsewhere) stays visible. -->
<!-- #component media-volume-level {} -->
<div class="step-body">
  <div class="step-zone step-top"><div class="step-key {{stepEnabled && stepValue < stepMax ? 'step-key-on' : 'step-key-off'}}" style="{{stepEnabled && stepValue < stepMax ? feedback.plus : keyIdle}}" ontouchstart="rangePress('plus')" ontouchend="rangeRelease('plus')" ontouchmove="cancelPress" onclick="stepClick('plus')"><image class="ic24" src="{{stepEnabled && stepValue < stepMax ? '/common/img/md_vs_up_24.png' : '/common/img/md_vs_up_24d.png'}}"></image></div></div>
  <div class="step-content">
<!-- #if mdVs.content === 'device' -->
    <div class="vs-dev" style="{{volDevSt}}" onclick="volDeviceTap">
<!-- #if mdVs.icon -->
      <image class="vs-dic" src="{{volDevIc}}"></image>
<!-- #endif -->
      <text class="vs-dn" style="{{volNameSt}}">{{volName}}</text>
    </div>
<!-- #else -->
    <text class="vs-lab">音量</text>
<!-- #endif -->
  </div>
  <div class="step-zone step-bottom"><div class="step-key {{stepEnabled && stepValue > 0 ? 'step-key-on' : 'step-key-off'}}" style="{{stepEnabled && stepValue > 0 ? feedback.minus : keyIdle}}" ontouchstart="rangePress('minus')" ontouchend="rangeRelease('minus')" ontouchmove="cancelPress" onclick="stepClick('minus')"><image class="ic24" src="{{stepEnabled && stepValue > 0 ? '/common/img/md_vs_down_24.png' : '/common/img/md_vs_down_24d.png'}}"></image></div></div>
</div>
