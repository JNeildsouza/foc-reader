import { readdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const assets=(await readdir('dist/assets')).filter(name=>!name.endsWith('.wasm')&&!name.startsWith('voice-worker-')).map(name=>'./assets/'+name);
const previews=(await readdir('dist/voice-previews')).map(name=>'./voice-previews/'+name);
const shell=['./','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest',...assets,...previews];
const version=createHash('sha256').update(JSON.stringify(shell)).digest('hex').slice(0,12);
const source=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',source.replace("'lumen-shell-v1'",`'lumen-shell-${version}'`).replace("['./','./icon.svg','./manifest.webmanifest']",JSON.stringify(shell)));
console.log('Prepared offline shell:',shell.length,'files. Voice model downloads remain on demand.');
