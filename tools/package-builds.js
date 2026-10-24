// Package only a complete, verified current build matrix.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),archiver=require('archiver');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const version=require('./project-manifest')().versionName;
const rows=JSON.parse(fs.readFileSync('out/size-report.json','utf8'));
const expected=new Set();
for(const d of ['round','pro','band10','band9'])for(const api of [1,2])for(const mode of ['debug','release'])expected.add(d+'-'+api+'-'+mode);
for(const row of rows){
 const key=row.device+'-'+row.api+'-'+row.mode;
 if(!expected.delete(key))throw new Error('重复或未知构建项 '+key);
 if(fs.statSync(row.file).size!==row.bytes)throw new Error('产物与构建记录不一致 '+row.file);
 row.sha256=crypto.createHash('sha256').update(fs.readFileSync(row.file)).digest('hex');
}
if(expected.size)throw new Error('构建矩阵未完整：'+[...expected].join(', '));
const readme=[
 'Wear Material 3 Expressive Vela Demo '+version+' / com.velam3.demo',
 '四设备 × API 1 基础版、API 2 增强版 × debug/release，共 16 个 RPK。',
 'round 466×466；pro 336×480；band10 212×520；band9 192×490。',
 'API 等级与 debug/release 构建模式分别选择；安装取决于固件和安装工具，本次不作通用侧载推荐。',
 'release 是构建模式，不代表稳定性认证；API 2 为实验性配置。',
 'API 1：原生基础动画；对勾描画和连续圆角变形存在降级。',
 'API 2：image-animator 补足局部图形帧动画。',
 '本轮新 UI 尚未完成 Vela 模拟器及真机验收；设计预览不能代表设备实测。',
 '组件库与 API：https://github.com/heDuke/vela-wear-m3/blob/v0.1.0/packages/vela-wear-m3/docs/API.md',
 '对应源码、许可及构建提交见 GitHub 预发布的 RELEASE-PROVENANCE.json。',
 '所有 release 包均超过交接时 81 KB 的体积预算，具体值见 size-report.json。',
 'SHA256SUMS.txt 可核对安装包完整性。源码参考固定 androidx 提交 2f557dc1f1ec71edae73e2c16b0e446523c644b7。',
 '',
 ...rows.map(r=>path.basename(r.file)+'  '+r.bytes+' B  '+(r.warnings.length?'编译告警 '+r.warnings.length:'无新增编译告警'))
].join('\n');
async function zip(name,subset){
 await new Promise((resolve,reject)=>{
 const dest=fs.createWriteStream('out/'+name),zip=archiver('zip',{zlib:{level:9}});
 dest.on('close',resolve);dest.on('error',reject);zip.on('error',reject);zip.pipe(dest);
 for(const row of subset)zip.file(row.file,{name:path.basename(row.file)});
 zip.append(readme,{name:'README.txt'});
 zip.append(subset.map(r=>r.sha256+'  '+path.basename(r.file)).join('\n')+'\n',{name:'SHA256SUMS.txt'});
 zip.append(JSON.stringify(subset,null,2)+'\n',{name:'size-report.json'});
 zip.finalize();
 });console.log(name+' '+fs.statSync('out/'+name).size+' B');
}
(async()=>{
 for(const device of ['round','pro','band10','band9'])await zip('velam3demo-'+version+'-'+device+'.zip',rows.filter(r=>r.device===device));
 await zip('velam3demo-'+version+'-all-devices.zip',rows);
 fs.writeFileSync('out/SHA256SUMS.txt',rows.map(r=>r.sha256+'  '+path.basename(r.file)).join('\n')+'\n');
 fs.writeFileSync('out/package-report.json',JSON.stringify(rows,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
