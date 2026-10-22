    <!-- AlertDialog: icon, title, text, dismiss (60dp tonal r18) + confirm (63x54 pill rotated -45°) -->
    <div class="ovl {{dlgOut ? 'ovl-out' : 'ovl-in'}}" if="{{dlgOn}}">
      <div class="dlg-col">
        <image class="ic24" src="/common/img/delete_onBackground_24.png"></image>
        <text class="t-titleM c-onS dlg-title">删除这条记录？</text>
        <text class="t-bodyM c-onSV dlg-text">删除后无法恢复</text>
      </div>
      <div class="dlg-x {{pressId === 'dx' ? 'p-in' : ''}}" ontouchstart="press('dx')" ontouchend="release('dx')" onclick="dlgCancel">
        <image class="ic28" src="/common/img/close_primary_28.png"></image>
      </div>
      <div class="dlg-ok {{pressId === 'dk' ? 'dlg-okp' : ''}}" ontouchstart="press('dk')" ontouchend="release('dk')" onclick="dlgOk"></div>
      <image class="dlg-okic" src="/common/img/check_onPrimary_28.png" onclick="dlgOk"></image>
    </div>
