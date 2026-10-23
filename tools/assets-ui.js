// Locate Pillow's Python without assuming a Unix command name on Windows.
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const candidates=[process.env.PYTHON,process.platform==='win32'?path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'):null,'python3','python'].filter(Boolean);
let python;
for(const candidate of candidates){const p=spawnSync(candidate,['-c','import PIL'],{stdio:'ignore'});if(p.status===0){python=candidate;break}}
if(!python)throw new Error('请安装含 Pillow 的 Python，或设置 PYTHON 为其可执行文件路径。');
for(const script of process.argv.includes('--all')?['tools/quant.py','tools/ui-assets.py']:['tools/ui-assets.py']){
 const r=spawnSync(python,[script],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)
}
