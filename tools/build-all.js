// Cross-platform matrix builder: 4 devices x API1/API2 x debug/release.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const version=require('./project-manifest')().versionName;
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
function run(script,args,log,cwd=ROOT){
 const r=spawnSync(process.execPath,[script,...args],{cwd,encoding:'utf8',maxBuffer:20*1024*1024});
 if(log)fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''));
 if(r.error||r.status!==0)throw new Error((r.error||'')+'\n'+(r.stdout||'')+(r.stderr||''));
 return (r.stdout||'')+(r.stderr||'');
}
function sign(){
 const dir=path.join(ROOT,'sign');fs.mkdirSync(dir,{recursive:true});
 const key=path.join(dir,'private.pem'),cert=path.join(dir,'certificate.pem');
 if(fs.existsSync(key)&&fs.existsSync(cert))return;
 if(fs.existsSync(key))throw new Error('已有私钥但证书缺失，请恢复匹配证书，构建不会覆盖私钥。');
 const {KEYUTIL,KJUR}=require('jsrsasign');
 const pair=KEYUTIL.generateKeypair('RSA',2048);
 const pem=KJUR.asn1.x509.X509Util.newCertPEM({serial:{hex:crypto.randomBytes(16).toString('hex')},sigalg:'SHA256withRSA',issuer:{str:'/CN=velam3demo/O=demo'},subject:{str:'/CN=velam3demo/O=demo'},notbefore:'20261022000000Z',notafter:'20361022000000Z',sbjpubkey:pair.pubKeyObj,cakey:pair.prvKeyObj});
 fs.writeFileSync(key,KEYUTIL.getPEM(pair.prvKeyObj,'PKCS8PRV'));
 fs.writeFileSync(cert,pem);
}

const INPUT=path.join(ROOT,'out','build-input');
function prepareInput(){
 fs.mkdirSync(INPUT,{recursive:true});
 const source=path.resolve(INPUT,'src'),allowed=path.resolve(ROOT,'out')+path.sep;
 if(!source.startsWith(allowed))throw new Error('不安全的构建输入路径 '+source);
 fs.rmSync(source,{recursive:true,force:true});
 fs.cpSync(path.join(ROOT,'src'),source,{recursive:true});
 for(const name of ['package.json','quickapp.config.js'])if(fs.existsSync(path.join(ROOT,name)))fs.copyFileSync(path.join(ROOT,name),path.join(INPUT,name));
 fs.mkdirSync(path.join(INPUT,'sign'),{recursive:true});
 for(const name of ['private.pem','certificate.pem'])fs.copyFileSync(path.join(ROOT,'sign',name),path.join(INPUT,'sign',name));
 const dep=path.join(INPUT,'node_modules');
 if(!fs.existsSync(dep))fs.symlinkSync(path.join(ROOT,'node_modules'),dep,process.platform==='win32'?'junction':'dir');
 const hash=crypto.createHash('sha256');
 function walk(dir){for(const f of fs.readdirSync(dir).sort()){const file=path.join(dir,f);if(fs.statSync(file).isDirectory())walk(file);else{hash.update(path.relative(source,file));hash.update(fs.readFileSync(file))}}}
 walk(source);return hash.digest('hex');
}

const baseline={round:{debug:101818,release:80969},band10:{debug:92528,release:71718},pro:{debug:97259,release:76915},band9:{debug:92597,release:71778}};
function main(){
 sign();fs.mkdirSync('out',{recursive:true});
 const devices=process.argv.slice(2).filter(x=>!x.startsWith('--'));
 const chosen=devices.length?devices:Object.keys(baseline);
 const modes=process.argv.includes('--basic')?['basic']:process.argv.includes('--enhanced')?['enhanced']:['basic','enhanced'];
 const report=devices.length&&fs.existsSync('out/size-report.json')?JSON.parse(fs.readFileSync('out/size-report.json','utf8')):[];
 const cli=require.resolve('aiot-toolkit/lib/bin.js');
 for(const id of chosen)for(const animation of modes){
  run('tools/gen.js',[id,'--animation',animation]);
  const sourceDigest=prepareInput();
  const assetFiles=fs.readdirSync('src/common/img'),assetBytes=assetFiles.reduce((s,f)=>s+fs.statSync(path.join('src/common/img',f)).size,0);
  const animationBytes=assetFiles.filter(f=>/^(ind_|arcLoad_|morph_|buttonMorph_|compactMorph_|playPause_|check_draw_|sw_[in]_)/.test(f)).reduce((s,f)=>s+fs.statSync(path.join('src/common/img',f)).size,0);
  for(const mode of ['debug','release']){
   const name='velam3demo-'+id+'-api'+(animation==='enhanced'?2:1)+'-'+mode;
   const started=Date.now();
   const log=run(cli,[mode==='debug'?'build':'release'],'out/'+name+'.log',INPUT);
   const source=path.join(INPUT,'dist','com.velam3.demo.'+mode+'.'+version+'.rpk');
   if(!fs.existsSync(source))throw new Error('构建没有生成 '+source);
   if(!log.includes('build success:')||fs.statSync(source).mtimeMs+1000<started)throw new Error('构建未成功或产物已过期 '+name);
   const target='out/'+name+'.rpk';fs.copyFileSync(source,target);
   const bytes=fs.statSync(target).size;
   const baselinePath=fs.existsSync('out/baseline-2026-10-24/size-report.json')?'out/baseline-2026-10-24/size-report.json':'docs/releases/0.1.0/baseline-size-report.json';
   const currentBaseline=(fs.existsSync(baselinePath)?JSON.parse(fs.readFileSync(baselinePath,'utf8')):[]).find(r=>r.file===target);
   const row={version,currentBaseline:currentBaseline&&currentBaseline.bytes,currentBudgetPassed:currentBaseline?bytes<=currentBaseline.bytes:null,device:id,animation,api:animation==='enhanced'?2:1,mode,file:target,bytes,sourceDigest,assetBytes,animationBytes,assetFiles:assetFiles.length,baseline:baseline[id][mode],delta:bytes-baseline[id][mode],budgetPassed:mode!=='release'||bytes<=81000,warnings:log.split('\n').filter(x=>x.includes('🟠')&&!x.includes('AIoT-IDE'))};
   row.pageJs=Object.fromEntries(fs.readdirSync(path.join(INPUT,'build/pages')).map(p=>[p,fs.statSync(path.join(INPUT,'build/pages',p,p+'.js')).size]));
   const previous=report.findIndex(r=>r.file===row.file);if(previous>=0)report[previous]=row;else report.push(row);fs.writeFileSync('out/size-report.json',JSON.stringify(report,null,2));console.log(name+': '+bytes+' B; '+(row.currentBudgetPassed?'未增加对应包体':'超出本轮基线 '+(bytes-row.currentBaseline)+' B')+(row.budgetPassed?'':'；超出 81KB'));
  }
 }
 fs.writeFileSync('out/build-log.txt',report.map(x=>x.file+' '+x.bytes+' B Δ'+x.delta+(x.budgetPassed?'':' [预算未达标]')).join('\n')+'\n');
}
if(require.main===module)try{main()}catch(e){console.error(e.message);process.exitCode=1}
module.exports={sign};
