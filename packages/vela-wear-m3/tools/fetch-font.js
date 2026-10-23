// SPDX-License-Identifier: GPL-3.0-or-later
// Optional development input. The font binary is not part of the npm package.
const fs=require('fs'),path=require('path'),https=require('https'),crypto=require('crypto'),source=require('./font-source.json');
const dest=path.join(__dirname,'../.cache/fonts/NotoSansSC.ttf');
https.get(source.url,r=>{if(r.statusCode!==200){r.resume();console.error('Font HTTP '+r.statusCode);process.exitCode=1;return}const chunks=[];r.on('data',c=>chunks.push(c));r.on('end',()=>{const font=Buffer.concat(chunks);if(crypto.createHash('sha256').update(font).digest('hex')!==source.sha256){console.error('Font source changed: checksum mismatch');process.exitCode=1;return}fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,font);console.log('Verified OFL font cached')})}).on('error',e=>{console.error(e.message);process.exitCode=1});
