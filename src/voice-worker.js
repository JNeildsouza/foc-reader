import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';
import { GenerationQueue } from './generation-queue.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
let model,backend;
const progress_callback=progress=>self.postMessage({type:'progress',progress});
async function loadModel(){
  if(model)return;
  let gpu=false;
  try{gpu=!!(await self.navigator.gpu?.requestAdapter());}catch{}
  if(gpu){
    self.postMessage({type:'backend',label:'GPU acceleration · first download about 330 MB'});
    try{model=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'fp32',device:'webgpu',progress_callback});backend='GPU';}catch{model=null;}
  }
  if(!model){
    self.postMessage({type:'backend',label:'CPU narration · first download about 90 MB'});
    model=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'wasm',progress_callback});backend='CPU';
  }
  // Never silently truncate a passage at the model's token limit.
  const tokenizer=model.tokenizer;
  model.tokenizer=(text,options)=>{const encoded=tokenizer(text,{...options,truncation:false});if(encoded.input_ids.dims.at(-1)>512)throw Error('LUMEN_SPLIT');return encoded;};
  self.postMessage({type:'backend',label:backend+' narration ready'});
}
const queue=new GenerationQueue(async data=>{
  try{
    await loadModel();
    const started=performance.now();
    const synth=async text=>{
      try{return(await model.generate(text,{voice:data.voice,speed:1})).audio;}
      catch(error){
        if(error.message!=='LUMEN_SPLIT')throw error;
        const words=[...text.matchAll(/\S+/g)];
        if(words.length<2)throw Error('This passage contains an unusually long token. Split it into pronounceable words or choose device voices.');
        const at=words[Math.floor(words.length/2)].index;
        const a=await synth(text.slice(0,at)),b=await synth(text.slice(at));
        const combined=new Float32Array(a.length+b.length);combined.set(a);combined.set(b,a.length);return combined;
      }
    };
    const samples=await synth(data.text);
    self.postMessage({type:'audio',id:data.id,samples,sampleRate:24000,backend,generationSeconds:(performance.now()-started)/1000},[samples.buffer]);
  }catch(error){self.postMessage({type:'error',id:data.id,message:error.message});}
},data=>self.postMessage({type:'cancelled',id:data.id}));
self.onmessage=({data})=>{if(data.type==='cancel')queue.clear();else queue.push(data);};
