import { useState } from 'react';
import { ArrowRight, BrainCircuit, Database, GitBranch, LoaderCircle, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { clearModelCache, loadModel, predictNextToken } from './inference';
import type { TokenCandidate } from './inference';
import { MODELS } from './models';
import './App.css';

interface Branch { id: number; text: string; note: string }
const DEFAULT_PROMPT = 'Once upon a time, a small robot discovered';
const visibleToken = (token: string) => token.replaceAll(' ', '·').replaceAll('\n', '↵');

function App() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [generated, setGenerated] = useState('');
  const [candidates, setCandidates] = useState<TokenCandidate[]>([]);
  const [temperature, setTemperature] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'thinking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const isLoaded = loadedModelId === modelId;

  const reset = () => { setGenerated(''); setCandidates([]); setBranches([]); setError(null); };
  async function handleLoad() {
    setStatus('loading'); setError(null); setProgress(0);
    try { await loadModel(model, setProgress); setLoadedModelId(modelId); }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }
  async function handleStep() {
    if (!isLoaded) return handleLoad();
    setStatus('thinking'); setError(null);
    try {
      const next = await predictNextToken(prompt + generated, temperature);
      const sampled = next.find((item) => item.sampled) ?? next[0];
      setGenerated((current) => current + sampled.token);
      setCandidates(next);
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }
  function chooseCandidate(candidate: TokenCandidate) {
    const sampled = candidates.find((item) => item.sampled);
    if (!sampled || candidate.token === sampled.token) return;
    setBranches((current) => [...current, { id: Date.now(), text: prompt + generated, note: `sampled ${visibleToken(sampled.token)}` }]);
    setGenerated((current) => current.slice(0, -sampled.token.length) + candidate.token);
    setCandidates((current) => current.map((item) => ({ ...item, sampled: item.token === candidate.token })));
  }
  async function clearCache() {
    setStatus('loading');
    try { await clearModelCache(); setLoadedModelId(null); reset(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }

  return <main>
    <header className="topbar">
      <a className="wordmark" href={import.meta.env.BASE_URL}><BrainCircuit size={22} /><span>Next Token Lab</span></a>
      <div className="privacy-note"><Database size={15} /> Runs and stays in your browser</div>
    </header>
    <section className="intro">
      <p className="eyebrow">The statistical nature of language models</p>
      <h1>Watch a model choose what comes next.</h1>
      <p className="lede">A language model does not pull one answer from a vault. At every step it weighs many possible tokens, then a sampling rule picks one.</p>
    </section>
    <section className="workspace" aria-label="Next token explorer">
      <aside className="controls">
        <div className="section-heading"><span>01</span><h2>Choose a model</h2></div>
        <div className="model-list">{MODELS.map((item) => <button className={`model-option ${modelId === item.id ? 'selected' : ''}`} key={item.id} onClick={() => { setModelId(item.id); reset(); }} type="button">
          <span className="model-name">{item.name}</span><span className="model-meta">{item.kind} · {item.size}</span><span className="model-description">{item.description}</span>
        </button>)}</div>
        <button className="load-button" disabled={status !== 'idle'} onClick={handleLoad} type="button">
          {status === 'loading' ? <LoaderCircle className="spin" size={18} /> : <Database size={18} />}
          {isLoaded ? 'Model ready' : status === 'loading' ? `Downloading ${Math.round(progress * 100)}%` : `Load ${model.size}`}
        </button>
        <p className="cache-copy">The first load comes from Hugging Face. Later visits reuse the browser cache.</p>
        <button className="text-button" onClick={clearCache} type="button"><Trash2 size={15} /> Clear model cache</button>
        <div className="section-heading temperature-heading"><span>02</span><h2>Set randomness</h2></div>
        <label className="temperature-label" htmlFor="temperature">Temperature <strong>{temperature.toFixed(1)}</strong></label>
        <input id="temperature" max="1.5" min="0" onChange={(event) => setTemperature(Number(event.target.value))} step="0.1" type="range" value={temperature} />
        <div className="range-labels"><span>steady</span><span>surprising</span></div>
      </aside>
      <div className="analysis-board">
        <div className="board-toolbar"><div><span className={`status-dot ${isLoaded ? 'ready' : ''}`} />{isLoaded ? model.name : 'No model loaded'}</div><button aria-label="Reset generation" onClick={reset} title="Reset generation" type="button"><RotateCcw size={17} /></button></div>
        <label className="prompt-label" htmlFor="prompt">Start the text</label>
        <textarea id="prompt" onChange={(event) => { setPrompt(event.target.value); reset(); }} rows={3} value={prompt} />
        <div className="generated-text" aria-live="polite"><span>{prompt}</span><strong>{generated}</strong>{!generated && <em>The model’s tokens will appear here.</em>}</div>
        <div className="step-row"><button className="step-button" disabled={status !== 'idle'} onClick={handleStep} type="button">{status === 'thinking' ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}{isLoaded ? 'Step one token' : 'Load model'}</button><span>One token may be a word, part of a word, punctuation, or a space.</span></div>
        {error && <div className="error-message" role="alert">{error}</div>}
        <section className="probability-panel">
          <div className="panel-title"><div><Sparkles size={18} /><h2>What the model considered</h2></div><span>click an alternative to branch</span></div>
          {candidates.length === 0 ? <div className="empty-probabilities"><div className="ghost-bars"><i /><i /><i /><i /></div><p>Step forward to reveal the next-token landscape.</p></div> : <div className="candidate-list">{candidates.map((candidate) => <button className={candidate.sampled ? 'sampled' : ''} key={`${candidate.token}-${candidate.logprob}`} onClick={() => chooseCandidate(candidate)} type="button">
            <code>{visibleToken(candidate.token) || '∅'}</code><span className="probability-track"><i style={{ width: `${Math.max(1, candidate.probability * 100)}%` }} /></span><strong>{(candidate.probability * 100).toFixed(1)}%</strong><small>log p {candidate.logprob.toFixed(2)}</small>{candidate.sampled && <b>chosen</b>}
          </button>)}</div>}
        </section>
      </div>
      <aside className="branches">
        <div className="section-heading"><span>03</span><h2>Explored paths</h2></div>
        <div className="current-branch"><GitBranch size={18} /><div><strong>Current path</strong><p>{generated || 'No tokens yet'}</p></div></div>
        {branches.length === 0 ? <p className="branch-empty">Choose a different token and the path you left will stay here.</p> : branches.map((branch) => <button key={branch.id} onClick={() => { setPrompt(branch.text); setGenerated(''); setCandidates([]); }} type="button"><span>{branch.note}</span><p>{branch.text.slice(-80)}</p></button>)}
      </aside>
    </section>
    <section className="plain-language"><p className="eyebrow">Keep this distinction in view</p><div><h2>The model offers odds.</h2><h2>The decoder makes the pick.</h2></div><p>A high number means “this token fits patterns I learned.” It does not mean the token is true, wise, or even useful.</p></section>
  </main>;
}

export default App;
