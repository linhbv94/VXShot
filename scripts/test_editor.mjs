import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=readFileSync(new URL('../src/services/editor_session.ts',import.meta.url),'utf8');
const {shouldAutoHydrate,hasUnsavedAnnotations}=await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
test('focus after annotation/save/copy never hydrates an occupied canvas',()=>{
 assert.equal(shouldAutoHydrate(true,true,false),false);
 assert.equal(shouldAutoHydrate(true,false,true),false);
 assert.equal(shouldAutoHydrate(false,false,false),false);
 assert.equal(shouldAutoHydrate(true,false,false),true);
});
test('save/copy snapshot protects new edits and undo states',()=>{
 const old=[{id:1}],next=[{id:1},{id:2}];
 assert.equal(hasUnsavedAnnotations(old,JSON.stringify(old)),false);
 assert.equal(hasUnsavedAnnotations(next,JSON.stringify(old)),true);
 assert.equal(hasUnsavedAnnotations([],JSON.stringify(old)),true);
});
