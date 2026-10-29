export async function extractFile(file,onProgress=()=>{}) {
 if(file.size>20*1024*1024)throw Error('Please choose a document smaller than 20 MB.');
 const ext=file.name.split('.').pop().toLowerCase();
 if(['txt','md','markdown'].includes(ext))return await file.text();
 if(ext==='docx'){
   const mammoth=await import('mammoth/mammoth.browser.js');
   const result=await (mammoth.default||mammoth).extractRawText({arrayBuffer:await file.arrayBuffer()});
   return result.value;
 }
 if(ext==='pdf'){
   const pdfjs=await import('pdfjs-dist');
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).href;
   const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
   try {
     const pages=[];
     for(let n=1;n<=doc.numPages;n++){
       onProgress(`Extracting page ${n} of ${doc.numPages}…`);
       const page=await doc.getPage(n);const content=await page.getTextContent();let lastY=null,text='';
       for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==null&&Math.abs(y-lastY)>3&&!text.endsWith('\n'))text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}
       pages.push(text.trim());page.cleanup();
     }
     const result=pages.join('\n\n');
     if(!result.trim())throw Error('This PDF has no selectable text. Run OCR on it first, then import it again.');
     return result;
   }finally{await doc.destroy();}
 }
 throw Error('Please use PDF, DOCX, TXT, or Markdown.');
}
