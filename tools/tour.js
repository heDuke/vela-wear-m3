// Derive screenshot centers from the exact generated row descriptors used by the runtime.
const fs=require('fs'),path=require('path'),{load}=require('./runtime-page');
const id=process.argv[2]||'round',d=require('vela-wear-m3/tools/devices.json')[id],dir=process.argv[3]||'out/native-tour';fs.mkdirSync(dir,{recursive:true});
const source=fs.readFileSync('src/pages/index/index.ux','utf8');const rows=JSON.parse(source.match(/const PAGE_LAYOUT = (\[[^\n]+\])/)[1]);
if(JSON.parse(fs.readFileSync('src/manifest.json')).config.designWidth!==d.W)throw new Error('Generate '+id+' before creating its tour');
const m=load('index'),count=m.state.items.length;let y=0,row=null;
for(const r of rows){if(r.repeat==='items')row={top:y,height:r.height};y+=r.height*(r.repeat?(m.state[r.repeat]||[]).length:1)}
const steps=[],cx=Math.round(d.W/2),pause=500;let offset=0;
function top(){for(let i=0;i<4;i++)steps.push(['swipe',cx,Math.round(d.H*.2),cx,Math.round(d.H*.8),200]);steps.push(['wait',pause]);offset=0}
steps.push(['wait',3000],['shot',path.join(dir,id+'_home.png')]);
for(let i=0;i<count;i++){
 top();const target=Math.min(Math.max(0,y-d.H),Math.max(0,row.top+row.height*(i+.5)-d.H/2));let remaining=target;
 while(remaining>1){const dist=Math.min(remaining,d.H*.5);steps.push(['drag',cx,Math.round(d.H*.75),cx,Math.round(d.H*.75-dist),650],['wait',pause]);remaining-=dist}
 const cy=Math.round(row.top+row.height*(i+.5)-target);steps.push(['tap',cx,cy],['wait',3000],['shot',path.join(dir,id+'_'+m.state.items[i].id+'.png')]);
 steps.push(['swipe',Math.round(d.W*.1),Math.round(d.H*.5),Math.round(d.W*.9),Math.round(d.H*.5),400],['wait',700]);
}
process.stdout.write(JSON.stringify(steps));
