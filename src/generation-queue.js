// Keep one inference active. A new reading position discards obsolete waiting work.
export class GenerationQueue {
  constructor(run, cancel) { this.run=run; this.cancel=cancel; this.pending=[]; this.active=false; }
  push(job) { this.pending.push(job); this.drain(); }
  clear() { for(const job of this.pending.splice(0)) this.cancel(job); }
  async drain() {
    if(this.active)return;
    this.active=true;
    try { while(this.pending.length) await this.run(this.pending.shift()); }
    finally { this.active=false; }
  }
}
