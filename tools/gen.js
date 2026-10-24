// Demo consumes the independent library through a package dependency.
const path=require('path'),{generate}=require('vela-wear-m3');
const args=process.argv.slice(2),a=args.indexOf('--animation');
const r=generate({input:path.resolve(__dirname,'../template'),output:path.resolve(__dirname,'../src'),device:args[0]||'round',animation:a>=0?args[a+1]:'basic',replace:true});
console.log('[gen] '+r.device+' '+r.animation+' ('+r.images+' images)');
const fs=require('fs'),legal=path.join(r.output,'common/legal/demo');fs.mkdirSync(legal,{recursive:true});
// Demo 品牌素材遵循非商业许可，不放入独立 GPL 组件库。
fs.copyFileSync(path.resolve(__dirname,'../docs/design/brand/sailboat-circle-192.png'),path.join(r.output,'common/logo.png'));
for(const [source,target]of [['LICENSE.md','LICENSE.txt'],['licenses/PolyForm-Noncommercial-1.0.0.md','PolyForm-Noncommercial-1.0.0.txt']])fs.copyFileSync(path.resolve(__dirname,'..',source),path.join(legal,target));
