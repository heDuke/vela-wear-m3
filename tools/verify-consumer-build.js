// SPDX-License-Identifier: GPL-3.0-or-later
// Build the Demo in a fresh project against the packed library, without local baselines or signing keys.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),project=path.resolve(root,'out/fresh-consumer-project'),allowed=path.resolve(root,'out')+path.sep;
assert(project.startsWith(allowed)&&path.basename(project)==='fresh-consumer-project');
if(fs.existsSync(project)){assert(!fs.lstatSync(project).isSymbolicLink());fs.rmSync(project,{recursive:true,force:true})}
fs.mkdirSync(project,{recursive:true});
for(const name of ['template','tools','licenses'])fs.cpSync(path.join(root,name),path.join(project,name),{recursive:true});
for(const name of ['package.json','LICENSE.md'])fs.copyFileSync(path.join(root,name),path.join(project,name));
fs.mkdirSync(path.join(project,'docs/releases/0.1.0'),{recursive:true});fs.copyFileSync(path.join(root,'docs/releases/0.1.0/baseline-size-report.json'),path.join(project,'docs/releases/0.1.0/baseline-size-report.json'));
fs.mkdirSync(path.join(project,'node_modules'),{recursive:true});
const modules={'vela-wear-m3':path.join(root,'out/library-consumer/package'),'aiot-toolkit':path.dirname(require.resolve('aiot-toolkit/package.json')),'jsrsasign':path.dirname(require.resolve('jsrsasign/package.json'))};
for(const [name,actual]of Object.entries(modules)){
 assert(fs.existsSync(actual));fs.symlinkSync(actual,path.join(project,'node_modules',name),process.platform==='win32'?'junction':'dir');
}
const result=spawnSync(process.execPath,['tools/build-all.js','band9','--basic'],{cwd:project,encoding:'utf8',maxBuffer:4*1024*1024});
fs.writeFileSync(path.join(root,'out/fresh-consumer-build.log'),(result.stdout||'')+(result.stderr||''));
if(result.status)throw Error('Fresh consumer build failed; see out/fresh-consumer-build.log');
const rows=JSON.parse(fs.readFileSync(path.join(project,'out/size-report.json')));assert.equal(rows.length,2);assert(rows.every(row=>row.currentBaseline&&row.warnings.length===0));
fs.writeFileSync(path.join(root,'out/fresh-consumer-report.json'),JSON.stringify({library:'packed tarball',device:'band9',api:1,modes:['debug','release'],usesLocalBaseline:false,usesOriginalSigningKey:false,passed:true},null,2)+'\n');
console.log('Fresh project built debug/release against the independent tarball; no local baseline or original signing key required');
