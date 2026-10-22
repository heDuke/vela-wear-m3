      <!-- CompactButton "返回": the emulator has no back gesture; on a real device swipe-right also calls onBackPress -->
      <list-item type="back" class="li-48">
        <div class="cbtn bt {{pressId === 'back' ? 'p-in' : relId === 'back' ? 'p-out' : ''}}" ontouchstart="press('back')" ontouchend="release('back')" onclick="goBack">
          <text class="t-labelM c-onS">返回</text>
        </div>
      </list-item>
