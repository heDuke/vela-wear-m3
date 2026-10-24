// SPDX-License-Identifier: GPL-3.0-or-later
// Explicit release operations. Credentials stay in memory; no token is logged or saved.
const fs=require('fs'),path=require('path'),https=require('https'),crypto=require('crypto');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
const repo='heDuke/vela-wear-m3',version=require('../packages/vela-wear-m3/package.json').version,tag='v'+version;
let token;
function credential(){if(token)return token;const raw=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',stdio:['pipe','pipe','pipe']});token=raw.split(/\r?\n/).find(s=>s.startsWith('password='))?.slice(9);if(!token)throw Error('GitHub credential unavailable');return token}
function request(url,{method='GET',body,auth=true,accept='application/vnd.github+json',type='application/json'}={}){
 const u=new URL(url.startsWith('https:')?url:'https://api.github.com'+url);
 if(u.protocol!=='https:')throw Error('HTTPS required');
 const payload=Buffer.isBuffer(body)?body:body===undefined?null:Buffer.from(JSON.stringify(body));
 const headers={'User-Agent':'vela-wear-m3-release','Accept':accept,'X-GitHub-Api-Version':'2022-11-28'};
 if(auth){if(!['api.github.com','uploads.github.com'].includes(u.hostname))throw Error('Unexpected credential destination');headers.Authorization='Bearer '+credential()}
 if(payload){headers['Content-Type']=type;headers['Content-Length']=payload.length}
 return new Promise((resolve,reject)=>{const req=https.request(u,{method,headers},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>{const data=Buffer.concat(chunks);if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location){request(new URL(res.headers.location,u).href,{auth:false,accept}).then(resolve,reject);return}if(res.statusCode>=400){if(res.statusCode===404)return resolve(null);return reject(Error('GitHub HTTP '+res.statusCode+' '+u.pathname))}resolve({data,headers:res.headers,json:()=>JSON.parse(data.toString('utf8'))})})});req.setTimeout(60000,()=>req.destroy(Error('GitHub request timed out')));req.on('error',reject);if(payload)req.write(payload);req.end()})
}
const api=s=>'/repos/'+repo+s;
function files(){const manifest=require('./project-manifest')();return [path.join('out/library-consumer','vela-wear-m3-'+version+'.tgz'),...['round','pro','band10','band9','all-devices'].map(d=>'out/velam3demo-'+manifest.versionName+'-'+d+'.zip'),'out/community-release/SHA256SUMS.txt','out/community-release/RELEASE-PROVENANCE.json','out/community-release/release-audit.json','out/community-release/artifact-validation.json']}
async function release(){
 const r=await request(api('/releases/tags/'+tag));if(r)return r.json();
 // GitHub's tag endpoint can omit drafts; owners can retrieve them from the list.
 const list=await request(api('/releases?per_page=100'));return list?.json().find(x=>x.tag_name===tag)||null;
}
async function main(){const command=process.argv[2];
 if(command==='inspect'){const [r,l,t]=await Promise.all([request(api('')),request(api('/releases')),request(api('/git/ref/tags/'+tag))]);console.log(JSON.stringify({repository:r?.json().full_name,private:r?.json().private,releases:l?.json().map(x=>({tag:x.tag_name,draft:x.draft,prerelease:x.prerelease,url:x.html_url})),tag:t?.json().object}));return}
 if(command==='markdown'){const r=await request('/markdown',{method:'POST',body:{text:fs.readFileSync('README.md','utf8'),mode:'gfm',context:repo}});fs.writeFileSync('out/readme-rendered.html',r.data);console.log('GitHub GFM renderer saved README HTML');return}
 if(command==='runs'){const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const r=await request(api('/actions/runs?head_sha='+sha));console.log(JSON.stringify(r.json().workflow_runs.map(x=>({id:x.id,status:x.status,conclusion:x.conclusion,url:x.html_url}))));return}
 if(command==='stage'){
  const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const existing=await request(api('/git/ref/tags/'+tag));if(existing){if(existing.json().object.sha!==sha)throw Error('Release tag exists at another commit; refusing to move it')}else await request(api('/git/refs'),{method:'POST',body:{ref:'refs/tags/'+tag,sha}});
  let r=await release();if(r&&!r.draft)throw Error('Public release already exists; refusing replacement');
  if(!r){const created=await request(api('/releases'),{method:'POST',body:{tag_name:tag,target_commitish:sha,name:'vela-wear-m3 '+version+' / Demo '+require('./project-manifest')().versionName+' · 社区测试预发布',body:fs.readFileSync('docs/releases/0.1.0/COMMUNITY-RELEASE.md','utf8'),draft:true,prerelease:true}});r=created.json()}
  for(const file of files()){const name=path.basename(file),bytes=fs.readFileSync(file),old=r.assets.find(x=>x.name===name);if(old){if(old.digest==='sha256:'+crypto.createHash('sha256').update(bytes).digest('hex'))continue;throw Error('Draft has conflicting asset '+name)}const endpoint=r.upload_url.replace(/\{.*$/,'')+'?name='+encodeURIComponent(name);const uploaded=await request(endpoint,{method:'POST',body:bytes,type:'application/octet-stream'});if(!uploaded||uploaded.json().size!==bytes.length)throw Error('Upload mismatch '+name);console.log('Uploaded '+name+' ('+bytes.length+' B)')}
  fs.writeFileSync('out/release-state.json',JSON.stringify({id:r.id,tag,sha,url:r.html_url},null,2)+'\n');return
 }
 if(command==='publish'){
  const r=await release();if(!r)throw Error('No draft release');if(r.assets.length!==files().length)throw Error('Unexpected asset count');
  for(const file of files()){const a=r.assets.find(x=>x.name===path.basename(file)),expected='sha256:'+crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(!a||a.digest!==expected)throw Error('Draft digest mismatch '+path.basename(file))}
  const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const runs=await request(api('/actions/runs?head_sha='+sha));if(!runs?.json().workflow_runs.some(x=>x.name==='Verify source and library'&&x.status==='completed'&&x.conclusion==='success'))throw Error('Source/library CI has not passed for current HEAD');
  if(r.draft)await request(api('/releases/'+r.id),{method:'PATCH',body:{draft:false,prerelease:true,make_latest:'false'}});console.log('Published https://github.com/'+repo+'/releases/tag/'+tag);return
 }
 if(command==='verify'){
  const r=await release();if(!r||r.draft||!r.prerelease)throw Error('Public prerelease unavailable');const results=[];
  for(const file of files()){const name=path.basename(file),asset=r.assets.find(x=>x.name===name);if(!asset)throw Error('Missing release asset '+name);const download=await request(asset.browser_download_url,{auth:false,accept:'application/octet-stream'});if(!download)throw Error('Public download unavailable '+name);const expected=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),actual=crypto.createHash('sha256').update(download.data).digest('hex');if(expected!==actual)throw Error('Public SHA-256 mismatch '+name);results.push({file:name,bytes:download.data.length,sha256:actual,url:asset.browser_download_url});console.log('Public download verified: '+name)}
  for(const file of ['README.md','packages/vela-wear-m3/docs/API.md','packages/vela-wear-m3/docs/COMPONENTS.md','packages/vela-wear-m3/docs/GETTING-STARTED.md','docs/promotion/bandbbs/POST.md','docs/promotion/bandbbs/cover-light.png','docs/promotion/bandbbs/round-motion.gif']){const publicFile=await request(api('/contents/'+file+'?ref='+tag),{auth:false});if(!publicFile||!publicFile.json().sha)throw Error('Public source link unavailable '+file)}
  fs.writeFileSync('out/public-download-validation.json',JSON.stringify(results,null,2)+'\n');return
 }
 throw Error('Usage: node tools/github-release.js inspect|markdown|runs|stage|publish|verify')
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
