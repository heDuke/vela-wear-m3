// SPDX-License-Identifier: GPL-3.0-or-later
// Verify documented component bindings and local links, without editing sources.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),lib=require('../packages/vela-wear-m3');
const componentDoc=fs.readFileSync(path.join(root,'packages/vela-wear-m3/docs/COMPONENTS.md'),'utf8');
const covered=new Set();let snippets=0;
for(const m of componentDoc.matchAll(/^<!-- #component ([\w-]+) (\{.*\}) -->/gm)){
 const bindings=JSON.parse(m[2]),rendered=lib.componentSource(m[1],bindings);assert(!/@\{\w+\}/.test(rendered),'Unexpanded binding '+m[1]);covered.add(m[1]);snippets++;
}
assert.deepEqual([...covered].sort(),Object.keys(lib.components).sort(),'Every registered component needs an example');
const files=['README.md','packages/vela-wear-m3/README.md','packages/vela-wear-m3/docs/API.md','packages/vela-wear-m3/docs/COMPONENTS.md','packages/vela-wear-m3/docs/GETTING-STARTED.md','docs/promotion/bandbbs/README.md','docs/promotion/bandbbs/POST.md'];
let links=0;
for(const file of files){const text=fs.readFileSync(path.join(root,file),'utf8').replace(/```[\s\S]*?```/g,'');for(const m of text.matchAll(/\]\(([^)]+)\)|(?:src|srcset)="([^"]+)"/g)){const href=m[1]||m[2];if(/^(?:https?:|#|mailto:)/.test(href))continue;const target=href.split('#')[0];assert(fs.existsSync(path.resolve(root,path.dirname(file),target)),file+' broken link '+href);links++}}
const result={componentExamples:snippets,registeredComponents:covered.size,localLinks:links,passed:true};
fs.mkdirSync(path.join(root,'out'),{recursive:true});fs.writeFileSync(path.join(root,'out/docs-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
