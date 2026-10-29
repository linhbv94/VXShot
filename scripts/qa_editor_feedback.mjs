// Fixture-only browser QA; no native clipboard, dialogs, settings or user files.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.VXSHOT_PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.VXSHOT_BROWSER });
try {
 const page = await browser.newPage({viewport:{width:1200,height:900}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/services/tauri_bridge.ts', async route => {
  const names = [...readFileSync(new URL('../src/services/tauri_bridge.ts',import.meta.url),'utf8').matchAll(/export const (\w+)/g)].map(m=>m[1]);
  const overrides = {
   isTauriEnvironment:'()=>false', getAppSettings:'async()=>null',
   readClipboardImage:'async()=>window.__fixture', openFileDialog:'async()=>window.__fixture',
   openSaveDialog:"async()=>'/fixture/output.png'", saveImageFile:'async o=>{window.__saved=o;return {success:true,file_path:o.file_path,bytes_written:o.image_bytes.length}}',
   writeClipboardImage:'async o=>{window.__copied=o}',
  };
  await route.fulfill({contentType:'application/javascript',body:names.map(n=>`export const ${n} = ${overrides[n] || (n.startsWith('listen') ? 'async()=>()=>{}' : 'async()=>{}')};`).join('\n')});
 });
 await page.addInitScript(()=>{
  const c=document.createElement('canvas');c.width=400;c.height=300;const ctx=c.getContext('2d');ctx.fillStyle='#00aa44';ctx.fillRect(0,0,400,300);
  window.__fixture={data_url:c.toDataURL(),width:400,height:300,has_alpha:false};
 });
 await page.goto(process.env.VXSHOT_QA_URL || 'http://127.0.0.1:5188');
 const canvas=page.locator('canvas');await canvas.waitFor();await page.waitForTimeout(150);
 const key=async k=>{await page.keyboard.press(k);await page.waitForTimeout(70)};
 const pixel=async(x,y)=>canvas.evaluate((c,[x,y])=>[...c.getContext('2d').getImageData(x,y,1,1).data],[x,y]);
 const point=async(x,y)=>{const b=await canvas.boundingBox();return {x:b.x+x*b.width/400,y:b.y+y*b.height/300}};
 const drag=async(x,y,dx,dy)=>{const p=await point(x,y);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y+dy,{steps:4});await page.mouse.up();await page.waitForTimeout(70)};
 assert.deepEqual(await pixel(10,10),[0,170,68,255]);
 await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#aa0044';ctx.fillRect(0,0,100,80);window.__fixture={data_url:c.toDataURL(),width:100,height:80,has_alpha:false}});
 await key('Control+v');await page.waitForTimeout(150);
 assert.deepEqual(await pixel(170,130),[170,0,68,255]);assert.deepEqual(await pixel(10,10),[0,170,68,255]);
 await drag(180,140,70,45);assert.deepEqual(await pixel(170,130),[0,170,68,255]);assert.deepEqual(await pixel(240,170),[170,0,68,255]);
 await key('Control+z');assert.deepEqual(await pixel(170,130),[170,0,68,255]);
 await key('Control+Shift+z');assert.deepEqual(await pixel(240,170),[170,0,68,255]);
 const selectedPoint=await point(240,170);await page.mouse.click(selectedPoint.x,selectedPoint.y);await key('Delete');assert.deepEqual(await pixel(240,170),[0,170,68,255]);await key('Control+z');
 await key('v');await drag(20,20,15,12);assert.deepEqual(await pixel(5,5),[0,0,0,0]);assert.deepEqual(await pixel(240,170),[170,0,68,255]);await key('Control+z');
 await key('t');const p=await point(30,35);await page.mouse.click(p.x,p.y);const text=page.getByRole('textbox',{name:'Nhập văn bản'});await text.fill('Xin chào VXShot');await key('Enter');assert.equal(await text.count(),0);
 const hasInk=()=>canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(20,20,210,50).data;return Array.from(d).some((v,i)=>i%4===0&&v>100)});
 assert(await hasInk());await key('v');await drag(50,42,0,80);assert.equal(await hasInk(),false);await key('Control+z');assert(await hasInk());
 // Line/ellipse/pen hit tests and move use actual pointer gestures.
 for (const [tool,x,y,dx,dy] of [['l',40,170,60,30],['o',50,220,60,30],['p',280,40,40,30]]) {
  await key(tool);await drag(x,y,dx,dy);await key('v');
  await drag(x+dx/2,y+dy/2,25,0);await key('Control+z');await key('Control+Shift+z');
 }
 // Fast privacy drag plus overlapping mosaic: exported mask must stay fully opaque.
 await key('b');await drag(310,220,40,40);await key('m');await drag(300,210,60,60);assert.deepEqual(await pixel(330,240),[0,0,0,255]);
 const before=await canvas.evaluate(c=>({w:c.width,h:c.height}));
 const handle=page.getByRole('button',{name:'Mở rộng canvas nw'});const b=await handle.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-50,b.y+b.height/2-40,{steps:5});await page.mouse.up();await page.waitForTimeout(100);
 assert.equal(await canvas.getAttribute('width'),'450');assert.equal(await canvas.getAttribute('height'),'340');assert.deepEqual(await pixel(10,10),[0,0,0,0]);assert.deepEqual(await pixel(65,55),[0,170,68,255]);
 await key('Control+z');assert.equal(await canvas.getAttribute('width'),String(before.w));await key('Control+Shift+z');
 await key('Control+Shift+c');await page.waitForFunction(()=>window.__copied?.image_bytes.length>0);
 const exported=await page.evaluate(async()=>{const p=window.__copied;const img=await createImageBitmap(new Blob([new Uint8Array(p.image_bytes)],{type:'image/png'}));const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return {width:img.width,height:img.height,corner:[...ctx.getImageData(10,10,1,1).data],green:[...ctx.getImageData(65,55,1,1).data],red:[...ctx.getImageData(290,210,1,1).data],mask:[...ctx.getImageData(380,280,1,1).data]}});
 assert.equal(exported.width,450);assert.equal(exported.height,340);assert.deepEqual(exported.corner,[0,0,0,0]);assert.deepEqual(exported.green,[0,170,68,255]);assert.deepEqual(exported.red,[170,0,68,255]);assert.deepEqual(exported.mask,[0,0,0,255]);
 assert.equal(await page.evaluate(()=>window.dispatchEvent(new Event('vxshot-before-update',{cancelable:true}))),true);
 // Dirty on dimension-only change, even with no annotation change.
 await key('Control+z');assert.equal(await page.evaluate(()=>window.dispatchEvent(new Event('vxshot-before-update',{cancelable:true}))),false);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:new URL('../docs/qa/editor_feedback_20261029.png',import.meta.url).pathname});
 const evidence={actual_react_browser:true,native:false,clipboard:'fixture only',paste_preserves_old_image:true,independent_move_delete_undo_redo:true,inline_vietnamese_text:true,canvas_nw_expansion_and_undo:true,fast_privacy_drag_and_mosaic_opaque:true,exported,errors};
 writeFileSync(new URL('../docs/qa/editor_feedback_20261029.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
} finally {await browser.close()}
