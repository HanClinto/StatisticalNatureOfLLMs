import { Wllama } from '@wllama/wllama/esm/index.js';
import wasmUrl from '@wllama/wllama/esm/wasm/wllama.wasm?url';
import type { BrowserModel } from './models';

export interface TokenCandidate {
  token: string;
  logprob: number;
  probability: number;
  sampled: boolean;
}

interface ContentLogprob {
  token: string;
  logprob: number;
  top_logprobs: Array<{ token: string; logprob: number }>;
}

let engine: Wllama | null = null;
let loadedModelId: string | null = null;

function createEngine() {
  const nextEngine = new Wllama({ default: wasmUrl }, { suppressNativeLog: true });
  nextEngine.setCompat(null);
  return nextEngine;
}

export async function loadModel(model: BrowserModel, onProgress: (fraction: number) => void) {
  if (loadedModelId === model.id && engine?.isModelLoaded()) return;
  if (engine) await engine.exit();
  engine = createEngine();
  const loadOptions = {
    n_ctx: model.context,
    n_batch: Math.min(256, model.context),
    useCache: true,
    progressCallback: ({ loaded, total }: { loaded: number; total: number }) => onProgress(total > 0 ? loaded / total : 0),
  };
  try {
    await engine.loadModelFromUrl(model.url, loadOptions);
  } catch (error) {
    const isMissingCachedFile = error instanceof Error && error.message === `Model file not found: ${model.url}`;
    if (!isMissingCachedFile) throw error;
    await engine.cacheManager.delete(model.url);
    await engine.exit();
    engine = createEngine();
    onProgress(0);
    await engine.loadModelFromUrl(model.url, loadOptions);
  }
  loadedModelId = model.id;
  onProgress(1);
}

export async function predictNextToken(prompt: string, temperature: number, seed: number, topCount = 8): Promise<TokenCandidate[]> {
  if (!engine?.isModelLoaded()) throw new Error('Load a model first.');
  const completionOptions = {
    prompt,
    max_tokens: 1,
    temperature,
    top_k: 40,
    top_p: 0.95,
    seed,
    logprobs: topCount,
    n_probs: topCount,
    cache_prompt: true,
  };
  const response = await engine.createCompletion(completionOptions);
  const details = response.choices[0]?.logprobs;
  const content = (details as unknown as { content?: ContentLogprob[] } | null)?.content;
  if (Array.isArray(content) && content.length > 0) {
    const sampledToken = content[0].token;
    return content[0].top_logprobs
      .map(({ token, logprob }) => ({
        token,
        logprob,
        probability: Math.exp(logprob),
        sampled: token === sampledToken,
      }))
      .sort((left, right) => right.probability - left.probability);
  }
  if (!details || !Array.isArray(details.tokens) || !Array.isArray(details.top_logprobs)) {
    throw new Error('This wllama build returned no usable token probabilities.');
  }
  if (!details.tokens.length || !details.top_logprobs.length) {
    throw new Error('This wllama build returned no token probabilities. Its llama.cpp response pathway needs to be enabled or patched.');
  }
  const sampledToken = details.tokens[0];
  const candidates = Object.entries(details.top_logprobs[0] ?? {}).map(([token, logprob]) => ({
    token,
    logprob,
    probability: Math.exp(logprob),
    sampled: token === sampledToken,
  }));
  if (!candidates.some((candidate) => candidate.sampled)) {
    const logprob = details.token_logprobs[0] ?? Number.NEGATIVE_INFINITY;
    candidates.push({ token: sampledToken, logprob, probability: Math.exp(logprob), sampled: true });
  }
  return candidates.sort((left, right) => right.probability - left.probability);
}

export async function clearModelCache() {
  if (!engine) {
    engine = createEngine();
  }
  await engine.cacheManager.clear();
}
