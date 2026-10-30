<!-- #set mdLv = mdLvOpts() -->
<!-- VolumeLevelIndicator: place it FIRST in the page (round: the arc relies on black masks and later siblings drawing above). -->
<div class="md-lv {{mdLvCls}}" style="{{mdLvSt}}">
<!-- #if mdLv.arc -->
<image class="md-lvi" src="$[levelGeo.ind.src]" style="{{mdLvI}}"></image>
<image class="md-lvt" src="$[levelGeo.trk.src]" style="{{mdLvT}}"></image>
<image class="md-lvml" src="$[levelGeo.maskLow.src]"></image>
<image class="md-lvmh" src="$[levelGeo.maskHigh.src]"></image>
<div class="md-lvd md-lvc" style="{{mdLvDI}}"></div>
<div class="md-lvd md-lvk" style="{{mdLvDT}}"></div>
<!-- #else -->
<div class="md-bar"><div class="md-barp md-lvk" style="{{mdBarT}}"></div><div class="md-barp md-lvc" style="{{mdBarI}}"></div></div>
<!-- #endif -->
</div>
