// SPDX-License-Identifier: GPL-3.0-or-later
// Print locations only; never print a suspected secret value.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:20*1024*1024}).split('\0').filter(Boolean))];
const findings=[];let count=0,bytes=0;
for(const name of files){if(!fs.existsSync(name)||!fs.statSync(name).isFile())continue;count++;const size=fs.statSync(name).size;bytes+=size;
 if(/(^|\/)(node_modules|sign|out|\.cache)(\/|$)|\.(?:rpk|p12|pfx|key|pem|ttf|otf|woff2?)$/i.test(name))findings.push({file:name,reason:'excluded distribution material'});
 if(size>95*1024*1024)findings.push({file:name,reason:'GitHub large file limit'});
 if(size>4*1024*1024||/\.(?:png|mp4|zip|jpg|webp|gif)$/i.test(name))continue;
 const lines=fs.readFileSync(name,'utf8').split('\n');
 const patterns=[new RegExp('^\\s*-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE'+' KEY-----'),new RegExp('\\bgh[pousr]_'+'[A-Za-z0-9]{30,}'),new RegExp('\\bgithub_pat_'+'[A-Za-z0-9_]{40,}')];
 lines.forEach((line,i)=>{if(patterns.some(re=>re.test(line)))findings.push({file:name,line:i+1,reason:'possible credential'})});
}
const historyFiles=execFileSync('git',['log','--all','--format=','--name-only'],{encoding:'utf8'}).split('\n');
for(const name of historyFiles)if(/(^|\/)(?:sign|\.env)(?:\/|$)|\.(?:pem|p12|pfx)$/i.test(name))findings.push({file:name,reason:'sensitive path in history'});
const report={files:count,bytes,findings};fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/release-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:count,bytes,findings}));if(findings.length)process.exitCode=1;
