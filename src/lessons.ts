export interface Lesson {
  id: string;
  thesis: string;
  explanation: string;
  experiment: string;
  demo: LessonDemo;
}

export type LessonTarget = 'tokens' | 'probabilities' | 'tree' | 'tree-path' | 'temperature' | 'seed' | 'models';

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

const FIRST_PREDICTION_PROMPT = 'Once upon a time, a small robot discovered';

export const LESSONS: Lesson[] = [
  {
    id: 'predicts-next',
    thesis: 'A language model predicts what could come next, one piece at a time.',
    explanation: 'It looks at the text so far, scores possible next tokens, and selects one. A token can be a word or a word piece; this example starts with a whole word so the progression is easy to see.',
    experiment: 'Compare possible tokens, commit the word “a,” and watch the model continue one token at a time.',
    demo: {
      prompt: FIRST_PREDICTION_PROMPT,
      target: 'probabilities',
      title: 'Nothing has been committed yet',
      callout: 'The model gives “a” the highest probability, alongside other possible next tokens. These are choices for the next token only; the story still ends at “discovered.”',
      steps: 0,
      paths: [{ tokens: [' a'], steps: 0 }],
      focusBranch: 0,
      focusToken: -1,
      seed: 42,
      temperature: 0.8,
      scenarios: [
        { label: 'Possible next pieces' },
        { label: 'Commit one word', target: 'tokens', title: 'The choice joins the context', callout: 'The token “ a” is now committed to this path, so the visible story has changed. This token happens to be a whole word; other tokens can be word pieces or punctuation.', focusToken: 0 },
        { label: 'Keep predicting', target: 'tokens', title: 'The cycle builds a continuation', callout: 'The model has repeated the same process several more times. Each new token joined the context before the model predicted the next one.', paths: [{ tokens: [' a'], steps: 7 }], focusToken: 7 },
      ],
    },
  },
  {
    id: 'tokens-are-pieces',
    thesis: 'Models build text from tokens, not always whole words.',
    explanation: 'A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.',
    experiment: 'Look at how this model builds the single word scared from two separate tokens.',
    demo: { prompt: BEAR_PROMPT, target: 'tokens', title: 'One word, two model pieces', callout: 'We read “scared” as one word. This model produced it as two tokens: “ sc” and “ared.” Tokens are the pieces the model actually predicts.', steps: 0, paths: [BEAR_PATHS[0]], focusBranch: 0, focusToken: 1, seed: 42, temperature: 0.8 },
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
    id: 'early-choices',
    thesis: 'One early choice can reshape the whole continuation.',
    explanation: 'A normal chat hides the alternatives available at each step. Here, sc, excited, happy, and sad remain visible so you can follow each choice and see how it changes every prediction that comes after it.',
    experiment: 'Reveal four possible branches, then use Prev and Next to compare their 35-token continuations.',
    demo: {
      prompt: BEAR_PROMPT,
      target: 'tree',
      title: 'One prompt, four possible paths',
      callout: 'Scared, excited, happy, and sad were all available at the same moment. Ordinary chat keeps one path and hides the others; this tree preserves all four.',
      steps: 0,
      paths: [...BEAR_PATHS, { tokens: [' sad'], steps: 0 }],
      focusBranch: 0,
      seed: 42,
      temperature: 0.8,
      scenarios: [
        { label: 'The first choice', target: 'probabilities', title: 'How would we feel?', callout: 'The prompt stops just before the feeling. Would meeting the bear make the robot scared, excited, happy, or sad? “sc,” “excited,” “happy,” and “sad” are all possible next tokens here. The token chosen now becomes part of the context and reshapes every prediction that follows.', focusToken: -1 },
        { label: 'sc path', target: 'tree-path', title: 'The “sc” path', callout: 'After selecting “sc,” the model generated 35 more tokens. Compare this continuation with the other three paths; only the first selected token was forced to differ.', paths: [{ tokens: [' sc'], steps: 35 }] },
        { label: 'excited path', target: 'tree-path', title: 'The “excited” path', callout: 'After selecting “excited,” the model generated 35 more tokens with the same seed and temperature. The early choice changed every prediction that followed.', paths: [{ tokens: [' excited'], steps: 35 }] },
        { label: 'happy path', target: 'tree-path', title: 'The “happy” path', callout: 'After selecting “happy,” the model generated 35 more tokens with the same seed and temperature. Flip between the paths to compare where this context led.', paths: [{ tokens: [' happy'], steps: 35 }] },
        { label: 'sad path', target: 'tree-path', title: 'The “sad” path shifts the subject', callout: 'This continuation treats the bear as the one feeling sad, then has the robot try to cheer him up. One early choice changed how the model resolved the ambiguous “He” and shaped the story that followed.', paths: [{ tokens: [' sad'], steps: 35 }] },
      ],
    },
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