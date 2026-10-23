      <list-item type="back" class="li-nav" onswipe="onPageSwipe">
<!-- #if !round -->
        <div class="nav-back {{pressId === 'back' ? 'nav-in' : 'nav-out'}}" ontouchstart="press('back')" ontouchend="release('back')" onclick="goBack">
          <image class="nav-arrow" src="/common/img/back_onSurface_24.png"></image>
        </div>
<!-- #endif -->
<!-- #if !pill -->
        <text class="nav-title">{{pageTitle}}</text>
<!-- #endif -->
      </list-item>
