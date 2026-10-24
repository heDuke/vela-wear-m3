// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke.
// 导出项目标识素材；Demo 生成入口会使用导出的 192px 圆形图标。
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const output = path.resolve(__dirname, '../docs/design/brand');
const source = fs.readFileSync(path.join(output, 'sailboat.svg'), 'utf8');
const svg = source.replace(/^<\?xml[^>]*>\s*/, '');
const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
const shapeCss = { square: '', circle: 'border-radius:50%;', rounded: 'border-radius:23.4375%;' };

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || (process.platform === 'win32'
      ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome'),
    headless: true
  });
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    for (const shape of Object.keys(shapeCss)) {
      for (const size of [1024, 512, 192]) {
        await page.setViewportSize({ width: size, height: size });
        await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${size}px;height:${size}px;${shapeCss[shape]}}</style><img alt="" src="${dataUrl}">`);
        await page.locator('img').evaluate(img => img.decode());
        const suffix = shape === 'square' ? '' : '-' + shape;
        await page.screenshot({ path: path.join(output, `sailboat${suffix}-${size}.png`), omitBackground: true });
      }
    }

    const large = shape => `<figure><img class="hero ${shape}" src="${dataUrl}" alt="小帆船${shape === 'circle' ? '圆形' : '圆角方形'}裁切"><figcaption>${shape === 'circle' ? '圆形头像' : '圆角方形图标'}</figcaption></figure>`;
    const small = theme => `<section class="samples ${theme}"><div class="sample-label">${theme === 'light' ? '浅色背景' : '深色背景'} · 实际像素</div>${[32, 48].map(size => `<div class="sample-row"><span>${size}px</span><img class="circle" width="${size}" height="${size}" src="${dataUrl}" alt="${size}px 圆形"><img class="rounded" width="${size}" height="${size}" src="${dataUrl}" alt="${size}px 圆角方形"></div>`).join('')}</section>`;
    await page.setViewportSize({ width: 1440, height: 1040 });
    await page.setContent(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>vela-wear-m3 小帆船图标预览</title><style>
      *{box-sizing:border-box}body{margin:0;padding:64px 80px;background:#141218;color:#F6EDFF;font-family:Segoe UI,Microsoft YaHei,sans-serif}
      header{display:flex;justify-content:space-between;align-items:center}h1{font-size:34px;margin:0 0 10px;font-weight:650}p{margin:0;color:#CAC4D0;font-size:16px}.tag{padding:12px 20px;background:#332E3C;border-radius:28px;color:#E9DDFF;font-size:15px}
      .showcase{display:flex;justify-content:center;gap:136px;margin:44px 0 36px}figure{margin:0;text-align:center}.hero{display:block;width:320px;height:320px}.circle{border-radius:50%}.rounded{border-radius:23.4375%}figcaption{margin-top:16px;font-size:16px;color:#CAC4D0}
      .checks{display:flex;gap:24px}.samples{flex:1;border-radius:28px;padding:24px 32px;height:202px}.light{background:#F8F5FC;color:#332E3C}.dark{background:#211E27;color:#F6EDFF}.sample-label{font-size:15px;margin-bottom:14px}.sample-row{display:flex;align-items:center;gap:28px;height:62px}.sample-row span{width:42px;font-size:13px;opacity:.75}
      footer{display:flex;justify-content:space-between;margin-top:32px;font-size:13px;color:#CAC4D0}.swatches{display:flex;gap:8px}.swatches i{display:block;width:24px;height:24px;border-radius:50%}.caption{margin-top:20px;font-size:13px;color:#CAC4D0}
    </style><header><div><h1>vela-wear-m3</h1><p>小帆船 · 项目标识设计</p></div><div class="tag">圆润几何 / 轻快启航</div></header><div class="showcase">${large('rounded')}${large('circle')}</div><div class="checks">${small('light')}${small('dark')}</div><footer><span>原创标识 · SVG 矢量绘制 · © 2026 heDuke</span><div class="swatches">${['#67508F','#E9DDFF','#BAC3FF','#FFDCC2'].map(color => `<i style="background:${color}"></i>`).join('')}</div></footer><div class="caption">设计预览，非设备截图。32 / 48px 样本按原始像素渲染；图片缩放显示时请下载原图查看。</div></html>`);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await page.screenshot({ path: path.join(output, 'preview.png') });
    const geometry = await page.evaluate((svgText) => {
      const holder = document.createElement('div');
      holder.innerHTML = svgText;
      document.body.appendChild(holder);
      const box = holder.querySelector('#sailboat').getBBox();
      const bounds = { x: box.x, y: box.y, width: box.width, height: box.height };
      holder.remove();
      return bounds;
    }, svg);
    console.log(JSON.stringify({ output, pngCount: 10, markBounds: geometry,
      widthRatio: +(geometry.width / 1024).toFixed(4),
      sailToHullGap: 48, sailToHullGapAt32px: 1.5,
      source: '原创 SVG，使用 Chrome 导出；非模拟器或真机截图' }, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
