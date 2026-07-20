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

export interface LessonDemo {
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
    id: 'model-and-decoder',
    thesis: 'The model offers chances; a picking rule chooses one.',
    explanation: 'The language model produces probabilities. A sampling rule, sometimes called a decoder, uses those probabilities to select one token, which may not be the most likely one.',
    experiment: 'Keep the same prompt and step more than once from the same position.',
    demo: { prompt: 'The little dragon opened the door and saw', target: 'probabilities', title: 'Odds first, selection second', callout: 'The bars are the model\'s offer. The green row is the sampler\'s pick. It can select a token other than the longest bar.', steps: 1, seed: 42 },
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
    id: 'temperature',
    thesis: 'Temperature reshapes the odds; it does not add knowledge.',
    explanation: 'Low temperature favors the strongest candidates. Higher temperature gives less likely candidates more room, making output more varied but not more informed or true.',
    experiment: 'Move Randomness from predictable to chaotic and watch the probability bars change.',
    demo: { prompt: 'The friendly robot wanted to help, so it', target: 'temperature', title: 'Randomness reshapes these odds', callout: 'Move this slider and watch probability move toward or away from lower-ranked choices. The model has not learned anything new.', steps: 1, seed: 42, temperature: 1.8 },
  },
  {
    id: 'random-seeds',
    thesis: 'Random choices can still be repeated.',
    explanation: "Sampling can choose different paths from the same odds. A fixed seed repeats the sampler's sequence, making an experiment easier to reproduce.",
    experiment: 'Try fresh random seeds, then enable Fixed seed and repeat the same branch.',
    demo: { prompt: 'At the edge of the forest, Mia heard', target: 'seed', title: 'A seed controls the repeatable draw', callout: 'This example used seed 42. Running the same prompt with the same settings repeats the draw; changing the seed can select another path.', steps: 1, branches: 2, seed: 42 },
  },
  {
    id: 'likely-not-true',
    thesis: 'Likely is not the same as true.',
    explanation: 'A high probability means that text fits patterns the model learned. It does not mean the text is correct, wise, or checked against reality.',
    experiment: 'Give the model a confident but false premise and inspect which continuations it favors.',
    demo: { prompt: 'Everyone knows the moon is made of cheese, so the astronaut', target: 'probabilities', title: 'Fluent odds are not a fact check', callout: 'These probabilities measure how text fits the premise. The model can confidently continue a false setup because likelihood is not truth.', steps: 1, seed: 42 },
  },
  {
    id: 'models-disagree',
    thesis: 'Models can disagree while using the same basic process.',
    explanation: 'Training data, size, and training goals change the odds a model assigns. The candidates may differ, but generation still proceeds one token at a time.',
    experiment: 'Use the same prompt and settings with two models and compare their candidate lists.',
    demo: { prompt: 'The small robot learned that kindness', target: 'models', title: 'This is TinyStories 15M\'s view', callout: 'These saved odds came from TinyStories 15M. Choose another model, return to this prompt root, and step from it to compare a different model\'s candidates.', steps: 1, seed: 42 },
  },
];