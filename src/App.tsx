import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BrainCircuit, Check, Database, Eye, GitBranch, LoaderCircle, Pencil, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import { clearModelCache, loadModel, predictNextToken } from './inference';
import type { TokenCandidate } from './inference';
import { LESSONS } from './lessons';
import { MODELS } from './models';
import './App.css';

interface StoryNode {
  id: string;
  parentId: string | null;
  token: string;
  prompt?: string;
  options: TokenCandidate[];
  optionsModelId?: string;
  children: string[];
}

type StoryTree = Record<string, StoryNode>;

const ROOT_ID = 'root';
const DEFAULT_PROMPT = 'Once upon a time, a small robot discovered';
const MAX_TEMPERATURE = 3;
const MAX_SEED = 2_147_483_647;
const visibleToken = (token: string) => token.replaceAll(' ', '·').replaceAll('\n', '↵');
const newRoot = (id: string, prompt: string): StoryNode => ({ id, parentId: null, token: '', prompt, options: [], children: [] });
const newTree = (): StoryTree => ({ [ROOT_ID]: newRoot(ROOT_ID, DEFAULT_PROMPT) });
const randomSeed = () => Math.floor(Math.random() * MAX_SEED);

function pathTo(tree: StoryTree, nodeId: string) {
  const path: StoryNode[] = [];
  let node = tree[nodeId];
  while (node?.parentId) {
    path.unshift(node);
    node = tree[node.parentId];
  }
  return path;
}

function deepestDescendant(tree: StoryTree, nodeId: string): string {
  const children = tree[nodeId]?.children ?? [];
  return children.length ? deepestDescendant(tree, children.at(-1)!) : nodeId;
}

function rootFor(tree: StoryTree, nodeId: string): StoryNode {
  let node = tree[nodeId];
  while (node?.parentId) node = tree[node.parentId];
  return node;
}

function contextLabel(tree: StoryTree, nodeId: string, prompt: string) {
  const text = prompt + pathTo(tree, nodeId).map((node) => node.token).join('');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return `${words.length > 3 ? '… ' : ''}${words.slice(-3).join(' ')}`;
}

interface GuideCalloutState {
  target: import('./lessons').LessonTarget;
  title: string;
  body: string;
}

function GuideCallout({ guide, target, onDismiss }: { guide: GuideCalloutState | null; target: GuideCalloutState['target']; onDismiss: () => void }) {
  if (guide?.target !== target) return null;
  return <div className="guide-callout" role="status"><span className="guide-arrow" /><div><strong>{guide.title}</strong><p>{guide.body}</p></div><button aria-label="Dismiss lesson callout" onClick={onDismiss} title="Dismiss" type="button"><X size={15} /></button></div>;
}

function applyTemperature(candidates: TokenCandidate[], temperature: number) {
  if (candidates.length === 0) return candidates;
  const visibleMass = candidates.reduce((sum, candidate) => sum + Math.exp(candidate.logprob), 0);
  const bestLogprob = Math.max(...candidates.map((candidate) => candidate.logprob));
  const weights = candidates.map((candidate) => temperature === 0 ? Number(candidate.logprob === bestLogprob) : Math.exp((candidate.logprob - bestLogprob) / temperature));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  return candidates.map((candidate, index) => {
    const probability = visibleMass * weights[index] / totalWeight;
    return { ...candidate, probability, logprob: probability > 0 ? Math.log(probability) : Number.NEGATIVE_INFINITY };
  });
}

