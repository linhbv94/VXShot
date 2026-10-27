// Optional integration fixture. See docs/release_guide.md for isolated dependencies.
const fs=require('fs'),assert=require('assert/strict');
const {join,resolve}=require('path'),{tmpdir}=require('os'),{createRequire}=require('module');
const app=resolve(__dirname,'..'),scratch=fs.mkdtempSync(join(tmpdir(),'vxshot_editor_qa_'));
if(!process.env.VXSHOT_QA_NODE_MODULES)throw Error('Set VXSHOT_QA_NODE_MODULES to an isolated node_modules containing jsdom, esbuild and @napi-rs/canvas');
const qaRequire=createRequire(join(resolve(process.env.VXSHOT_QA_NODE_MODULES),'_qa.cjs'));
const {JSDOM}=qaRequire("jsdom");
const {createCanvas,Image}=qaRequire("@napi-rs/canvas");
const esbuild=qaRequire("esbuild");
(async()=>{
 fs.writeFileSync(join(scratch,'bridge.js'),"const qa=()=>globalThis.__shotqa;\nexport const getAppSettings=async()=>null;\nexport const readClipboardImage=async()=>{qa().reads++;return qa().payload};\nexport const openFileDialog=async()=>qa().payload;\nexport const openSaveDialog=async()=>{qa().focus();return '/fixture/output.png'};\nexport const saveImageFile=async o=>{qa().saved=o;return {success:true,file_path:o.file_path,bytes_written:o.image_bytes.length}};\nexport const writeClipboardImage=async()=>{};\nexport const saveAppSettings=async()=>{};\nexport const listenToShortcut=async cb=>{qa().shortcut=cb;return()=>{}};\nexport const listenToWindowFocus=async cb=>{qa().focus=cb;return()=>{}};\nexport const minimizeWindow=async()=>{};\nexport const toggleMaximizeWindow=async()=>{};\nexport const closeWindow=async()=>{};\n");
 fs.writeFileSync(join(scratch,'updater.js'),"export const appVersion='1.0.0';\nexport const useAppUpdater=()=>({status:'disabled',noticeVisible:false});\nexport const checkForUpdates=()=>{};export const installUpdate=()=>{};export const restartAfterUpdate=()=>{};export const dismissUpdateNotice=()=>{};\n");
 fs.writeFileSync(join(scratch,'exports.jsx'),`export {App} from '${app}/src/App.tsx'; export {default as React} from '${app}/node_modules/react/index.js'; export {createRoot} from '${app}/node_modules/react-dom/client.js';`);
 const fixture=createCanvas(640,400);fixture.getContext('2d').fillStyle='#1f8855';fixture.getContext('2d').fillRect(0,0,640,400);fs.writeFileSync(join(scratch,'fixture.png'),await fixture.encode('png'));

 const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost/'});
 for(const k of ['window','document','HTMLElement','HTMLCanvasElement','FileReader','navigator','Event','ImageData'])if(dom.window[k])Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
 globalThis.Image=Image;window.confirm=()=>false;
 const canvases=new WeakMap();const get=c=>{let n=canvases.get(c);if(!n||n.width!==c.width||n.height!==c.height){n=createCanvas(c.width,c.height);canvases.set(c,n)}return n};
 window.HTMLCanvasElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:this.width,height:this.height,right:this.width,bottom:this.height}};
 window.HTMLCanvasElement.prototype.getContext=function(){return get(this).getContext('2d')};
 window.HTMLCanvasElement.prototype.toBlob=function(cb){get(this).encode('png').then(b=>cb(new window.Blob([b],{type:'image/png'})))};
 globalThis.__shotqa={reads:0,payload:{data_url:'data:image/png;base64,'+fs.readFileSync(join(scratch,"fixture.png")).toString('base64'),width:640,height:400,has_alpha:true}};
 await esbuild.build({entryPoints:[join(scratch,"exports.jsx")],bundle:true,platform:'node',format:'cjs',outfile:join(scratch,"bundle.cjs"),loader:{'.png':'dataurl'},plugins:[{name:'qa-boundaries',setup(b){b.onResolve({filter:/services\/tauri_bridge$/},()=>({path:join(scratch,"bridge.js")}));b.onResolve({filter:/app_updater$/},()=>({path:join(scratch,"updater.js")}))}}]});
 const {App,React,createRoot}=require(join(scratch,'bundle.cjs'));const root=createRoot(document.getElementById('root'));root.render(React.createElement(App));
 const tick=()=>new Promise(r=>setTimeout(r,30));await tick();await tick();
 assert.equal(__shotqa.reads,1);assert(document.body.textContent.includes('640 × 400'));
 window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'s',bubbles:true}));await tick();
 const canvas=document.querySelector('canvas');assert(canvas);canvas.dispatchEvent(new window.MouseEvent('mousedown',{clientX:100,clientY:100,button:0,bubbles:true}));await tick();
 assert(document.body.textContent.includes('Đã thêm chú thích (1 đối tượng)'));
 assert.equal(window.dispatchEvent(new window.Event('vxshot-before-update',{cancelable:true})),false);
 __shotqa.focus();await tick();__shotqa.shortcut();await tick();assert.equal(__shotqa.reads,1);assert(document.body.textContent.includes('Đã thêm chú thích (1 đối tượng)'));
 // Native dialog bridge emits focus while awaiting path: actual App must keep its history.
 const save=[...document.querySelectorAll('button')].find(b=>b.title.startsWith('Lưu tệp ảnh'));assert(save);save.click();await tick();await tick();await tick();
 assert(__shotqa.saved?.image_bytes.length>100);assert(document.body.textContent.includes('Đã lưu: output.png'));assert.equal(__shotqa.reads,1);
 const undo=[...document.querySelectorAll('button')].find(b=>b.title==='Hoàn tác (Cmd+Z)');assert(undo&&!undo.disabled);
 const evidence={actual_react_app:true,bridge:'fixture mocks, not native IPC',startup_reads:__shotqa.reads,annotation_survives_focus_and_shortcut:true,annotation_history_survives_save_dialog_focus:true,unsaved_blocks_updater:true,export_png_bytes:__shotqa.saved.image_bytes.length,native_runtime:false};
 fs.writeFileSync(join(app,'docs/release_1_0_0_dom_evidence.json'),JSON.stringify(evidence,null,2)+'\n');root.unmount();fs.rmSync(scratch,{recursive:true,force:true});console.log('Actual React integration PASS',JSON.stringify(evidence));
})();
