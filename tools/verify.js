const assert=require('assert/strict'),fs=require('fs'),{spawnSync}=require('child_process');
const {load}=require('./runtime-page'),devices=require('vela-wear-m3/tools/devices.json');let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
const zlib=require('zlib');
function readPng8(file){const b=fs.readFileSync(file);let i=8,w,h,ct,pal,trns=Buffer.alloc(0),data=[];
 while(i<b.length){const n=b.readUInt32BE(i),t=b.toString('ascii',i+4,i+8),d=b.subarray(i+8,i+8+n);if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];assert(d[8]===8&&ct===3,file+' PNG8')}else if(t==='PLTE')pal=d;else if(t==='tRNS')trns=d;else if(t==='IDAT')data.push(d);i+=12+n}
 const raw=zlib.inflateSync(Buffer.concat(data)),px=Buffer.alloc(w*h);let prev=Buffer.alloc(w);
 for(let y=0;y<h;y++){const f=raw[y*(w+1)],row=Buffer.from(raw.subarray(y*(w+1)+1,(y+1)*(w+1)));for(let x=0;x<w;x++){const a=x?row[x-1]:0,u=prev[x],c=x?prev[x-1]:0;let add=f===1?a:f===2?u:f===3?(a+u)>>1:f===4?(()=>{const p=a+u-c,pa=Math.abs(p-a),pb=Math.abs(p-u),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?u:c})():0;row[x]=(row[x]+add)&255}row.copy(px,y*w);prev=row}
 return {w,h,px:(x,y)=>{const j=px[y*w+x];return [pal[3*j],pal[3*j+1],pal[3*j+2],j<trns.length?trns[j]:255]}}}
