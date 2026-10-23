// Independent tarball consumption is the release gate, not a workspace-only require.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),lib=path.join(root,'packages/vela-wear-m3'),dest=path.join(root,'out/library-consumer');
fs.mkdirSync(dest,{recursive:true});
const npmCli=process.env.npm_execpath||path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const npmArgs=['pack',lib,'--json','--pack-destination',dest,'--cache',path.join(root,'out/npm-cache')];
const packed=spawnSync(fs.existsSync(npmCli)?process.execPath:'npm',fs.existsSync(npmCli)?[npmCli,...npmArgs]:npmArgs,{encoding:'utf8'});if(packed.status)throw Error(packed.stderr);
const receipt=JSON.parse(packed.stdout),archive=path.join(dest,receipt[0].filename);
assert(receipt[0].files.some(x=>x.path==='LICENSE'));
assert(!receipt[0].files.some(x=>/\.cache|private\.pem|node_modules|^template\//.test(x.path)),'tarball must exclude SDK/cache/secrets/Demo');
const extracted=path.resolve(dest,'package');assert(path.dirname(extracted)===dest,'unsafe extraction cleanup');
if(fs.existsSync(extracted))fs.rmSync(extracted,{recursive:true,force:true});
const extract=spawnSync('tar',['-xf',archive,'-C',dest],{encoding:'utf8'});if(extract.status)throw Error(extract.stderr);
const independent=require(path.join(dest,'package'));
let configurations=0;
for(const device of Object.keys(independent.devices))for(const animation of ['basic','enhanced']){
 const output=path.join(dest,'generated',device+'-'+animation);
 independent.generate({input:path.join(dest,'package/examples/minimal/template'),output,device,animation});
 const page=fs.readFileSync(path.join(output,'pages/index/index.ux'),'utf8');assert(page.includes('onclick="toggle"'));assert(!/#component|#include|@\{|\$\[/.test(page));
 assert.equal(JSON.parse(fs.readFileSync(path.join(output,'manifest.json'))).minAPILevel,animation==='basic'?1:2);
 assert(fs.existsSync(path.join(output,'common/legal/vela-wear-m3/LICENSE.txt')));
 configurations++;
}
const protect=path.join(dest,'not-generated');fs.mkdirSync(protect,{recursive:true});fs.writeFileSync(path.join(protect,'user.txt'),'keep');
assert.throws(()=>independent.generate({input:path.join(dest,'package/examples/minimal/template'),output:protect}),/not owned/);assert.equal(fs.readFileSync(path.join(protect,'user.txt'),'utf8'),'keep');
assert.throws(()=>independent.componentSource('missing'),/Unknown component/);
assert.throws(()=>independent.componentSource('card',{}),/Missing string binding/);
fs.writeFileSync(path.join(root,'out/library-package-report.json'),JSON.stringify({package:receipt[0].name,version:receipt[0].version,bytes:receipt[0].size,files:receipt[0].entryCount,configurations,integrity:receipt[0].integrity,standalone:true},null,2)+'\n');
console.log('Standalone tarball: '+configurations+' device/API configurations verified; '+receipt[0].size+' B');
