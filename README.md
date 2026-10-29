# Lumen Reading Studio

A calm, installable reading studio for your own drafts and documents. Built for GitHub Pages, with no server or account required.

## Open the app

Use https://jneildsouza.github.io/foc-reader/. The root `index.html` is a self-contained launcher that opens this URL even when double-clicked. The actual Vite entry lives in `app/index.html`; development uses `pnpm dev`. Do not open source or compiled module files with `file://`.

## Use

1. Add a document (PDF, DOCX, TXT, Markdown) or paste your draft.
2. Review the extracted text and choose **Enter the studio**.
3. Michael, a natural Kokoro male voice, is selected by default. Compare Michael, George, and Fenrir with Listen to voice; additional narrators are in the dropdown. The first preview downloads the model. Device voice remains available without a model download.
4. Press play. Adjust the speed and your comfort limit, turn on passage spotlight, or pause between paragraphs to reflect.

Click a word to seek. Space plays/pauses; arrow keys move between sentences when focus is outside a control. Bookmarks, text downloads, font sizes, a dark theme, and local library persistence are included. Install from the browser menu; on iPhone use Safari → Share → Add to Home Screen.

## Voice and privacy

Kokoro-82M runs in a Web Worker using Transformers.js / ONNX Runtime (WASM, q8). The first playback downloads roughly 90 MB of model weights plus runtime files from Hugging Face/CDN. Documents are processed in the browser and are not sent to a speech API. Models are cached by Transformers.js; cache availability depends on browser storage. System voices may use an online provider depending on the device.

Available male narrators: George, Michael, Fenrir, Fable, Onyx, Puck and Lewis. These are Kokoro preset voices, not celebrity voice clones. Kokoro preserves its natural pitch and prosody. System voices expose a pitch control; both engines support speed changes.

**Timing is transparent:** Kokoro.js provides sentence audio without word alignment, so word highlighting is estimated inside each sentence. System voices use native word boundaries where available and estimated timings otherwise. Neither speech synthesis nor PDF extraction guarantees perfect pronunciation or layout reconstruction. Review complex layouts, equations, numbers, and tables. Image-only PDFs require OCR before import.

Documents and reading positions are stored in IndexedDB on the current browser. No cloud sync. Clearing site data removes the library; download a text copy to preserve it. The published repository contains only application code and the included fictional welcome guide. The service worker caches same-origin app files; a first online visit is required, and offline voice playback requires all model/runtime assets to have been cached.

## Develop

Requires Node 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

The Vite base path is relative, so project Pages URLs work. Only esbuild's build script is enabled. Server-side ONNX Runtime and sharp installation scripts are not needed for this browser build.

## Publish

The included `.github/workflows/pages.yml` builds and publishes every push to `main`. In repository Settings → Pages, choose **GitHub Actions** as the source. Deployment uses the `dist` output, not uploaded documents. No credentials or inference API keys are needed.

## Architecture

- `src/core.js`: exact text offsets, bounded sentence chunks, estimated timing, speed limits.
- `src/main.js`: playback lifecycle, source text rendering, accessibility and UI state.
- `src/voice-worker.js`: serialized browser-local Kokoro inference.
- `src/importers.js`: lazy-loaded PDF/Word text extraction.
- `src/storage.js`: browser-local document persistence.
- `tests/core.test.js`: token preservation, chunk coverage, timing and speed-limit checks.

Reference: [Speechify](https://speechify.com/) for the read-and-listen interaction pattern. Original Lumen interface and implementation. Voice model: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0; browser implementation: [kokoro-js](https://github.com/hexgrad/kokoro/tree/main/kokoro.js). Dependencies retain their respective licenses.
