# Self-hosted Tesseract.js assets

Tesseract.js defaults to loading its worker, WASM core, and trained-data
files from third-party CDNs (jsDelivr, tessdata.projectnaptha.com) at
runtime. These are copied here instead so the label scanner (Roadmap #8)
has no external dependency at runtime — everything is served from this
app's own origin.

| File | Source |
|---|---|
| `worker.min.js` | `node_modules/tesseract.js/dist/worker.min.js` |
| `tesseract-core-simd-lstm.wasm(.js)` | `node_modules/tesseract.js-core/` |
| `eng.traineddata.gz` | the `@tesseract.js-data/eng` npm package (`4.0.0_best_int` variant — the smaller quantized model) |

To update after a `tesseract.js`/`tesseract.js-core` bump, re-copy the
first two rows from `node_modules` after `npm install`. To update the
English model, `npm install @tesseract.js-data/eng`, copy the new
`eng.traineddata.gz`, then `npm uninstall @tesseract.js-data/eng` (it's
only needed to fetch the file, not as a runtime dependency).
