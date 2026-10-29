import test from 'node:test';import assert from 'node:assert/strict';
import{tokensOf,chunksOf,estimatedTimings,wordAt,clampRate}from'../src/core.js';
test('token offsets preserve exact original draft including Unicode and whitespace',()=>{const s='  A draft: “hello!”\n\nनमस्ते\tworld.  ';const ts=tokensOf(s);let last=0,out='';for(const t of ts){out+=s.slice(last,t.start)+t.text;last=t.end;}out+=s.slice(last);assert.equal(out,s);});
test('chunking never drops, duplicates, or reorders a token in long documents',()=>{const text=('An example  sentence with $12.50 and “words.”\n\n'+('word '.repeat(100))).repeat(30);const ts=tokensOf(text),cs=chunksOf(text,ts);assert.equal(cs[0].start,0);assert.equal(cs.at(-1).end,ts.length);for(let i=0;i<cs.length;i++){assert.ok(cs[i].end-cs[i].start<=45);if(i)assert.equal(cs[i].start,cs[i-1].end);assert.equal(cs[i].text,text.slice(ts[cs[i].start].start,ts[cs[i].end-1].end));}});
test('timings cover the audio and select correct boundary words',()=>{const ts=estimatedTimings(tokensOf('One longer word.'),5);assert.equal(ts[0].start,0);assert.ok(Math.abs(ts.at(-1).end-5)<.0001);assert.equal(wordAt(ts,0),0);assert.equal(wordAt(ts,ts[0].end),1);assert.equal(wordAt(ts,7),2);});
test('comfort limit always bounds speed including invalid input',()=>{assert.equal(clampRate(2,1.25),1.25);assert.equal(clampRate(.1,1.5),.5);assert.equal(clampRate('no',1.5),1);});
test('short sentences share a passage, without crossing paragraph pauses',()=>{
 const text='Hello there. Take your time. Read this slowly.\n\nThe next paragraph stays separate.';
 const chunks=chunksOf(text);assert.equal(chunks.length,2);assert.equal(chunks[0].text,'Hello there. Take your time. Read this slowly.');assert.equal(chunks[1].text,'The next paragraph stays separate.');
});
