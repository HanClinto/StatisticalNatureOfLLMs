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
    explanation: 'It looks at the text so far, scores possible next tokens, and selects one. Even when we request a long continuation, it still creates that text one token at a time.',
    experiment: 'Start with one token, repeat once, then request 5 and 20 more to see that every apparent batch is the same next-token cycle repeated.',
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
        { label: 'Possible next pieces', callout: 'The model gives “a” the highest probability, alongside other possible next tokens. Nothing has been committed yet; the story still ends at “discovered.” Select Next to generate one token.' },
        { label: 'Generate 1 token', target: 'tokens', title: 'One token joins the context', callout: 'We selected “ a” and added that one token to the text. The context now ends at “discovered a.” Select Next to generate one more token.', focusToken: 0 },
        { label: 'Generate 1 more', target: 'probabilities', title: 'The cycle repeats with new context', callout: 'Using the text that now included “ a,” the model scored a new set of possibilities and we selected the highlighted token. Select Next to generate five more tokens.', paths: [{ tokens: [' a'], steps: 1 }], focusToken: 1 },
        { label: 'Generate 5 more', target: 'tokens', title: 'Five tokens still arrive one at a time', callout: 'We requested five more tokens, but they were not created as one block. Each token joined the context before the next set of possibilities was scored and another token was selected. Select Next to generate 20 more tokens.', paths: [{ tokens: [' a'], steps: 6 }], focusToken: 6 },
        { label: 'Generate 20 more', target: 'tokens', title: 'A larger batch uses the same cycle', callout: 'The request produced 20 more tokens by repeating next-token prediction 20 times in sequence. No matter how much text we request at once, it is still created one token at a time.', paths: [{ tokens: [' a'], steps: 26 }], focusToken: 26 },
      ],
    },
  },
  {
    id: 'tokens-are-pieces',
    thesis: 'Models build text from tokens, not always whole words.',
    explanation: 'A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows. The same piece can also begin more than one word.',
    experiment: 'Build the shared “sc” prefix, compare two possible endings, then follow the text generated from scared and scary.',
    demo: {
      prompt: BEAR_PROMPT,
      target: 'tokens',
      title: 'The word is not finished yet',
      callout: 'The model selected “ sc,” but that token is only the beginning of a word. The next token will determine what the word becomes.',
      steps: 0,
      paths: [BEAR_PATHS[0], { tokens: [' sc', 'ary'], steps: 0 }],
      focusBranch: 0,
      focusToken: 0,
      seed: 42,
      temperature: 0.8,
      scenarios: [
        { label: 'Build the prefix' },
        { label: 'Compare endings', target: 'probabilities', title: 'One prefix, two possible words', callout: 'After “sc,” the model ranks “ared” highest, completing scared. It also offers “ary,” which completes scary. A token piece does not determine the whole word by itself.', focusToken: 1 },
        { label: 'scared path', target: 'tree-path', title: 'Continue from scared', callout: 'With “ared” selected, scared becomes part of the context and the model builds from that version of the story.', paths: [{ tokens: [' sc', 'ared'], steps: 12 }], focusToken: 1 },
        { label: 'scary path', target: 'tree-path', title: 'Continue from scary', callout: 'Selecting “ary” produces the grammatical phrase “He felt very scary,” then the model keeps predicting from it. The resulting story may not be coherent, but it is still a possible token path.', paths: [{ tokens: [' sc', 'ary'], steps: 12 }], focusToken: 1 },
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
        { label: 'sc path', target: 'tree-path', title: 'The “sc” path', callout: 'We forced “sc” as the first token, then kept going for 35 more tokens. Compare this continuation with the other three paths; only the forced first token differs.', paths: [{ tokens: [' sc'], steps: 35 }] },
        { label: 'excited path', target: 'tree-path', title: 'The “excited” path', callout: 'We started over, forced “excited” as the first token, then kept going for 35 more tokens with the same seed and temperature. That early choice changed every prediction that followed.', paths: [{ tokens: [' excited'], steps: 35 }] },
        { label: 'happy path', target: 'tree-path', title: 'The “happy” path', callout: 'We started over again, forced “happy” as the first token, then kept going for 35 more tokens with the same seed and temperature. Flip between the paths to compare where this context led.', paths: [{ tokens: [' happy'], steps: 35 }] },
        { label: 'sad path', target: 'tree-path', title: 'The “sad” path shifts the subject', callout: 'This continuation treats the bear as the one feeling sad, then has the robot try to cheer him up. One early choice changed how the model resolved the ambiguous “He” and shaped the story that followed.', paths: [{ tokens: [' sad'], steps: 35 }] },
      ],
    },
  },
  {
    id: 'sampler',
    thesis: 'The model offers chances; the sampler makes the pick.',
    explanation: 'The model scores possible next tokens. Temperature reshapes those chances before the sampler picks: low temperature favors the leaders, while high temperature gives less likely tokens more influence.',
    experiment: 'Compare three 35-token continuations generated from the same prompt and seed at temperatures 0, 1.5, and 3.0.',
    demo: {
      prompt: BEAR_PROMPT,
      target: 'tree-path',
      title: 'Temperature 0 stays with the leaders',
      callout: 'At temperature 0, the sampler always takes the highest-scoring token. This 35-token continuation is the model’s most predictable path at every step.',
      steps: 35,
      seed: 42,
      temperature: 0,
      scenarios: [
        { label: 'Temperature 0' },
        { label: 'Temperature 1.5', title: 'More alternatives enter the story', callout: 'At temperature 1.5, lower-ranked tokens have more influence. The prompt and seed are unchanged; compare this 35-token continuation with the predictable path.', temperature: 1.5 },
        { label: 'Temperature 3.0', title: 'High temperature compounds surprises', callout: 'At temperature 3.0, the sampler gives much more influence to unlikely tokens. Each unusual choice changes the context for the next prediction, so the wackiness can build across 35 tokens.', temperature: 3 },
      ],
    },
  },
  {
    id: 'language-not-physics',
    thesis: 'The model predicts language patterns, not physical randomness.',
    explanation: 'A fair coin has equal physical chances, and a uniform number picker gives every number the same chance. A language model instead scores how text is likely to continue based on patterns it learned from training data.',
    experiment: 'Compare the model’s uneven text predictions with the even distributions defined by a fair coin and a uniform number picker.',
    demo: {
      modelId: 'smollm2-135m',
      prompt: 'I flipped a fair coin. It came up',
      target: 'probabilities',
      title: 'These are language odds, not coin odds',
      callout: 'A fair coin gives heads and tails equal physical chances. Here, lowercase “heads” gets 74.9% while lowercase “tails” gets 6.9%. The model did not flip or observe a coin. It predicted what a likely writer of similar text would write next, based on patterns learned during training.',
      steps: 0,
      paths: [{ tokens: [' heads'], steps: 0 }],
      focusBranch: 0,
      focusToken: 0,
      seed: 42,
      temperature: 0.8,
      scenarios: [
        { label: 'Fair coin' },
        { label: 'Numbers 1–10', prompt: 'When people are asked to pick a random number between 1 and 10, the most common answer is', title: 'This is not a uniform number picker', callout: 'After the space token, SmolLM2 gives “1” 35.3%, “2” 17.3%, “3” 16.3%, and “7” 2.1%. A uniform picker would give each number 10%. These are learned language expectations, not simulated randomness or a direct count of the training data.', paths: [{ tokens: [' ', '1'], steps: 0 }], focusToken: 1 },
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