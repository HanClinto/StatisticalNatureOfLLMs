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
    id: 'smollm2-135m',
    name: 'SmolLM2 135M Base',
    kind: 'base',
    size: '92 MB',
    context: 2048,
    url: 'https://huggingface.co/QuantFactory/SmolLM2-135M-GGUF/resolve/main/SmolLM2-135M.Q4_0.gguf',
    description: 'A general text-completion model, before instruction tuning.',
  },
];
