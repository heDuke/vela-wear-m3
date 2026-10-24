// SPDX-License-Identifier: GPL-3.0-or-later
// Audit current public inputs and all locally reachable history; never log secret values.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
function git(args,input){return execFileSync('git',['-c','core.quotepath=false',...args],{input,encoding:'utf8',maxBuffer:128*1024*1024,stdio:['pipe','pipe','pipe']})}
const findings=[],largeFiles=[];
const excluded=/(^|\/)(node_modules|sign|out|build|dist|\.cache|__pycache__)(\/|$)|^src\/|(^|\/)\.env(?:\..*)?$|\.(?:rpk|tgz|p12|pfx|key|pem|jks|keystore|ttf|otf|woff2?|pyc)$/i;
const allowed=name=>/(^|\/)\.env\.example$/.test(name);
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}/,/\bgithub_pat_[A-Za-z0-9_]{40,}/,/\bAKIA[A-Z0-9]{16}\b/,/\bxox[baprs]-[A-Za-z0-9-]{20,}/];
function inspectContent(buffer,location){if(buffer.includes(0)||buffer.length>4*1024*1024)return;const lines=buffer.toString('utf8').split('\n');for(let i=0;i<lines.length;i++)if(patterns.some(p=>p.test(lines[i])))findings.push({...location,line:i+1,reason:'possible credential; value omitted'})}
const tracked=git(['ls-files','-z']).split('\0').filter(Boolean);
const candidates=[...new Set([...tracked,...git(['ls-files','--others','--exclude-standard','-z']).split('\0').filter(Boolean)])];
let bytes=0,count=0;
for(const file of candidates){if(!fs.existsSync(file)||!fs.statSync(file).isFile())continue;count++;const buffer=fs.readFileSync(file);bytes+=buffer.length;if(excluded.test(file)&&!allowed(file))findings.push({file,reason:'excluded material in public inputs'});if(buffer.length>10*1024*1024)largeFiles.push({file,bytes:buffer.length});if(buffer.length>95*1024*1024)findings.push({file,reason:'oversized Git object'});inspectContent(buffer,{file,scope:'working tree'})}
const commits=git(['rev-list','--all']).trim().split(/\s+/).filter(Boolean);
const historyPaths=new Set();for(const commit of commits)for(const file of git(['ls-tree','-r','--name-only',commit]).trim().split('\n')){historyPaths.add(file);if(excluded.test(file)&&!allowed(file))findings.push({file,commit,reason:'excluded material in reachable history'})}
const objects=git(['rev-list','--objects','--all']).trim().split('\n').filter(Boolean).map(line=>{const p=line.indexOf(' ');return {sha:p<0?line:line.slice(0,p),file:p<0?'':line.slice(p+1)}});
const meta=git(['cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)'],objects.map(x=>x.sha).join('\n')+'\n').trim().split('\n');
const blobs=[];meta.forEach((line,i)=>{const [sha,type,size]=line.split(' ');if(type==='blob')blobs.push({...objects[i],bytes:Number(size)})});
const small=blobs.filter(x=>x.bytes<=4*1024*1024);
const payload=execFileSync('git',['cat-file','--batch'],{input:small.map(x=>x.sha).join('\n')+'\n',maxBuffer:192*1024*1024,stdio:['pipe','pipe','pipe']});
let offset=0;for(const blob of small){const end=payload.indexOf(10,offset);const header=payload.subarray(offset,end).toString('ascii').split(' ');if(header[0]!==blob.sha||header[1]!=='blob')throw Error('Unexpected Git batch response');const size=Number(header[2]);inspectContent(payload.subarray(end+1,end+1+size),{file:blob.file,object:blob.sha,scope:'reachable history'});offset=end+size+2}
const probes=['out/example.rpk','node_modules/example/index.js','sign/private.pem','.cache/fonts/example.ttf','.env.local','src/manifest.json','build/app.js','dist/example.rpk'];
const ignored=git(['check-ignore','--no-index','--stdin'],probes.join('\n')+'\n').trim().split('\n');for(const file of probes)if(!ignored.includes(file))findings.push({file,reason:'expected ignore rule missing'});
const receiptFile='out/library-package-report.json';let npmPackage=null;
if(fs.existsSync(receiptFile)){const receipt=JSON.parse(fs.readFileSync(receiptFile));const archive=path.resolve('out/library-consumer',receipt.package+'-'+receipt.version+'.tgz');const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split(/\r?\n/);for(const file of names){const name=file.replace(/^package\//,'');if(excluded.test(name)&&!allowed(name)||/(^|\/)\.git(\/|$)/.test(name))findings.push({file,reason:'excluded material in tarball'})}for(const name of ['docs/API.md','docs/COMPONENTS.md','docs/GETTING-STARTED.md','LICENSE','THIRD_PARTY_NOTICES.md'])if(!names.includes('package/'+name))findings.push({file:name,reason:'required library documentation missing from tarball'});npmPackage={file:path.relative(root,archive).replaceAll('\\','/'),entries:names.length,bytes:fs.statSync(archive).size}}
const report={head:git(['rev-parse','HEAD']).trim(),trackedFiles:tracked.length,publicInputFiles:count,publicInputBytes:bytes,reachableCommits:commits.length,reachableBlobs:blobs.length,historyTextScanLimitBytes:4*1024*1024,maximumHistoricalBlob:blobs.sort((a,b)=>b.bytes-a.bytes)[0],ignoredRepresentativePaths:ignored,npmPackage,largeFiles,findings,limits:'Scans local refs only and high-confidence credential formats, not proof that every possible secret is absent. Binary and >4MiB content is excluded from credential text matching; paths and sizes are checked.'};
fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/release-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(findings.length)process.exitCode=1;
