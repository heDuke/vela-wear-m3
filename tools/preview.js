// Chrome design previews from the actual generated UX + actual page ViewModel.
// Explicitly not a Vela emulator. Also emits states for all four devices.
const fs=require('fs'),path=require('path'),http=require('http'),{spawnSync}=require('child_process');
const {chromium}=require('playwright-core'),{load}=require('./runtime-page');
const OUT=path.resolve(__dirname,'../docs/screenshots/ui-2026-10-24/previews');
const devices=require('vela-wear-m3/tools/devices.json');
const cases=[
 ['index','home',null,0],['buttons','buttons',null,0],['cards','cards',null,0],
 ['list','list',null,0],['edge','edge',null,0],['time','time',null,0],
 ['toggles','switches',null,0],['dialogs','dialogs',null,0],['motion','progress',null,0],
 ['toggles','stepper','openStepper',0],['list','level','openLevel',0],
 ['list','horizontal-pages','openHorizontalPager',0],['list','vertical-pages','openVerticalPager',0],
 ['dialogs','confirmation','showConfirm',900],['dialogs','alert','openDlg',300],
 ['buttons','pressed','morphPress',150,'.morph-hit'],
 ['buttons','button-pressed','buttonMorphPress',150,'.button-morph-hit'],
 ['toggles','switch-no-leading','nextSwitchVariant',0,'.switch-row'],
 ['toggles','switch-plain-thumb',null,0,'.switch-row'],
 ['time','arc-time',null,0,'.arc-panel'],
 ['motion','progress-states','nextKind',0,'.progress-stage']
];
for(let i=0;i<11;i++)cases.push(['motion','progress-'+i,'kind:'+i,300,'.progress-stage']);
for(let i=0;i<4;i++)cases.push(['toggles','switch-kind-'+i,'switch:'+i,0,'.switch-row']);
for(let i=0;i<3;i++)cases.push(['toggles','slider-'+i,'slider:'+i,0,'.slider-row']);
for(const elapsed of [0,50,100,167,300,500,900,3900,4100,4250])cases.push(['dialogs','confirmation-'+elapsed,'showConfirm',elapsed]);
for(let k=0;k<4;k++)for(let state=0;state<4;state++)cases.push(['toggles','switch-k'+k+'-s'+state,'switch:'+k,0,'switch-state:'+state]);
async function main(){
 fs.mkdirSync(OUT,{recursive:true});
 const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end('<html></html>')}
 let target;
 if(req.url.startsWith('/common/'))target=path.resolve('src','.'+decodeURIComponent(req.url));
 else if(req.url==='/font.ttf')target=process.env.VELA_PREVIEW_FONT||path.join(require('os').homedir(),'.vela/sdk/qa/font/MiSansW_Normal.ttf');
 if(!target||(!target.endsWith('.ttf')&&!target.startsWith(path.resolve('src')+path.sep))||!fs.existsSync(target)){res.statusCode=404;return res.end();}
 res.setHeader('Content-Type',target.endsWith('.png')?'image/png':'font/ttf');fs.createReadStream(target).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/google-chrome'),headless:true});
 try{for(const[id,d]of Object.entries(devices)){
 const r=spawnSync(process.execPath,['tools/gen.js',id,'--animation','enhanced'],{encoding:'utf8'});if(r.status)throw new Error(r.stderr);
 const page=await browser.newPage({viewport:{width:d.W,height:d.H},deviceScaleFactor:1});
 for(const[name,label,action,elapsed,targetSelector]of cases){
 const model=load(name);model.state.onShow();if(action){if(action.startsWith('kind:')){for(let i=0;i<+action.split(':')[1];i++)model.state.nextKind()}else if(action.startsWith('switch:')){for(let i=0;i<+action.split(':')[1];i++)model.state.nextSwitchVariant()}else if(action.startsWith('slider:')){model.state.sliderMode=+action.split(':')[1];model.state.updateSlider()}else model.state[action]();}model.advance(elapsed||1);
 const state=JSON.parse(JSON.stringify(model.state));model.state.onHide();
 const template=model.source.match(/<template>([\s\S]*?)<\/template>/)[1];
 const css=model.source.match(/<style>([\s\S]*?)<\/style>/)[1];
 await page.goto('http://127.0.0.1:'+port+'/');
 await page.setContent('<html><head><style>@font-face{font-family:Vela;src:url(http://127.0.0.1:'+port+'/font.ttf)}*{box-sizing:border-box;border-style:solid;border-width:0;flex-shrink:1}html,body{margin:0;background:#000;color:#fff;font-family:Vela,sans-serif}div,list,list-item,stack{display:flex;position:relative}list-item{flex-shrink:0}image,img{flex-shrink:0}list{overflow-y:auto;scrollbar-width:none}text{display:block;white-space:pre-wrap}image{display:block}stack{display:grid}stack>*{grid-area:1/1}'+css+'</style></head><body><template id="ux">'+template+'</template><main id="screen"></main></body></html>');
 await page.evaluate(({state,elapsed,d,targetSelector})=>{
 const evalExpr=(exp,vars)=>Function('s','v','with(s){with(v){return ('+exp+')}}')(state,vars);
 const interpolate=(value,vars)=>value.replace(/\{\{([\s\S]*?)\}\}/g,(_,exp)=>{const v=evalExpr(exp,vars);return v==null?'':typeof v==='object'?JSON.stringify(v):String(v)});
 function node(el,vars={}){
 if(el.nodeType===3)return document.createTextNode(interpolate(el.textContent,vars));
 if(el.nodeType!==1)return document.createTextNode('');
 if(el.hasAttribute('for')){
 const items=evalExpr(el.getAttribute('for').replace(/^\{\{|\}\}$/g,''),vars),frag=document.createDocumentFragment();
 items.forEach((item,i)=>{const copy=el.cloneNode(true);copy.removeAttribute('for');frag.append(node(copy,{...vars,$item:item,$idx:i}))});return frag;
 }
 if(el.hasAttribute('if')&&!evalExpr(el.getAttribute('if').replace(/^\{\{|\}\}$/g,''),vars))return document.createTextNode('');
 let tag=el.tagName.toLowerCase();let result=document.createElement(tag==='image'||tag==='image-animator'?'img':tag);
 for(const at of el.attributes){
 if(at.name==='if'||at.name==='tid'||at.name==='for'||at.name.startsWith('on'))continue;
 if(at.name==='style'&&/^\{\{/.test(at.value)){
 const obj=evalExpr(at.value.replace(/^\{\{|\}\}$/g,''),vars);
 for(const[k,v]of Object.entries(obj)){
 if(k==='transform'){const t=JSON.parse(v);result.style.transform=Object.entries(t).map(([key,val])=>key+'('+val+')').join(' ')}
 else result.style[k]=v;
 }
 }else result.setAttribute(at.name,interpolate(at.value,vars));
 }
 if(tag==='image-animator'){
 const frames=JSON.parse(result.getAttribute('images')),duration=parseFloat(result.getAttribute('duration'))||500;
 let i=result.getAttribute('iteration')==='infinite'?Math.floor(elapsed%duration/duration*frames.length):Math.min(frames.length-1,Math.floor(elapsed/duration*frames.length));
 if(result.getAttribute('reverse')==='true')i=frames.length-1-i;
 result.src=frames[Math.max(0,i)].src;return result;
 }
 if(tag==='switch'){result=document.createElement('div');result.style.cssText='width:52px;height:32px;border-radius:16px;background:#D0BCFF';}
 else if(tag==='slider'){result=document.createElement('div');result.style.cssText='height:12px;width:140px;background:#D0BCFF;border-radius:6px';}
 else for(const child of el.childNodes)result.append(node(child,vars));
 return result;
 }
 const main=document.getElementById('screen');main.replaceChildren();
 main.style.cssText='width:'+d.W+'px;height:'+d.H+'px;overflow:hidden;position:relative';
 if(d.shape==='circle')main.style.borderRadius='50%';else if(d.shape==='pill')main.style.borderRadius=d.W/2+'px';else main.style.borderRadius='24px';
 main.append(node(document.getElementById('ux').content.firstElementChild));
 for(const el of document.querySelectorAll('*')){
 if(el.classList.contains('cf-blob')){for(const anim of el.getAnimations()){anim.currentTime=Math.max(0,elapsed-100);anim.pause()}}
 else if(el.classList.contains('cf-txt')){for(const anim of el.getAnimations()){anim.currentTime=Math.max(0,elapsed-150);anim.pause()}}
 else if(el.classList.contains('ovl-out')){for(const anim of el.getAnimations()){anim.currentTime=Math.max(0,elapsed-4000);anim.pause()}}
 else for(const p of ['animation','transition'])el.style[p]='none';
 }
 if(targetSelector){const hit=targetSelector.startsWith('switch-state:')?document.querySelectorAll('.switch-row')[+targetSelector.split(':')[1]]:document.querySelector(targetSelector);if(hit){const list=document.querySelector('list');list.scrollTop=hit.getBoundingClientRect().top-list.getBoundingClientRect().top+list.scrollTop-(d.H-hit.offsetHeight)/2;}}
 },{state,elapsed,d,targetSelector});
 await page.evaluate(()=>document.fonts.ready);
 fs.mkdirSync('out/preview-html',{recursive:true}); fs.writeFileSync(path.join('out/preview-html',id+'_'+label+'.html'),await page.content());
 if(/^switch-k[0-3]-s[0-3]$/.test(label))await page.locator('.switch-row').nth(+targetSelector.split(':')[1]).screenshot({path:path.join(OUT,id+'_'+label+'.png')});else await page.screenshot({path:path.join(OUT,id+'_'+label+'.png')});
 if(['home','buttons','cards','list','edge','time','switches','dialogs','progress'].includes(label)){
  const scroll=await page.locator('list').evaluate(el=>({height:el.scrollHeight,viewport:el.clientHeight}));
  for(let pos=0,index=0;pos<scroll.height;pos+=Math.max(1,scroll.viewport),index++){
   model.state.onShow();model.state.onScroll({scrollY:pos});model.advance(40);const styles=(model.state.items||[]).map(it=>it.st);model.state.onHide();
   await page.evaluate(({pos,styles})=>{document.querySelector('list').scrollTop=pos;document.querySelectorAll('.tlc').forEach((el,i)=>{const st=styles[i];if(st){el.style.opacity=st.opacity;const t=JSON.parse(st.transform);el.style.transform=Object.entries(t).map(([k,v])=>k+'('+v+')').join(' ')}})},{pos,styles});
   await page.screenshot({path:path.join(OUT,id+'_'+label+'_part'+index+'.png')});
   if(pos+scroll.viewport>=scroll.height)break;
  }
 }

 }
 await page.close();console.log('previews '+id);
 }
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
