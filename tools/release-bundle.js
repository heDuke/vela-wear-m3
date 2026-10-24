// SPDX-License-Identifier: GPL-3.0-or-later
// Assemble release metadata; old RPKs are reusable only when emitted source digests match.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');process.chdir(root);
const {generate}=require('../packages/vela-wear-m3');
const version=require('../packages/vela-wear-m3/package.json').version,demo=require('./project-manifest')().versionName;
const sourceCommit='a8c3af9f52e5f405af7ca5877aa6c5d767c45b2f';
const rows=JSON.parse(fs.readFileSync('out/size-report.json'));
const validated=JSON.parse(fs.readFileSync('docs/releases/0.1.0/artifact-validation.json'));
const out=path.resolve('out/community-release');fs.mkdirSync(out,{recursive:true});
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function digest(folder){const h=crypto.createHash('sha256');function walk(d){for(const name of fs.readdirSync(d).sort()){const file=path.join(d,name);if(fs.statSync(file).isDirectory())walk(file);else{h.update(path.relative(folder,file));h.update(fs.readFileSync(file))}}}walk(folder);return h.digest('hex')}
const checked=new Set(),artifacts=[];
for(const row of rows){
 const old=validated.find(x=>x.device===row.device&&x.api===row.api&&x.mode===row.mode);
 if(!old||sha(row.file)!==old.sha256)throw Error('RPK differs from verified baseline '+row.file);
 const key=row.device+'-'+row.api;
 if(!checked.has(key)){
  const target=path.join(root,'out/release-source-check',key);
  generate({input:path.join(root,'template'),output:target,device:row.device,animation:row.api===1?'basic':'enhanced'});
  const legal=path.join(target,'common/legal/demo');fs.mkdirSync(legal,{recursive:true});
  for(const [from,to]of [['LICENSE.md','LICENSE.txt'],['licenses/PolyForm-Noncommercial-1.0.0.md','PolyForm-Noncommercial-1.0.0.txt']])fs.copyFileSync(from,path.join(legal,to));
  if(digest(target)!==row.sourceDigest)throw Error('Generated source changed; cannot reuse '+key);
  checked.add(key);
 }
 artifacts.push({file:path.basename(row.file),device:row.device,api:row.api,mode:row.mode,bytes:fs.statSync(row.file).size,sha256:old.sha256,sourceDigest:row.sourceDigest});
}
if(artifacts.length!==16||checked.size!==8)throw Error('Incomplete RPK matrix');
const provenance={libraryVersion:version,librarySourceRef:'refs/tags/v'+version,demoVersion:demo,rpkSourceCommit:sourceCommit,rpkSourceUrl:'https://github.com/heDuke/vela-wear-m3/tree/'+sourceCommit,generatedSourceConfigurationsMatched:checked.size,rpkReuse:'Original verified RPK bytes, not rebuilt; generated sources still match all eight sourceDigest receipts.',knownLimits:'Native performance and API 2 validation incomplete; Demo exceeds package budgets.',artifacts};
fs.writeFileSync(path.join(out,'RELEASE-PROVENANCE.json'),JSON.stringify(provenance,null,2)+'\n');
for(const name of ['release-audit.json','artifact-validation.json'])fs.copyFileSync(path.join(root,'out',name),path.join(out,name));
const assets=[path.join('out/library-consumer','vela-wear-m3-'+version+'.tgz'),...['round','pro','band10','band9','all-devices'].map(d=>'out/velam3demo-'+demo+'-'+d+'.zip'),...['RELEASE-PROVENANCE.json','release-audit.json','artifact-validation.json'].map(n=>path.join(out,n))];
fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),assets.map(file=>sha(file)+'  '+path.basename(file)).join('\n')+'\n');
fs.writeFileSync(path.join(out,'distribution-report.json'),JSON.stringify(assets.map(file=>({file:path.basename(file),bytes:fs.statSync(file).size,sha256:sha(file)})),null,2)+'\n');
console.log('8 generated source digests and 16 original RPK hashes match; release metadata assembled');
