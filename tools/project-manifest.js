const fs=require('fs'),path=require('path');
module.exports=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'../template/manifest.tpl.json'),'utf8').replace(/\$\[[^\]]*\]/g,'0'));
