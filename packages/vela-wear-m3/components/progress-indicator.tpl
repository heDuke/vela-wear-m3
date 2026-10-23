<list-item type="progress" class="progress-stage">
<text class="progress-value" if="{{kind==='arcLoading'}}">正在加载</text>
<div class="spin-wrap" if="{{kind === 'indeterminate' && loadingVisible}}">
<!-- #if enhanced -->
<image-animator id="spinAnim" class="ind-circle" images="{{spinFrames}}" duration="5000ms" iteration="infinite"></image-animator>
<!-- #else -->
<image class="ind-circle" src="$[JSON.parse(images('indeterminate'))[20]]"></image>
<!-- #endif -->
</div>
<image class="ind-circle" if="{{kind === 'indeterminate' && !loadingVisible}}" src="$[JSON.parse(images('indeterminate'))[20]]"></image>
<!-- #if enhanced -->
<image-animator id="arcAnim" class="arc-loading" if="{{kind === 'arcLoading' && loadingVisible}}" images="{{arcFrames}}" duration="2000ms" iteration="infinite"></image-animator>
<!-- #else -->
<image class="arc-loading {{loadingVisible ? 'arc-basic-pulse' : ''}}" if="{{kind === 'arcLoading'}}" src="$[JSON.parse(images('arcLoading'))[12]]"></image>
<!-- #endif -->
<image class="circle-image {{kind==='ringLarge' ? 'large-image' : kind==='ringThin' ? 'small-image' : ''}}" if="{{kind !== 'indeterminate' && kind !== 'arcLoading' && kind !== 'linear' && kind !== 'linearThick'}}" src="{{progressSrc}}"></image>
<image class="linear-image" if="{{kind === 'linear' || kind === 'linearThick'}}" src="{{progressSrc}}"></image>
<text class="progress-value" if="{{kind!=='arcLoading'}}">{{kind === 'indeterminate' || kind === 'arcLoading' ? '正在加载' : pct+'%'}}</text>
</list-item>
