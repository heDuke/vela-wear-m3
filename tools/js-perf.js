// Host-VM measurement only; never substitutes for a simulator performance result.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process'),{performance}=require('perf_hooks');
const baseline=path.resolve('out/baseline-2026-10-24/source'),root=path.resolve('.');
const rows=[];
function p95(a){return a.slice().sort((a,b)=>a-b)[Math.floor((a.length-1)*.95)]||0}
for(const [label,dir] of [['baseline',baseline],['current',root]]){
 const r=spawnSync(process.execPath,[path.join(dir,'tools/gen.js'),'round'],{cwd:dir,encoding:'utf8'});if(r.status)throw new Error(r.stderr);
 const {load}=require(path.join(dir,'tools/runtime-page'));
 for(let run=1;run<=3;run++){
  const m=load('index');m.state.onShow();const events=[],applies=[];let writes=0;
  m.state.items.forEach(it=>{let value=it.st;Object.defineProperty(it,'st',{get(){return value},set(v){writes++;value=v},configurable:true})});
  const apply=m.state.applyScroll;m.state.applyScroll=()=>{const t=performance.now();apply();applies.push(performance.now()-t)};
  for(let i=0;i<240;i++){const t=performance.now();m.state.onScroll({scrollY:i<120?i*4:(240-i)*4});events.push(performance.now()-t);m.advance(8)}
  m.advance(500);m.state.onHide();rows.push({label,run,eventP95Ms:p95(events),applyP95Ms:p95(applies),applyCalls:applies.length,styleWrites:writes,timersAfterHide:m.timers.size});
 }
}
fs.writeFileSync('out/perf/host-js.json',JSON.stringify({scope:'Node VM only; not device or simulator timing',rows},null,2));console.log(rows);
