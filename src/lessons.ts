export interface Lesson {
  id: string;
  thesis: string;
  explanation: string;
  experiment: string;
  demo: LessonDemo;
}

export type LessonTarget = 'tokens' | 'probabilities' | 'tree' | 'temperature' | 'seed' | 'models';

export interface LessonDemo {
  prompt: string;
  target: LessonTarget;
  title: string;
  callout: string;
  steps: number;
  branches?: number;
  temperature?: number;
}

export const LESSONS: Lesson[] = [
  {
    id: 'tokens-are-pieces',
    thesis: 'Language models work with tokens, not whole ideas.',
    explanation: 'A token may be a word, part of a word, punctuation, or even a space. The model reads and writes these pieces one at a time.',
    experiment: 'Step through punctuation, contractions, or unusual words and inspect the token labels.',
    demo: { prompt: 'Once upon a time, a small robot discovered', target: 'tokens', title: 'Look at the separate pieces', callout: 'Each highlighted piece was generated separately. Spaces belong to tokens too, even though the finished sentence reads smoothly.', steps: 4 },
  },
  {
    id: 'odds-follow-context',
    thesis: 'Every next token has odds that depend on the text so far.',
    explanation: 'The model does not decide the whole answer at once. After every selected token, the changed context produces a new probability landscape.',
    experiment: 'Select an earlier token, choose another candidate, and compare the next set of odds.',
    demo: { prompt: 'Once upon a time, a small robot discovered', target: 'probabilities', title: 'These odds belong to one moment', callout: 'This ranked list was calculated from the prompt and selected branch. Choose another token and the model must calculate a new list.', steps: 1 },
  },
  {
    id: 'model-and-decoder',
    thesis: 'The model offers odds; the decoder makes the pick.',
    explanation: 'The language model produces probabilities. A sampling rule uses those probabilities to select one token, which may not be the most likely one.',
    experiment: 'Keep the same prompt and step more than once from the same position.',
    demo: { prompt: 'The little dragon opened the door and saw', target: 'probabilities', title: 'Odds first, selection second', callout: 'The bars are the model\'s offer. The green row is the sampler\'s pick. It can select a token other than the longest bar.', steps: 1 },
  },
  {
    id: 'hidden-tree',
    thesis: 'One answer hides a tree of possible answers.',
    explanation: 'A normal chat shows only the path that was selected. At every step, other tokens could have started different continuations.',
    experiment: 'Click an alternative candidate and watch a new branch appear.',
    demo: { prompt: 'Once upon a time, a small robot discovered', target: 'tree', title: 'One prompt, two possible paths', callout: 'Both branches were available at the same moment. Ordinary chat keeps one and hides the other; this tree preserves both.', steps: 1, branches: 2 },
  },
  {
    id: 'early-choices',
    thesis: 'A small early choice can reshape everything that follows.',
    explanation: 'Each selected token becomes part of the next prediction. Two branches that differ by one small piece can move toward very different endings.',
    experiment: 'Branch near the beginning, then grow both paths several tokens.',
    demo: { prompt: 'The child looked inside the mysterious box and found', target: 'tree', title: 'The split changes what follows', callout: 'These paths share one prompt, then take different early tokens. Each path gives the model a different context for its next prediction.', steps: 2, branches: 2 },
  },
  {
    id: 'temperature',
    thesis: 'Temperature reshapes the odds; it does not add knowledge.',
    explanation: 'Low temperature favors the strongest candidates. Higher temperature gives less likely candidates more room, making output more varied but not more informed or true.',
    experiment: 'Move Randomness from predictable to chaotic and watch the probability bars change.',
    demo: { prompt: 'The friendly robot wanted to help, so it', target: 'temperature', title: 'Randomness reshapes these odds', callout: 'Move this slider and watch probability move toward or away from lower-ranked choices. The model has not learned anything new.', steps: 1, temperature: 1.8 },
  },
  {
    id: 'random-seeds',
    thesis: 'Random does not mean uncaused.',
    explanation: "Sampling can choose different paths from the same odds. A fixed seed repeats the sampler's sequence, making an experiment easier to reproduce.",
    experiment: 'Try fresh random seeds, then enable Fixed seed and repeat the same branch.',
    demo: { prompt: 'At the edge of the forest, Mia heard', target: 'seed', title: 'A seed controls the repeatable draw', callout: 'The demo added repeated draws from the same starting point. Turn on Fixed seed to make future draws reproducible.', steps: 1, branches: 2 },
  },
  {
    id: 'likely-not-true',
    thesis: 'Likely is not the same as true.',
    explanation: 'A high probability means that text fits patterns the model learned. It does not mean the text is correct, wise, or checked against reality.',
    experiment: 'Give the model a confident but false premise and inspect which continuations it favors.',
    demo: { prompt: 'Everyone knows the moon is made of cheese, so the astronaut', target: 'probabilities', title: 'Fluent odds are not a fact check', callout: 'These probabilities measure how text fits the premise. The model can confidently continue a false setup because likelihood is not truth.', steps: 1 },
  },
  {
    id: 'models-disagree',
    thesis: 'Models can disagree while using the same basic process.',
    explanation: 'Training data, size, and training goals change the odds a model assigns. The candidates may differ, but generation still proceeds one token at a time.',
    experiment: 'Use the same prompt and settings with two models and compare their candidate lists.',
    demo: { prompt: 'The small robot learned that kindness', target: 'models', title: 'This is TinyStories 15M\'s view', callout: 'These saved odds came from TinyStories 15M. Choose another model, return to this prompt root, and step from it to compare a different model\'s candidates.', steps: 1 },
  },
];