for(const device of Object.keys(devices))for(const mode of ['basic','enhanced']){
 const r=spawnSync(process.execPath,['tools/gen.js',device,'--animation',mode],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 for(const name of ['index','buttons','cards','list','edge','time','toggles','dialogs','motion']){
  const m=load(name),s=m.source;ok(!/\$\[|\$\(\d/.test(s),name+' expanded');
  for(const hit of s.matchAll(/\/common\/img\/([\w]+)\.png/g))ok(fs.existsSync('src/common/img/'+hit[1]+'.png'),hit[1]);
  {const tpl=s.match(/<template>([\s\S]*?)<\/template>/)[1],sc=tpl.indexOf('class="tt-scrim"'),time=Math.max(tpl.indexOf('class="tt-rect"'),tpl.indexOf('class="arc-g"',tpl.lastIndexOf('</list>')));
   ok(sc>tpl.lastIndexOf('</list>')&&sc<time,name+' top fade above list, below TimeText');
   const b=fs.readFileSync('src/common/img/top_scrim.png'),w=b.readUInt32BE(16),h=b.readUInt32BE(20);ok(w===devices[device].W&&h>0&&h<devices[device].H/6,name+' top fade spans width, top strip only');}
  if(mode==='basic')ok(!s.includes('<image-animator'),name+' API level');
  if(device==='round')ok(!/<div class="nav-back/.test(s),name+' circular navigation');
  m.state.onShow();m.advance(500);m.state.onHide();m.advance(5000);ok(m.timers.size===0,name+' lifecycle');
 }
 const b=load('buttons');b.state.onShow();b.state.morphPress();b.advance(80);const pressed=b.state.morphStatic;b.state.cancelPress();b.state.morphRelease();b.advance(1000);ok(!b.state.pressId,'cancel then release stays idle');ok(b.state.morphStatic!==pressed,'shape recovers');b.state.togglePlaying();b.state.togglePlaying();b.advance(500);ok(b.state.playSrc,'same-frame reversal');b.state.onHide();ok(b.timers.size===0,'button cleanup');
 const c=load('toggles');c.state.onShow();
 {// SwitchButton = androidx SwitchButton.kt: thumb fastEffects (1400) both ways, colours slowEffects (260), tick always in the thumb.
  const A=JSON.parse(fs.readFileSync('packages/vela-wear-m3/assets/animations.json','utf8'))[device],dv=devices[device],k=dv.k,src=c.source,S=c.state;
  ok(!['switchPlain','switchIcon','switchDisabledPlain','switchDisabledIcon'].some(n=>n in A)&&!/switchPlain|switchIcon|it\.tick\b|\btick:/.test(src),'no no-check switch variant left');
  ok(!fs.readdirSync('packages/vela-wear-m3/assets/'+device).some(f=>/^sw_(n|i|dn|di)_/.test(f)),'old switch sprites removed');
  const crit=(st,ms)=>{const w=Math.sqrt(st)*ms/1000;return 1-(1+w)*Math.exp(-w)};
  ok(A.switchFrameMs===33&&A.switchOn.length===14&&A.switchOff.length===14&&A.switchDisabled.length===2,'switch frames: 14 per direction at 33ms, 2 disabled');
  ok(A.switchThumb.on.every((v,i)=>Math.abs(v-(i===13?1:crit(1400,i*33)))<1e-3)&&A.switchThumb.off.every((v,i)=>Math.abs(v-(1-A.switchThumb.on[i]))<1e-3),'thumb = fastEffects 1400, same stiffness both directions');
  ok(A.switchOn[0]===A.switchOff[13]&&A.switchOn[13]===A.switchOff[0],'on/off sets share exact end states');
  ok(/\.switch-card\{[^}]*transition-duration:420ms;transition-timing-function:cubic-bezier\(0\.2,0\.1,0\.2,1\)/.test(src.replace(/\s/g,'')),'container colour transition = slowEffects fit');
  // pixels: endpoint colours, official tick, disabled composite (thumb Background 38% over the 12% track)
  const img=n=>readPng8('packages/vela-wear-m3/assets/'+device+'/'+n.split('/').pop()),cy=Math.round(24*k)/2,at=(im,x,y)=>im.px(Math.floor(x),Math.floor(y));
  const near=(a,b,t=10)=>a.every((v,i)=>Math.abs(v-b[i])<=t),over=(c,bg)=>c.slice(0,3).map((v,i)=>Math.round(v*c[3]/255+bg[i]*(1-c[3]/255)));
  const on=img(A.switchOn[13]),off=img(A.switchOn[0]),cx1=21*k,cx0=11*k;
  ok(near(at(on,2*k,cy),[233,221,255,255])&&near(at(on,cx1-5*k,cy-4*k),[77,61,118,255]),'checked: track primary, thumb primaryContainer');
  ok(near(at(on,cx1+1.5*k,cy+.1*k),[233,221,255,255],24),'checked thumb carries the primary tick');
  ok(near(at(off,26*k,cy),[51,46,60,255])&&near(at(off,k*.5+.5,cy),[148,143,154,255],24)&&near(at(off,cx0,cy),[148,143,154,255]),'unchecked: surfaceContainer track, outline border and thumb');
  const dis=img(A.switchDisabled[1]),bg=[30,28,31],tr=over([246,237,255,31],bg),th=over([0,0,0,97],tr);
  ok(near(over(at(dis,cx1-5*k,cy-4*k),bg),th,4),'disabled checked thumb composited over track');
  ok(at(img(A.switchDisabled[0]),cx0,cy)[3]>20&&at(img(A.switchDisabled[0]),cx0,cy)[3]<40,'disabled unchecked thumb onSurface 12%');
  // runtime timeline
  ok(S.switches.length===4&&S.switches.every(it=>it.src===(it.disabled?A.switchDisabled[it.checked?1:0]:it.checked?A.switchOn[13]:A.switchOff[13])),'rest states');
  for(let kind=0;kind<2;kind++){
   ok(S.switches.every(it=>it.leading===(kind===1)),'variant '+kind+' leading icon');
   S.toggleSwitch(1);ok(S.switches[1].src===A.switchOn[1],'first frame immediate');c.advance(33);ok(S.switches[1].src===A.switchOn[2],'one frame per 33ms');c.advance(33*11);ok(S.switches[1].src===A.switchOn[13],'on settles at 429ms');
   S.toggleSwitch(1);c.advance(33*12);ok(S.switches[1].src===A.switchOff[13]&&!S.switches[1].checked,'off settles in the same 13 ticks');
   S.toggleSwitch(1);c.advance(33);const p=A.switchThumb.on[2];S.toggleSwitch(1);const j=A.switchOff.indexOf(S.switches[1].src);ok(j>0&&Math.abs(A.switchThumb.off[j-1]-p)<=.36,'reversal jumps to nearest thumb frame of the opposite set');c.advance(500);ok(S.switches[1].src===A.switchOff[13],'reversal settles');
   const dc=S.switches[2].checked;S.toggleSwitch(2);ok(S.switches[2].checked===dc&&S.switches[2].src===A.switchDisabled[1],'disabled switch ignores taps');
   S.pressSwitch(2);ok(!S.pressId,'disabled switch has no press feedback');S.pressSwitch(0);ok(S.pressId==='sw0','press feedback on enabled switch');S.releaseSwitch(0);c.advance(500);
   const tpl=src.match(/<template>([\s\S]*?)<\/template>/)[1];ok(/switch-press" style="\{\{feedback\[/.test(tpl)&&(kind||/wifi_primary_24/.test(tpl)),'switch press feedback + primary leading icon');
   S.nextSwitchVariant()}
  ok(S.switchVariant===0,'two official switch variants');
  const css=src.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\s/g,''),dp=v=>Math.round(v*k),pill=dv.shape==='pill';
  ok(css.includes('.switch-label{font-size:'+dp(pill?13:15)+'px;line-height:'+dp(18)+'px;font-weight:bold;')&&css.includes('lines:3;')&&css.includes('.switch-sub{font-size:'+dp(pill?11:13)+'px;line-height:'+dp(16)+'px;margin-top:'+dp(1)+'px;')&&/\.switch-secondary-on\{[^}]*opacity:0\.9/.test(css),'switch typography');
  ok(pill?/\.switch-ctl\{[^}]*justify-content:flex-end/.test(css)&&/\.switch-card\{[^}]*flex-direction:column/.test(css):/\.switch-card\{[^}]*flex-direction:row/.test(css),'band: stacked, switch at end');}
 c.state.openStepper();c.state.stepValue=10;c.state.stepUp();ok(c.state.stepValue===10,'upper bound');c.state.stepValue=0;c.state.stepDown();ok(c.state.stepValue===0,'lower bound');c.state.rangePress('plus');c.advance(900);ok(c.state.stepValue>=3,'hold repeat');c.state.cancelPress();const held=c.state.stepValue;c.advance(500);c.state.rangeRelease('plus');c.state.stepClick('plus');ok(c.state.stepValue===held,'cancelled hold click');c.state.pick(0);c.advance(70);ok(c.state.radios[1].st.opacity>0&&c.state.radios[1].st.opacity<1,'radio starts from actual selected size');c.state.onHide();ok(c.timers.size===0,'control cleanup');
 const d=load('dialogs');d.state.onShow();d.state.showConfirm();d.advance(20);d.state.hideConfirm();d.advance(110);ok(!d.state.cfIconOn,'close before delayed icon');d.state.showConfirm();d.advance(100);ok(d.state.cfIconOn,'reentry icon');d.advance(4200);ok(!d.state.cfOn,'default 4s timeout');d.state.showConfirm();d.state.onHide();d.advance(5000);ok(!d.state.cfIconOn&&d.timers.size===0,'hidden confirmation');
 {const src=load('dialogs').source,css=src.match(/<style>([\s\S]*?)<\/style>/)[1];
  const frames=n=>{const k=css.match(new RegExp('@keyframes\\s+'+n+'\\s*\\{([\\s\\S]*?\\})\\s*\\}'));ok(k,n+' keyframes');return [...k[1].matchAll(/([\d.]+)%\{([^}]*)\}/g)].map(x=>({p:+x[1],v:x[2]}))};
  const sc=v=>+(v.match(/scale\(([\d.]+)\)/)||[])[1],op=v=>+(v.match(/opacity:([\d.]+)/)||[])[1];
  const inn=frames('ovIn'),out=frames('ovOut');
  ok(sc(inn[0].v)===1.25&&sc(inn.at(-1).v)===1&&op(inn[0].v)===0&&op(inn.at(-1).v)===1,'overlay enter 1.25->1, alpha 0->1');
  ok(sc(out[0].v)===1&&sc(out.at(-1).v)===1.25&&op(out[0].v)===1&&op(out.at(-1).v)===0,'overlay exit 1->1.25, alpha 1->0');
  ok(inn.length>=10&&out.length>=10&&inn.every((f,i)=>!i||sc(f.v)<=sc(inn[i-1].v))&&out.every((f,i)=>!i||sc(f.v)>=sc(out[i-1].v)),'overlay spring sampled, monotonic');
  ok(/\.ovl \{[^}]*transform: scale\(1\)/.test(css),'overlay static transform for transform-origin');
  const st=frames('cfStretch'),hs=st.map(f=>+f.v.match(/height:(\d+)px/)[1]),h0=hs[0],h1=hs.at(-1),peak=Math.max(...hs);
  ok(st.length>=20&&/cfStretch;animation-duration:400ms/.test(css.replace(/\s/g,'')),'stretch sampled every 20ms over 400ms');
  ok(h1>h0&&(peak-h0)/(h1-h0)>1.08&&(peak-h0)/(h1-h0)<1.16,'stretch keeps spring overshoot');
  const txt=css.match(/\.cf-txt\s*\{([^}]*)\}/)[1];ok(/animation-delay:0ms/.test(txt)&&/animation-name:cfText/.test(txt),'text fade has no CSS delay (no fill-mode reliance)');
  const tpl=src.match(/<template>([\s\S]*?)<\/template>/)[1];ok([...tpl.matchAll(/class="cf-txt"[^>]*>/g)].every(x=>/if="\{\{cfTextOn\}\}"/.test(x[0])),'text mounted only by cfTextOn');
  const q=load('dialogs');q.state.onShow();q.state.showConfirm();q.advance(99);ok(!q.state.cfTextOn&&!q.state.cfIconOn,'nothing before 100ms');q.advance(2);ok(q.state.cfTextOn&&q.state.cfIconOn&&q.state.cfBlobOn,'blob, icon, text at 100ms');
  q.advance(3900);ok(q.state.cfOut&&q.state.cfIconOn&&q.state.cfTextOn,'icon and text persist during exit');q.advance(200);ok(!q.state.cfOn,'overlay removed after exit');q.state.onHide();ok(q.timers.size===0,'confirmation cleanup');}
 const p=load('list');p.state.onShow();p.state.openHorizontalPager();const width=devices[device].W-2*Math.round(Math.ceil(devices[device].W/devices[device].k*.052)*devices[device].k)-Math.round(20*devices[device].k);
 function drag(f){p.state.pagerStart({touches:[{clientX:width,clientY:100}]});p.state.pagerMove({touches:[{clientX:width-width*f,clientY:100}]});p.state.pagerEnd();p.advance(500)}
 drag(.2);ok(p.state.pageIndex===0,'under 25% rebound');drag(.3);ok(p.state.pageIndex===1,'over 25% commit');drag(-.3);ok(p.state.pageIndex===0,'backward page owns swipe');drag(-.8);ok(p.state.pageIndex===0,'first-page clamp');p.state.pageIndex=7;p.state.updatePages();drag(.8);ok(p.state.pageIndex===7,'last-page clamp');p.state.togglePageCount();ok(p.state.pageIndex===2,'page count clamp');ok(p.state.dots.filter(x=>parseFloat(x.st.width)>0&&x.st.opacity>0).length<=6,'six visible dots');p.state.openHorizontalPager();p.state.pagerStart({touches:[{clientX:width,clientY:100}]});p.state.pagerMove({touches:[{clientX:width*.5,clientY:100}]});p.state.pagerEnd();p.state.doBack();const page=p.state.pageIndex;p.advance(500);ok(p.state.pageIndex===page,'closing demo cancels page settlement');p.state.onHide();ok(p.timers.size===0,'pager cleanup');
 const m=load('motion');m.state.onShow();for(const v of [0,1,5,50,95,100]){m.state.setProgress(v);m.advance(600);ok(m.state.pct===v,'progress '+v)}for(let i=0;i<11;i++)m.state.nextKind();m.state.onHide();ok(m.timers.size===0,'loading cleanup');
 const scroll=load('index');scroll.state.onShow();let calls=0;const apply=scroll.state.applyScroll;scroll.state.applyScroll=()=>{calls++;apply()};for(let i=0;i<180;i++){scroll.state.onScroll({scrollY:i*8});scroll.advance(8)}scroll.advance(100);ok(calls<=48,'scroll coalescing');scroll.state.onHide();ok(scroll.timers.size===0,'scroll cleanup');
 console.log(device+' '+mode+' verified');
}
console.log(checks+' assertions passed');
