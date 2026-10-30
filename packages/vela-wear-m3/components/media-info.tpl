<!-- #set mdInf = mdInfoOpts(@{marquee}) -->
<div class="md-info">
<div class="md-tl" if="{{mdInfo==='ready'}}">
<!-- #if mdInf.marquee -->
<marquee id="mdMarquee" class="md-mq" if="{{mdMq}}" scrollamount="$[JSON.parse(mdJs()).info.amt]" text-offset="$[JSON.parse(mdJs()).info.gap]" onbounce="mdMqBounce">{{mdTitle}}</marquee>
<text class="md-tt" if="{{!mdMq}}">{{mdTitle}}</text>
<image class="md-fl" if="{{mdMq}}" src="/common/img/md_fade_l.png"></image>
<!-- #else -->
<text class="md-tt">{{mdTitle}}</text>
<!-- #endif -->
<image class="md-fr" if="{{mdOver}}" src="/common/img/md_fade_r.png"></image>
</div>
<div class="md-al" if="{{mdInfo==='ready'}}"><text class="md-at">{{mdArtist}}</text><image class="md-fra" if="{{mdAOver}}" src="/common/img/md_fade_r.png"></image></div>
<div class="md-ph md-ph1" if="{{mdInfo==='loading'}}"></div>
<div class="md-ph md-ph2" if="{{mdInfo==='loading'}}"></div>
<text class="md-none" if="{{mdInfo==='none'}}">{{mdNoneText}}</text>
</div>
