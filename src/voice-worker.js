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
    // Disable silent truncation: split long passages before they reach inference.
    if(!model.lumenGuard){
      const tokenizer=model.tokenizer;
      model.tokenizer=(text,options)=>{const encoded=tokenizer(text,{...options,truncation:false});if(encoded.input_ids.dims.at(-1)>512)throw Error('LUMEN_SPLIT');return encoded;};
      model.lumenGuard=true;
    }
    const synth=async(text)=>{
      try{return (await model.generate(text,{voice:data.voice,speed:1})).audio;}
      catch(error){
        if(error.message!=='LUMEN_SPLIT')throw error;
        const words=[...text.matchAll(/\S+/g)];
        if(words.length<2)throw Error('This passage contains an unusually long token. Split it into pronounceable words or choose system voices.');
        const at=words[Math.floor(words.length/2)].index;
        const a=await synth(text.slice(0,at)),b=await synth(text.slice(at));
        const combined=new Float32Array(a.length+b.length);combined.set(a);combined.set(b,a.length);return combined;
      }
    };
    const samples=await synth(data.text);
    self.postMessage({type:'audio',id:data.id,samples,sampleRate:24000},[samples.buffer]);
  }catch(error){self.postMessage({type:'error',id:data.id,message:error.message});}
});};
