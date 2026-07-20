# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Statistical Nature of LLMs

  An in-browser next-token laboratory for seeing how language models weigh possible continuations. Inference runs locally with [wllama](https://github.com/ngxson/wllama); prompts and generated text are not sent to an inference service.

  ## Models

  | Model | Role | Download | Why it is included |
  | --- | --- | ---: | --- |
  | TinyStories 15M Q4 | Base | 19 MB | Near-instant mechanics demo |
  | SmolLM2 135M Instruct Q4 | Chat | 92 MB | Practical default with an embedded chat template |
  | Qwen2.5 0.5B Instruct Q4 | Chat + tools | 429 MB | Embedded template includes tool-call serialization |

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

  - The first lesson uses raw completion for all three models. Chat-template and tool-call lessons are the next layer.
  - Branches are reconstructed from displayed token text. Exact forced-token replay will require retaining token IDs across the wllama response boundary.
  - Browser storage quotas and WebAssembly memory limits vary by device. The 19 MB model is the safest fallback.
import reactDom from 'eslint-plugin-react-dom'
