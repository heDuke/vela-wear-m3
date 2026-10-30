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
 const media=path.join(dest,'generated',device+'-'+animation+'-media');
 independent.generate({input:path.join(dest,'package/examples/media/template'),output:media,device,animation});
 for(const pg of ['index','player','podcast','audio']){const ux=fs.readFileSync(path.join(media,'pages',pg,pg+'.ux'),'utf8');assert(!/#component|#include|#set|@\{|\$\[|\$\(/.test(ux),'media '+pg+' unexpanded');}
 const player=fs.readFileSync(path.join(media,'pages/player/player.ux'),'utf8');
 assert(player.includes('onclick="mdPlayTap"')&&player.includes('onclick="mdNextTap"')&&player.includes('<marquee id="mdMarquee"'));
 assert(fs.readFileSync(path.join(media,'pages/podcast/podcast.ux'),'utf8').includes('md_fwd30_24.png'));
 assert(fs.readFileSync(path.join(media,'pages/audio/audio.ux'),'utf8').includes("import audio from '@system.audio'"));
 // paused circle ring + 0 % start dot
 for(const n of ['md_c0_Z','md_c1_I','md_c9_I','md_cring_t','md_r0_Z'])assert(player.includes('/common/img/'+n+'.png')&&fs.existsSync(path.join(media,'common/img',n+'.png')),n);
 assert(/\.md-pdis \{background-color:rgba\(246,237,255,0\.16\)/.test(player),'disabled container = onSurface 16 %');
 for(const img of fs.readFileSync(path.join(media,'pages/player/player.ux'),'utf8').match(/\/common\/img\/md_[A-Za-z0-9_]+\.png/g))assert(fs.existsSync(path.join(media,img)),img);
 assert(!fs.readdirSync(path.join(output,'common/img')).some(f=>f.startsWith('md_')),'media assets must not leak into pages that do not use them');
 if(configurations===1){const G=require(path.join(dest,'package/tools/media-geom.js')),r=G.ring(),b=G.button();
  assert.deepEqual(G.circleNames(20),['md_c0_I','md_c0_P2','md_c0_Z','md_c1_I','md_c1_P2','md_c9_I']);assert.equal(G.lobeState(0,0,40),'md_r0_Z');let lo=1e9,hi=0;for(let i=0;i<r.pts.length;i+=5){const p=r.pts[i];let m=1e9;for(const q of b)m=Math.min(m,Math.hypot(p[0]-q[0],p[1]-q[1]));lo=Math.min(lo,m);hi=Math.max(hi,m)}assert(hi-lo<.05&&Math.abs(lo-G.ringOffset())<.05,'wavy ring must be the scallop offset outward (uniform gap)');}
}
const protect=path.join(dest,'not-generated');fs.mkdirSync(protect,{recursive:true});fs.writeFileSync(path.join(protect,'user.txt'),'keep');
assert.throws(()=>independent.generate({input:path.join(dest,'package/examples/minimal/template'),output:protect}),/not owned/);assert.equal(fs.readFileSync(path.join(protect,'user.txt'),'utf8'),'keep');
assert.throws(()=>independent.componentSource('missing'),/Unknown component/);
assert.throws(()=>independent.componentSource('card',{}),/Missing string binding/);
fs.writeFileSync(path.join(root,'out/library-package-report.json'),JSON.stringify({package:receipt[0].name,version:receipt[0].version,bytes:receipt[0].size,files:receipt[0].entryCount,configurations,integrity:receipt[0].integrity,standalone:true},null,2)+'\n');
console.log('Standalone tarball: '+configurations+' device/API configurations verified; '+receipt[0].size+' B');
