    <!-- Confirmation (SuccessConfirmation): rotated 45° pill + 52dp check + "已保存", pop-in then auto-dismiss -->
    <div class="ovl {{cfOut ? 'ovl-out' : 'ovl-in'}}" if="{{cfOn}}" onclick="hideConfirm">
      <stack class="cf-pop {{cfOut ? '' : 'cf-anim'}}">
        <div class="cf-full"><div class="cf-blob"></div></div>
        <div class="cf-full"><image class="cf-icn" src="/common/img/check_primary_52.png"></image></div>
      </stack>
<!-- #if round -->
      <image class="cf-txt" src="/common/img/curved_saved.png"></image>
<!-- #else -->
      <div class="cf-txt"><text class="t-titleM c-onS">已保存</text></div>
<!-- #endif -->
    </div>
