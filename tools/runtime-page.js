// Evaluate generated pure page logic with a deterministic clock (verification only).
const fs=require('fs'),path=require('path'),vm=require('vm');
function load(page){
 const source=fs.readFileSync(path.join(__dirname,'../src/pages',page,page+'.ux'),'utf8');
 const common=fs.readFileSync(path.join(__dirname,'../src/common/m3.js'),'utf8').replace(/export /g,'');
 const script=source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm,'').replace('export default','const definition =');
 let now=0,next=0,timers=new Map(),backs=0,pushes=[],vibrations=0;
 const schedule=(fn,delay,repeat)=>{const id=++next;timers.set(id,{fn,due:now+delay,repeat});return id};
 class ClockDate extends Date { static now(){return now} }
 const context={console,Date:ClockDate,JSON,Math,router:{back(){backs++},push(v){pushes.push(v)}},prompt:{showToast(){}},vibrator:{vibrate(){vibrations++}},
 setTimeout:(fn,ms)=>schedule(fn,ms||0,0),clearTimeout:id=>timers.delete(id),
 setInterval:(fn,ms)=>schedule(fn,ms,ms),clearInterval:id=>timers.delete(id)};
 const def=vm.runInNewContext(common+'\n'+script+'\ndefinition',context);
 const state=def.private||def.data||{};
 Object.keys(def).forEach(k=>{if(typeof def[k]==='function')state[k]=def[k].bind(state)});
 state.$element=()=>null;
 const advance=ms=>{const target=now+ms;let guard=0;
 while(++guard<10000){let entry=null,id=null;for(const [key,t]of timers)if(t.due<=target&&(!entry||t.due<entry.due)){id=key;entry=t}
 if(!entry)break;now=entry.due;if(entry.repeat)entry.due+=entry.repeat;else timers.delete(id);entry.fn();}
 if(guard===10000)throw new Error('timer loop');now=target;};
 if(state.onInit)state.onInit();
 return {state,source,advance,timers,calls:()=>({backs,pushes,vibrations}),common,script};
}
module.exports={load};
