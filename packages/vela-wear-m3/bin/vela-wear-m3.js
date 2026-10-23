#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. Upstream material retains its own terms; see NOTICE.
const {generate}=require('..');
const args=process.argv.slice(2),value=k=>{const i=args.indexOf('--'+k);return i<0?undefined:args[i+1]};
if(args[0]!=='gen'){console.log('Usage: vela-wear-m3 gen --input template --out src --device round|pro|band10|band9 --animation basic|enhanced');process.exit(args.includes('--help')?0:1)}
try{const result=generate({input:value('input'),output:value('out'),device:value('device'),animation:value('animation')});console.log(JSON.stringify(result))}catch(e){console.error(e.message);process.exitCode=1}
