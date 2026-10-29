import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('the double-click entry is a self-contained launcher with a no-JavaScript link',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/<a href="https:\/\/jneildsouza\.github\.io\/foc-reader\/">/);
 assert.doesNotMatch(html,/<script[^>]+(?:src=|type="module")/);
 assert.doesNotMatch(html,/id="(?:play|newDoc|fileInput)"/);
});
test('the application entry has an upload-first initial state and startup failure feedback',async()=>{
 const html=await readFile(new URL('../app/index.html',import.meta.url),'utf8');
 assert.match(html,/<body class="start-screen">/);
 assert.match(html,/id="bootFailure"/);
 assert.match(html,/id="fileInput"/);
});
