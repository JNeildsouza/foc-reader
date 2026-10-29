import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
let model;
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.catch(()=>{}).then(async()=>{
  try {
    if(!model) model=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{
      dtype:'q8',device:'wasm',progress_callback:p=>self.postMessage({type:'progress',progress:p})
    });
    const result=await model.generate(data.text,{voice:data.voice,speed:1});
    const samples=result.audio;
    self.postMessage({type:'audio',id:data.id,samples,sampleRate:result.sampling_rate},[samples.buffer]);
  }catch(error){self.postMessage({type:'error',id:data.id,message:error.message});}
});};
