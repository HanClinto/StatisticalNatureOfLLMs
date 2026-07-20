export interface BrowserModel {
  id: string;
  name: string;
  kind: 'base' | 'chat' | 'chat + tools';
  size: string;
  url: string;
  description: string;
  context: number;
}

export const MODELS: BrowserModel[] = [
  {
    id: 'stories-15m',
    name: 'TinyStories 15M',
    kind: 'base',
    size: '19 MB',
    context: 128,
    url: 'https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories15M-q4_0.gguf',
    description: 'Fastest. A tiny story model for learning the mechanics.',
  },
  {
    id: 'smollm2-135m-instruct',
    name: 'SmolLM2 135M Instruct',
    kind: 'chat',
    size: '92 MB',
    context: 2048,
    url: 'https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_0.gguf',
    description: 'Small enough for a quick download, with an embedded chat template.',
  },
  {
    id: 'qwen2.5-0.5b-instruct',
    name: 'Qwen2.5 0.5B Instruct',
    kind: 'chat + tools',
    size: '429 MB',
    context: 4096,
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_0.gguf',
    description: 'Slower, but its embedded template includes chat and tool calls.',
  },
];
