export const tokensOf = text => [...text.matchAll(/\S+/gu)].map(m => ({ text:m[0], start:m.index, end:m.index+m[0].length }));
export function chunksOf(text, tokens = tokensOf(text)) {
  const chunks=[]; let start=0;
  for(let i=0;i<tokens.length;i++) {
    const gap=text.slice(tokens[i].end, tokens[i+1]?.start ?? text.length);
    if ((i-start>=19 && /[.!?][”'"’)\]]*$/u.test(tokens[i].text)) || /\n\s*\n/.test(gap) || i-start>=44 || i===tokens.length-1) {
      chunks.push({start, end:i+1, text:text.slice(tokens[start].start,tokens[i].end)}); start=i+1;
    }
  }
  return chunks;
}
export function estimatedTimings(tokens, duration) {
  const weights=tokens.map(t => Math.max(2,t.text.replace(/[^\p{L}\p{N}]/gu,'').length)**0.65 + (/[,:;.!?]$/.test(t.text)?1.5:0));
  const total=weights.reduce((a,b)=>a+b,0); let time=0;
  return weights.map(w=>{const start=time; time+=w/total*duration; return {start,end:time};});
}
export function wordAt(timings,time) { const i=timings.findIndex(t=>time<t.end); return i<0?Math.max(0,timings.length-1):i; }
export function clampRate(value,ceiling=2.5) { return Math.max(.5,Math.min(Number(value)||1,Number(ceiling)||2.5,2.5)); }
export const demoText = `Attention is a place you can return to.\n\nThere is a quiet kind of progress that begins when you give one idea your full attention. You do not need to move quickly. You only need a pace that lets the meaning arrive.\n\nReading and listening can become a single rhythm. Your eyes follow the words, your ears follow the voice, and the next sentence waits until you are ready. When something matters, pause. Read it again. Let it connect with what you already know.\n\nTry this small experiment: listen to one paragraph, then look away from the screen. What was its main idea? Explain it in your own words. If the answer feels unclear, return to the passage and slow the pace a little.\n\nUnderstanding is more than reaching the end of a page. It is noticing the shape of an argument, making a connection, or finding a question you want to explore. A thoughtful pause is part of the process.\n\nThis is your space to read with intention. Bring a draft, a chapter, or a document you have been meaning to finish. Choose a voice you enjoy. Find your rhythm. Begin with one sentence.`;
