export interface Lesson {
  id: string;
  thesis: string;
  explanation: string;
  experiment: string;
  demo: LessonDemo;
}

export type LessonTarget = 'tokens' | 'probabilities' | 'tree' | 'temperature' | 'seed' | 'models';

export interface LessonDemoPath {
  tokens: string[];
  steps: number;
}

export interface LessonDemoScenario extends Partial<Omit<LessonDemo, 'scenarios'>> {
  label: string;
}

export interface LessonDemo {
  modelId?: string;
  prompt: string;
  target: LessonTarget;
  title: string;
  callout: string;
  steps: number;
  branches?: number;
  paths?: LessonDemoPath[];
  focusBranch?: number;
  focusToken?: number;
  seed: number;
  temperature?: number;
  scenarios?: LessonDemoScenario[];
}

const BEAR_PROMPT = 'Once upon a time, a small robot discovered a large bear. He felt very';
const BEAR_PATHS: LessonDemoPath[] = [
  { tokens: [' sc', 'ared'], steps: 0 },
  { tokens: [' excited'], steps: 0 },
  { tokens: [' happy'], steps: 0 },
];

export const LESSONS: Lesson[] = [
  {
    id: 'predicts-next',
    thesis: 'A language model predicts what could come next.',
    explanation: 'It looks at the text so far and gives several possible next pieces a chance. One piece is selected, added to the text, and then the model predicts again.',
    experiment: 'Compare the chances for scared, excited, happy, and other possible continuations.',
    demo: { prompt: BEAR_PROMPT, target: 'probabilities', title: 'Several futures are possible', callout: 'At this point in the story, the model offered all of these possible next pieces. Each bar shows how strongly that piece fit the text so far.', steps: 0, paths: BEAR_PATHS, focusBranch: 0, focusToken: 0, seed: 42, temperature: 0.8 },
  },
  {
    id: 'tokens-are-pieces',
    thesis: 'Models build text from tokens, not always whole words.',
    explanation: 'A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.',
    experiment: 'Look at how this model builds the single word scared from two separate tokens.',
    demo: { prompt: BEAR_PROMPT, target: 'tokens', title: 'One word, two model pieces', callout: 'We read “scared” as one word. This model produced it as two tokens: “ sc” and “ared.” Tokens are the pieces the model actually predicts.', steps: 0, paths: [BEAR_PATHS[0]], focusBranch: 0, focusToken: 1, seed: 42, temperature: 0.8 },
  },
  {
    id: 'odds-follow-context',
    thesis: 'The text so far changes what could come next.',
    explanation: 'Every selected token becomes part of the model’s context. After scared, excited, or happy, the model sees a different story and calculates a different set of chances.',
    experiment: 'Select each emotion’s branch and compare the next-token probability bars.',
    demo: { prompt: BEAR_PROMPT, target: 'tree', title: 'One changed word, three new contexts', callout: 'Select each branch and compare its bars. “And” stays likely, but its percentage and the other choices change because the model is reading a different emotion.', steps: 0, paths: BEAR_PATHS.map((path) => ({ ...path, steps: 1 })), focusBranch: 0, focusToken: 2, seed: 42, temperature: 0.8 },
  },
  {
    id: 'sampler',
    thesis: 'The model offers chances; the sampler makes the pick.',
    explanation: 'The model scores possible next tokens. The sampler can reshape those chances with temperature, then uses a random draw to pick one. A seed makes that draw repeatable.',
    experiment: 'Switch among the presets to separate the model’s odds, temperature, and the seeded draw.',
    demo: {
      prompt: BEAR_PROMPT,
      target: 'probabilities',
      title: 'The longest bar did not win',
      callout: 'The model ranked “sc” highest at 12.0%, but the sampler picked “sad” at 7.7%. The odds are an offer, not a decision.',
      steps: 1,
      seed: 43,
      temperature: 0.8,
      scenarios: [
        { label: 'Odds → pick' },
        { label: 'Higher temperature', target: 'temperature', title: 'Temperature flattens the odds', callout: 'At 1.8, the leading chances move closer together. Temperature reshapes the sampler’s odds; it does not add knowledge.', temperature: 1.8 },
        { label: 'Seed 43 again', target: 'seed', title: 'The same draw repeats', callout: 'Back at temperature 0.8, seed 43 picks “sad” again from the same odds. A fixed seed makes the random draw reproducible.', seed: 43, temperature: 0.8 },
        { label: 'Seed 2', target: 'seed', title: 'New seed, new pick', callout: 'The odds stayed the same, but seed 2 picked “excited.” A seed controls the draw, not the model’s knowledge.', seed: 2, temperature: 0.8 },
      ],
    },
  },
  {
    id: 'hidden-tree',
    thesis: 'One answer hides a tree of possible answers.',
    explanation: 'A normal chat shows only the path that was selected. At every step, other tokens could have started different continuations.',
    experiment: 'Click an alternative candidate and watch a new branch appear.',
    demo: { prompt: BEAR_PROMPT, target: 'tree', title: 'One prompt, three possible paths', callout: 'Scared, excited, and happy were all available at the same moment. Ordinary chat keeps one path and hides the others; this tree preserves all three.', steps: 0, paths: BEAR_PATHS, focusBranch: 0, focusToken: 1, seed: 42, temperature: 0.8 },
  },
  {
    id: 'early-choices',
    thesis: 'A small early choice can reshape everything that follows.',
    explanation: 'Each selected token becomes part of the next prediction. Two branches that differ by one small piece can move toward very different endings.',
    experiment: 'Branch near the beginning, then grow both paths several tokens.',
    demo: { prompt: BEAR_PROMPT, target: 'tree', title: 'The emotion changes what follows', callout: 'These paths differ first at scared, excited, or happy. From there, each choice pulls the continuing story in a different direction.', steps: 0, paths: BEAR_PATHS.map((path) => ({ ...path, steps: 7 })), focusBranch: 0, seed: 42, temperature: 0.8 },
  },
  {
    id: 'models-disagree',
    thesis: 'Models can disagree while using the same basic process.',
    explanation: 'Training data, size, and training goals change the odds a model assigns. The candidates may differ, but generation still proceeds one token at a time.',
    experiment: 'Switch models while keeping the story prompt, temperature, and seed fixed.',
    demo: {
      prompt: 'Once upon a time, a small robot discovered',
      target: 'probabilities',
      title: 'TinyStories expects a story object',
      callout: 'TinyStories gives “a” 80.1% here. This tiny model was trained especially on simple stories, so this prompt fits its specialty.',
      steps: 1,
      seed: 42,
      temperature: 0.8,
      scenarios: [
        { label: 'TinyStories 15M' },
        { label: 'SmolLM2 Base · 92 MB', modelId: 'smollm2-135m', title: 'SmolLM2 spreads its chances out', callout: 'On the identical prompt, SmolLM2 gives “a” 35.1% and “that” 20.7%. Different training produced a different distribution.' },
      ],
    },
  },
  {
    id: 'likely-not-true',
    thesis: 'Likely is not the same as true.',
    explanation: 'A high probability means that text fits patterns the model learned. It does not mean the text is correct, wise, or checked against reality.',
    experiment: 'Compare the model’s chance for Chicago with the much smaller chance it gives the correct answer, Springfield.',
    demo: { modelId: 'smollm2-135m', prompt: 'Fact: The capital of Illinois is the city of', target: 'probabilities', title: 'Most likely is not most truthful', callout: 'Base SmolLM2 gives Chicago 48.7% here, while the correct answer, Springfield, gets only 1.4%. These bars measure predicted text, not checked facts.', steps: 0, paths: [{ tokens: [' Chicago'], steps: 0 }], focusBranch: 0, focusToken: 0, seed: 42, temperature: 0.8 },
  },
];