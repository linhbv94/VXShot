import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=readFileSync(new URL('../src/services/editor_geometry.ts',import.meta.url),'utf8');
const {translateNode,nodeBounds,hitTest,expansion}=await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
const base={id:'a',x:10,y:20,stroke_width:4,stroke_color:'#ff0000',z_index:0,opacity:1};
test('all object types can be selected at intended geometry and moved without mutating source',()=>{
 const fixtures=[
  [{...base,type:'IMAGE',width:40,height:30,data_url:'fixture'},25,30],
  [{...base,type:'RECTANGLE',width:40,height:30},25,30],
  [{...base,type:'HIGHLIGHT',width:40,height:30},25,30],
  [{...base,type:'SOLID_REDACT',width:40,height:30},25,30],
  [{...base,type:'BLUR_FILTER',width:40,height:30},25,30],
  [{...base,type:'ELLIPSE',radius_x:20,radius_y:10},12,22],
  [{...base,type:'STEP_COUNTER',radius:15},12,22],
  [{...base,type:'TEXT',text:'Xin chào\nVXShot',font_size:20},30,40],
  ...['LINE','ARROW','PEN'].map(type=>[{...base,type,points:[10,20,100,90]},55,55])
 ];
 for(const [node,x,y] of fixtures){assert(hitTest(node,x,y,6),node.type);assert.equal(hitTest(node,1000,1000,6),false,node.type);const moved=translateNode(node,23,17);assert(hitTest(moved,x+23,y+17,6),node.type);assert.equal(node.x,10);assert.equal(moved.x,33)}
 assert.equal(hitTest({...base,type:'LINE',points:[0,0,100,100]},10,90,6),false,'line bounding box must not swallow empty space');
});
test('text bounds follow actual measurement and multiline height',()=>{
 assert.deepEqual(nodeBounds({...base,type:'TEXT',text:'abc\ndefghi',font_size:20},t=>t.length*10),{x:10,y:20,width:60,height:48});
});
test('all four expansion corners preserve opposite edge and reject shrink, limits and excess pixels',()=>{
 assert.deepEqual(expansion(400,300,-50,-40,true,true),{left:50,top:40,right:0,bottom:0});
 assert.deepEqual(expansion(400,300,50,-40,false,true),{left:0,top:40,right:50,bottom:0});
 assert.deepEqual(expansion(400,300,-50,40,true,false),{left:50,top:0,right:0,bottom:40});
 assert.deepEqual(expansion(400,300,50,40,false,false),{left:0,top:0,right:50,bottom:40});
 assert.deepEqual(expansion(400,300,-50,-40,false,false),{left:0,top:0,right:0,bottom:0});
 assert.equal(expansion(8100,100,500,0,false,false).right,92);
 assert.deepEqual(expansion(5000,5000,1000,1000,false,false),{left:0,top:0,right:0,bottom:0});
});
