import test from 'node:test';
import assert from 'node:assert/strict';
import {GenerationQueue} from '../src/generation-queue.js';
test('rapid voice/position switches discard obsolete queued work and run the latest next',async()=>{
 let release;const ran=[],cancelled=[];
 const queue=new GenerationQueue(async job=>{ran.push(job);if(job==='active')await new Promise(r=>release=r);},job=>cancelled.push(job));
 queue.push('active');queue.push('old voice');queue.push('old passage');queue.clear();queue.push('new voice');
 release();await new Promise(r=>setImmediate(r));
 assert.deepEqual(ran,['active','new voice']);assert.deepEqual(cancelled,['old voice','old passage']);assert.equal(queue.active,false);
});
