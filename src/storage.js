const dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('lumen-studio',1);request.onupgradeneeded=()=>request.result.createObjectStore('documents',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
async function run(mode,action){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('documents',mode);const request=action(tx.objectStore('documents'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export const allDocs=()=>run('readonly',s=>s.getAll());
export const putDoc=doc=>run('readwrite',s=>s.put(doc));
export const deleteDoc=id=>run('readwrite',s=>s.delete(id));
