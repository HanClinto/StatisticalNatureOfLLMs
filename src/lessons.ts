export interface Lesson {
  id: string;
  thesis: string;
  explanation: string;
  experiment: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 'tokens-are-pieces',
    thesis: 'Language models work with tokens, not whole ideas.',
    explanation: 'A token may be a word, part of a word, punctuation, or even a space. The model reads and writes these pieces one at a time.',
    experiment: 'Step through punctuation, contractions, or unusual words and inspect the token labels.',
  },
  {
    id: 'odds-follow-context',
    thesis: 'Every next token has odds that depend on the text so far.',
    explanation: 'The model does not decide the whole answer at once. After every selected token, the changed context produces a new probability landscape.',
    experiment: 'Select an earlier token, choose another candidate, and compare the next set of odds.',
  },
  {
    id: 'model-and-decoder',
    thesis: 'The model offers odds; the decoder makes the pick.',
    explanation: 'The language model produces probabilities. A sampling rule uses those probabilities to select one token, which may not be the most likely one.',
    experiment: 'Keep the same prompt and step more than once from the same position.',
  },
  {
    id: 'hidden-tree',
    thesis: 'One answer hides a tree of possible answers.',
    explanation: 'A normal chat shows only the path that was selected. At every step, other tokens could have started different continuations.',
    experiment: 'Click an alternative candidate and watch a new branch appear.',
  },
  {
    id: 'early-choices',
    thesis: 'A small early choice can reshape everything that follows.',
    explanation: 'Each selected token becomes part of the next prediction. Two branches that differ by one small piece can move toward very different endings.',
    experiment: 'Branch near the beginning, then grow both paths several tokens.',
  },
  {
    id: 'temperature',
    thesis: 'Temperature reshapes the odds; it does not add knowledge.',
    explanation: 'Low temperature favors the strongest candidates. Higher temperature gives less likely candidates more room, making output more varied but not more informed or true.',
    experiment: 'Move Randomness from predictable to chaotic and watch the probability bars change.',
  },
  {
    id: 'random-seeds',
    thesis: 'Random does not mean uncaused.',
    explanation: "Sampling can choose different paths from the same odds. A fixed seed repeats the sampler's sequence, making an experiment easier to reproduce.",
    experiment: 'Try fresh random seeds, then enable Fixed seed and repeat the same branch.',
  },
  {
    id: 'likely-not-true',
    thesis: 'Likely is not the same as true.',
    explanation: 'A high probability means that text fits patterns the model learned. It does not mean the text is correct, wise, or checked against reality.',
    experiment: 'Give the model a confident but false premise and inspect which continuations it favors.',
  },
  {
    id: 'models-disagree',
    thesis: 'Models can disagree while using the same basic process.',
    explanation: 'Training data, size, and training goals change the odds a model assigns. The candidates may differ, but generation still proceeds one token at a time.',
    experiment: 'Use the same prompt and settings with two models and compare their candidate lists.',
  },
];