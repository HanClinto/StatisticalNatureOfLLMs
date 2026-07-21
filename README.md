# Statistical Nature of LLMs

An in-browser next-token laboratory for seeing how language models weigh possible continuations. Inference runs locally with [wllama](https://github.com/ngxson/wllama); prompts and generated text are not sent to an inference service.

Try it at [hanclinto.github.io/StatisticalNatureOfLLMs](https://hanclinto.github.io/StatisticalNatureOfLLMs/).

## What You Can Explore

- Step through local generation one token at a time and inspect next-token probabilities.
- Choose alternatives, backtrack, and preserve multiple continuations in a story tree.
- Keep multiple starting prompts as separate roots without discarding earlier work.
- Adjust temperature and seeds to compare predictable, varied, and repeatable sampling.
- Use each lesson's **Show me** action to add a fixed-model example and open a dismissible callout over the relevant part of the lab. Most use TinyStories; the factual-likelihood lesson identifies and loads base SmolLM2.

## Models

| Model | Role | Download | Why it is included |
| --- | --- | ---: | --- |
| TinyStories 15M Q4 | Base | 19 MB | Near-instant mechanics demo |
| SmolLM2 135M Q4 | Base | 92 MB | General text completion and factual-likelihood demo |

GGUF files remain on Hugging Face. wllama downloads them on demand and stores them in the browser's Origin Private File System (OPFS), so repeat visits normally avoid another download. The app bundles wllama's single-thread WASM runtime because standard GitHub Pages does not provide the cross-origin isolation headers required by multithreaded WASM.

## Development

Node 22 is recommended.

```sh
npm install
npm run dev
npm run build
npm run lint
```

The Vite base path is `/StatisticalNatureOfLLMs/` for project Pages. The workflow in `.github/workflows/deploy-pages.yml` builds and deploys every push to `main`.

## Current Limitations

- The current lesson set uses raw completion with base models. Instruct models, chat templates, and tool calls are a future layer.
- Branches are reconstructed from displayed token text. Exact forced-token replay will require retaining token IDs across the wllama response boundary.
- Browser storage quotas and WebAssembly memory limits vary by device. The 19 MB model is the safest fallback.