function App() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const [promptDraft, setPromptDraft] = useState(DEFAULT_PROMPT);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [tree, setTree] = useState<StoryTree>(newTree);
  const [rootIds, setRootIds] = useState([ROOT_ID]);
  const [activeRootId, setActiveRootId] = useState(ROOT_ID);
  const [activeLeafId, setActiveLeafId] = useState(ROOT_ID);
  const [selectedNodeId, setSelectedNodeId] = useState(ROOT_ID);
  const [temperature, setTemperature] = useState(0.8);
  const [fixedSeed, setFixedSeed] = useState(false);
  const [seed, setSeed] = useState(42);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'thinking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonPaused, setLessonPaused] = useState(false);
  const [lessonFading, setLessonFading] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [guideCallout, setGuideCallout] = useState<GuideCalloutState | null>(null);
  const nextNodeId = useRef(1);
  const treeRef = useRef(tree);
  const rootIdsRef = useRef(rootIds);
  const selectedNodeRef = useRef(selectedNodeId);
  const resampleInFlight = useRef(false);
  const pendingTemperature = useRef<number | null>(null);
  treeRef.current = tree;
  rootIdsRef.current = rootIds;
  selectedNodeRef.current = selectedNodeId;
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const isLoaded = loadedModelId === modelId;
  const activePath = pathTo(tree, activeLeafId);
  const activeRoot = tree[activeRootId] ?? tree[ROOT_ID];
  const prompt = activeRoot.prompt ?? DEFAULT_PROMPT;
  const activePathIds = new Set(activePath.map((node) => node.id));
  const selectedIndex = activePath.findIndex((node) => node.id === selectedNodeId);
  const optionSourceId = tree[selectedNodeId]?.parentId ?? selectedNodeId;
  const candidates = applyTemperature(tree[optionSourceId]?.options ?? [], temperature);
  const selectedToken = selectedNodeId === ROOT_ID ? null : tree[selectedNodeId]?.token;
  const currentLesson = LESSONS[lessonIndex];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lessonPaused || prefersReducedMotion) return;
    const fadeTimer = window.setTimeout(() => setLessonFading(true), 5500);
    const changeTimer = window.setTimeout(() => {
      setLessonIndex((current) => (current + 1) % LESSONS.length);
      setLessonFading(false);
    }, 6000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(changeTimer);
    };
  }, [lessonIndex, lessonPaused]);

  useEffect(() => {
    if (!guideCallout) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector(`[data-guide-target="${guideCallout.target}"] .guide-callout`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [guideCallout]);

  const reset = () => {
    const currentTree = treeRef.current;
    const root = currentTree[activeRootId];
    const descendants = new Set<string>();
    function collect(nodeId: string) {
      for (const childId of currentTree[nodeId]?.children ?? []) { descendants.add(childId); collect(childId); }
    }
    collect(activeRootId);
    const emptyTree = Object.fromEntries(Object.entries(currentTree).filter(([id]) => !descendants.has(id)));
    emptyTree[activeRootId] = { ...root, options: [], optionsModelId: undefined, children: [] };
    pendingTemperature.current = null;
    treeRef.current = emptyTree;
    selectedNodeRef.current = activeRootId;
    setIsEditingPrompt(false);
    setGuideCallout(null);
    setTree(emptyTree); setActiveLeafId(activeRootId); setSelectedNodeId(activeRootId); setError(null);
  };
  function beginPromptEdit() {
    if (status !== 'idle') return;
    setPromptDraft(prompt);
    setIsEditingPrompt(true);
  }
  function savePrompt() {
    if (status !== 'idle') return;
    const nextPrompt = promptDraft.trimEnd();
    if (!nextPrompt) return;
    if (nextPrompt !== prompt) {
      const existingRootId = rootIdsRef.current.find((id) => treeRef.current[id]?.prompt === nextPrompt);
      const destinationId = existingRootId ?? `root-${nextNodeId.current++}`;
      if (!existingRootId) {
        const updatedTree = { ...treeRef.current, [destinationId]: newRoot(destinationId, nextPrompt) };
        treeRef.current = updatedTree;
        rootIdsRef.current = [...rootIdsRef.current, destinationId];
        setTree(updatedTree);
        setRootIds(rootIdsRef.current);
      }
      setActiveRootId(destinationId);
      setActiveLeafId(destinationId);
      setSelectedNodeId(destinationId);
    }
    setIsEditingPrompt(false);
  }
  async function handleLoad() {
    setStatus('loading'); setError(null); setProgress(0);
    try { await loadModel(model, setProgress); setLoadedModelId(modelId); }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }
  async function sampleFrom(sourceId: string, nextTemperature: number) {
      const sourceTree = treeRef.current;
      const sourceText = (rootFor(sourceTree, sourceId).prompt ?? DEFAULT_PROMPT) + pathTo(sourceTree, sourceId).map((node) => node.token).join('');
      const next = await predictNextToken(sourceText, nextTemperature, fixedSeed ? seed : randomSeed());
      const sampled = next.find((item) => item.sampled) ?? next[0];
      const currentTree = treeRef.current;
      const source = currentTree[sourceId];
      if (!source) throw new Error('That story position is no longer available.');
      const existingId = source.children.find((id) => currentTree[id].token === sampled.token);
      const destinationId = existingId ?? `node-${nextNodeId.current++}`;
      const destination = existingId ? currentTree[existingId] : { id: destinationId, parentId: source.id, token: sampled.token, options: [], children: [] };
      const updatedTree = { ...currentTree, [source.id]: { ...source, options: next, optionsModelId: modelId, children: existingId ? source.children : [...source.children, destinationId] }, [destinationId]: destination };
      treeRef.current = updatedTree;
      selectedNodeRef.current = destinationId;
      setTree(updatedTree);
      setActiveRootId(rootFor(updatedTree, destinationId).id);
      setActiveLeafId(destinationId);
      setSelectedNodeId(destinationId);
  }
  async function handleStep() {
    if (!isLoaded) return handleLoad();
    setStatus('thinking'); setError(null);
    try {
      await sampleFrom(selectedNodeId, temperature);
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }
  async function handleTemperatureChange(nextTemperature: number) {
    setTemperature(nextTemperature);
    if (!isLoaded || selectedNodeRef.current === ROOT_ID) return;
    pendingTemperature.current = nextTemperature;
    if (resampleInFlight.current) return;
    resampleInFlight.current = true;
    setStatus('thinking'); setError(null);
    try {
      while (pendingTemperature.current !== null) {
        const queuedTemperature = pendingTemperature.current;
        pendingTemperature.current = null;
        const selected = treeRef.current[selectedNodeRef.current];
        if (!selected?.parentId) break;
        await sampleFrom(selected.parentId, queuedTemperature);
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { resampleInFlight.current = false; setStatus('idle'); }
  }
  function chooseCandidate(candidate: TokenCandidate) {
    const source = tree[optionSourceId];
    if (!source) return;
    const existingId = source.children.find((id) => tree[id].token === candidate.token);
    const destinationId = existingId ?? `node-${nextNodeId.current++}`;
    if (!existingId) {
      setTree((current) => ({
        ...current,
        [source.id]: { ...current[source.id], children: [...current[source.id].children, destinationId] },
        [destinationId]: { id: destinationId, parentId: source.id, token: candidate.token, options: [], children: [] },
      }));
    }
    setActiveLeafId(existingId ? deepestDescendant(tree, existingId) : destinationId);
    setSelectedNodeId(destinationId);
    setActiveRootId(rootFor(tree, source.id).id);
  }
  function visitNode(nodeId: string) {
    setActiveLeafId(deepestDescendant(tree, nodeId));
    setSelectedNodeId(nodeId);
    setActiveRootId(rootFor(tree, nodeId).id);
    setGuideCallout(null);
  }
  async function clearCache() {
    setStatus('loading');
    try { await clearModelCache(); setLoadedModelId(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); }
  }

  async function showLesson(lesson: (typeof LESSONS)[number]) {
    if (status !== 'idle') return;
    setActiveDemoId(lesson.id); setStatus('loading'); setError(null); setGuideCallout(null); setIsEditingPrompt(false);
    try {
      const tinyModel = MODELS[0];
      setModelId(tinyModel.id);
      await loadModel(tinyModel, setProgress);
      setLoadedModelId(tinyModel.id);

      let lessonRootId = rootIdsRef.current.find((id) => treeRef.current[id]?.prompt === lesson.demo.prompt);
      if (!lessonRootId) {
        lessonRootId = `root-${nextNodeId.current++}`;
        treeRef.current = { ...treeRef.current, [lessonRootId]: newRoot(lessonRootId, lesson.demo.prompt) };
        rootIdsRef.current = [...rootIdsRef.current, lessonRootId];
        setTree(treeRef.current);
        setRootIds(rootIdsRef.current);
      }

      let frontier = [lessonRootId];
      const branchCount = lesson.demo.branches ?? 1;
      for (let depth = 0; depth < lesson.demo.steps; depth += 1) {
        const nextFrontier: string[] = [];
        for (const sourceId of frontier) {
          const sourceTree = treeRef.current;
          const source = sourceTree[sourceId];
          if (!source) continue;
          const sourceText = (rootFor(sourceTree, sourceId).prompt ?? DEFAULT_PROMPT) + pathTo(sourceTree, sourceId).map((node) => node.token).join('');
          const predictions = await predictNextToken(sourceText, lesson.demo.temperature ?? 0.8, randomSeed());
          const sampled = predictions.find((candidate) => candidate.sampled) ?? predictions[0];
          const alternatives = predictions.filter((candidate) => candidate.token !== sampled.token);
          const choices = depth === 0 && branchCount > 1 ? [sampled, ...alternatives.slice(0, branchCount - 1)] : [sampled];
          const childIds = [...source.children];
          const additions: StoryTree = {};
          for (const choice of choices) {
            let childId = childIds.find((id) => sourceTree[id]?.token === choice.token);
            if (!childId) {
              childId = `node-${nextNodeId.current++}`;
              childIds.push(childId);
              additions[childId] = { id: childId, parentId: sourceId, token: choice.token, options: [], children: [] };
            }
            nextFrontier.push(childId);
          }
          treeRef.current = { ...treeRef.current, ...additions, [sourceId]: { ...source, options: predictions, optionsModelId: tinyModel.id, children: childIds } };
          setTree(treeRef.current);
        }
        frontier = nextFrontier;
      }

      const destinationId = frontier[0] ?? lessonRootId;
      treeRef.current = { ...treeRef.current };
      selectedNodeRef.current = destinationId;
      setTree(treeRef.current);
      setActiveRootId(lessonRootId);
      setActiveLeafId(destinationId);
      setSelectedNodeId(destinationId);
      if (lesson.demo.temperature !== undefined) setTemperature(lesson.demo.temperature);
      if (lesson.id === 'random-seeds') setFixedSeed(false);
      setGuideCallout({ target: lesson.demo.target, title: lesson.demo.title, body: lesson.demo.callout });
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatus('idle'); setActiveDemoId(null); }
  }

  return <main>
    <header className="topbar">
      <a className="wordmark" href={import.meta.env.BASE_URL}><BrainCircuit size={22} /><span>Next Token Lab</span></a>
      <div className="privacy-note"><Database size={15} /> Runs and stays in your browser</div>
    </header>
    <section className="intro">
      <p className="eyebrow">The statistical nature of language models</p>
      <h1>Watch a model choose what comes next.</h1>
      <a className={`lede lesson-link ${lessonFading ? 'fading' : ''}`} href={`#lesson-${currentLesson.id}`} onBlur={() => setLessonPaused(false)} onClick={() => setExpandedLessonId(currentLesson.id)} onFocus={() => setLessonPaused(true)} onMouseEnter={() => setLessonPaused(true)} onMouseLeave={() => setLessonPaused(false)}>
        <span>{currentLesson.thesis}</span>
        <small>Explore this idea</small>
      </a>
    </section>
    <section className="workspace" aria-label="Next token explorer">
      <aside className="controls">
        <div className="section-heading"><span>01</span><h2>Choose a model</h2></div>
        <div className="guide-target model-list" data-guide-target="models">{MODELS.map((item) => <button className={`model-option ${modelId === item.id ? 'selected' : ''}`} disabled={status !== 'idle' || isEditingPrompt} key={item.id} onClick={() => { setModelId(item.id); setGuideCallout(null); }} type="button">
          <span className="model-name">{item.name}</span><span className="model-meta">{item.kind} · {item.size}</span><span className="model-description">{item.description}</span>
        </button>)}<GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="models" /></div>
        <div className="guide-target seed-control" data-guide-target="seed">
          <label className="seed-toggle"><input checked={fixedSeed} disabled={status !== 'idle' || isEditingPrompt} onChange={(event) => setFixedSeed(event.target.checked)} type="checkbox" /> Fixed seed</label>
          <input aria-label="Fixed sampling seed" disabled={!fixedSeed || status !== 'idle' || isEditingPrompt} id="seed" max={MAX_SEED} min="0" onChange={(event) => setSeed(Math.min(MAX_SEED, Math.max(0, Number(event.target.value))))} step="1" type="number" value={seed} />
          <p>{fixedSeed ? 'Same seed and settings, same pick.' : 'A fresh random seed for every pick.'}</p>
          <GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="seed" />
        </div>
        <button className="load-button" disabled={status !== 'idle' || isEditingPrompt} onClick={handleLoad} type="button">
          {status === 'loading' ? <LoaderCircle className="spin" size={18} /> : <Database size={18} />}
          {isLoaded ? 'Model ready' : status === 'loading' ? `Downloading ${Math.round(progress * 100)}%` : `Load ${model.size}`}
        </button>
        <p className="cache-copy">The first load comes from Hugging Face. Later visits reuse the browser cache.</p>
        <button className="text-button" disabled={status !== 'idle' || isEditingPrompt} onClick={clearCache} type="button"><Trash2 size={15} /> Clear model cache</button>
      </aside>
      <div className="analysis-board">
        <div className="board-toolbar"><div><span className={`status-dot ${isLoaded ? 'ready' : ''}`} />{isLoaded ? model.name : 'No model loaded'}</div><button aria-label="Reset generation" onClick={reset} title="Reset generation" type="button"><RotateCcw size={17} /></button></div>
        <div className={`guide-target generated-text ${isEditingPrompt ? 'editing' : ''}`} aria-live="polite" data-guide-target="tokens">
          {isEditingPrompt ? <div className="prompt-editor">
            <label htmlFor="prompt">Starting prompt</label>
            <textarea autoFocus id="prompt" onChange={(event) => setPromptDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setIsEditingPrompt(false); if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); savePrompt(); } }} rows={3} value={promptDraft} />
            <div className="prompt-editor-actions"><span>{activePath.length > 0 ? 'Enter saves this as another prompt root.' : 'Enter to save · Shift Enter for a new line.'}</span><button aria-label="Cancel prompt edit" onClick={() => setIsEditingPrompt(false)} title="Cancel" type="button"><X size={16} /></button><button aria-label="Save starting prompt" disabled={!promptDraft.trim()} onClick={savePrompt} title="Save prompt" type="button"><Check size={16} /></button></div>
          </div> : <><button className="prompt-text" onClick={beginPromptEdit} title="Edit starting prompt" type="button"><span>{prompt}</span><Pencil size={14} /></button>{activePath.map((node, index) => <button className={`story-token ${node.id === selectedNodeId ? 'selected' : ''} ${selectedIndex >= 0 && index > selectedIndex ? 'future' : ''}`} key={node.id} onClick={() => setSelectedNodeId(node.id)} title={`Inspect ${visibleToken(node.token)}`} type="button">{node.token}</button>)}{activePath.length === 0 && <em>Click the opening text to edit it, or load a model and step forward.</em>}</>}
          <GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="tokens" />
        </div>
        <div className="generation-controls">
          <div className="step-stack"><button className="step-button" disabled={status !== 'idle' || isEditingPrompt} onClick={handleStep} type="button">{status === 'thinking' ? <LoaderCircle className="spin" size={19} /> : <ArrowRight size={19} />}{isLoaded ? selectedNodeId === activeLeafId ? 'Step one token' : 'Branch from here' : 'Load model'}</button><div className="guide-target randomness-control" data-guide-target="temperature">
              <label className="temperature-label" htmlFor="temperature">Randomness <strong>{temperature.toFixed(1)}</strong></label>
              <input disabled={isEditingPrompt} id="temperature" max={MAX_TEMPERATURE} min="0" onChange={(event) => void handleTemperatureChange(Number(event.target.value))} step="0.1" type="range" value={temperature} />
              <div className="range-labels"><span>predictable</span><span>varied</span><span>chaotic</span></div>
              <GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="temperature" />
            </div></div><span>Click a generated token to inspect the odds that produced it. Later tokens turn gray but stay available.</span>
        </div>
        {error && <div className="error-message" role="alert">{error}</div>}
        <section className="guide-target probability-panel" data-guide-target="probabilities">
          <div className="panel-title"><div><Sparkles size={18} /><h2>{selectedToken ? `Odds for ${visibleToken(selectedToken)}` : 'What the model considered'}</h2></div><span>click an alternative to branch</span></div>
          {candidates.length === 0 ? <div className="empty-probabilities"><div className="ghost-bars"><i /><i /><i /><i /></div><p>Step forward to reveal the next-token landscape.</p></div> : <div className="candidate-list">{candidates.map((candidate) => <button className={candidate.token === selectedToken ? 'sampled' : ''} key={`${candidate.token}-${candidate.logprob}`} onClick={() => chooseCandidate(candidate)} type="button">
            <code>{visibleToken(candidate.token) || '∅'}</code><span className="probability-track"><i style={{ width: `${Math.max(1, candidate.probability * 100)}%` }} /></span><strong>{(candidate.probability * 100).toFixed(1)}%</strong><small>log p {candidate.logprob.toFixed(2)}</small>{candidate.token === selectedToken && <b>viewing</b>}
          </button>)}</div>}
          <GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="probabilities" />
        </section>
      </div>
      <aside className="guide-target branches" data-guide-target="tree">
        <div className="section-heading"><span>02</span><h2>Story tree</h2></div>
        <div className="current-branch"><GitBranch size={18} /><div><strong>{selectedNodeId === activeLeafId ? 'Current ending' : 'Earlier position'}</strong><p>{selectedNodeId === activeRootId ? 'Before the first token' : contextLabel(tree, selectedNodeId, prompt)}</p></div></div>
        <div className="root-list">{rootIds.map((rootId) => {
          const root = tree[rootId];
          if (!root) return null;
          return <div className={`prompt-root ${rootId === activeRootId ? 'active-root' : ''}`} key={rootId}><button className="root-button" onClick={() => visitNode(rootId)} type="button"><span>prompt</span><p>{root.prompt}</p></button>{root.children.length === 0 ? <p className="branch-empty">No generated tokens yet.</p> : <div className="tree-list">{root.children.map(function renderNode(nodeId): React.ReactNode {
          const node = tree[nodeId];
          const run = [node];
          let runEnd = node;
          while (runEnd.children.length === 1) {
            runEnd = tree[runEnd.children[0]];
            run.push(runEnd);
          }
          const compactText = run.map((item) => item.token).join('').trim();
          const orderedChildren = [...runEnd.children].sort((left, right) => Number(activePathIds.has(right)) - Number(activePathIds.has(left)));
          const runIds = new Set(run.map((item) => item.id));
          return <div className="tree-node" key={node.id}><button className={`${runIds.has(selectedNodeId) ? 'selected' : ''} ${run.some((item) => activePathIds.has(item.id)) ? 'active-path' : ''} compact-run`} onClick={() => visitNode(runEnd.id)} title={compactText || visibleToken(node.token)} type="button"><span>{run.length} {run.length === 1 ? 'token' : 'tokens'}</span><p>{compactText || '∅'}</p></button>{orderedChildren.length > 0 && <div className={`tree-children ${orderedChildren.length === 1 ? 'continuation' : 'variations'}`}>{orderedChildren.map(renderNode)}</div>}</div>;
        })}</div>}</div>;
        })}</div>
        <GuideCallout guide={guideCallout} onDismiss={() => setGuideCallout(null)} target="tree" />
      </aside>
    </section>
    <section className="explanations" id="explanations">
      <div className="explanations-heading">
        <p className="eyebrow">Explanations</p>
        <h2>Nine ideas you can test here.</h2>
        <p>Open an idea, then use the lab above to see it happen. These are not just facts to memorize; each one points to an experiment.</p>
      </div>
      <div className="lesson-list">
        {LESSONS.map((lesson, index) => <details id={`lesson-${lesson.id}`} key={lesson.id} onToggle={(event) => {
          if (event.currentTarget.open) setExpandedLessonId(lesson.id);
          else if (expandedLessonId === lesson.id) setExpandedLessonId(null);
        }} open={expandedLessonId === lesson.id}>
          <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{lesson.thesis}</strong></summary>
          <div className="lesson-explanation"><p>{lesson.explanation}</p><p><b>Try it:</b> {lesson.experiment}</p><button className="show-me-button" disabled={status !== 'idle'} onClick={() => void showLesson(lesson)} type="button">{activeDemoId === lesson.id ? <LoaderCircle className="spin" size={16} /> : <Eye size={16} />}{activeDemoId === lesson.id ? 'Building example...' : 'Show me'}</button></div>
        </details>)}
      </div>
    </section>
    <section className="plain-language"><p className="eyebrow">Keep this distinction in view</p><div><h2>The model offers odds.</h2><h2>The decoder makes the pick.</h2></div><p>A high number means “this token fits patterns I learned.” It does not mean the token is true, wise, or even useful.</p></section>
  </main>;
}

export default App;
