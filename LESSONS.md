# Lessons for Next Token Lab

Next Token Lab should teach a small number of ideas that learners can test directly in the interface. Each lesson begins with a plain-language claim, then points back to something visible or adjustable in the lab.

The sequence moves from the basic mechanism to its consequences. It is written for a middle-school learner first, with enough precise language to support deeper discussion.

## 1. Language models work with tokens, not whole ideas

**Thesis:** A model builds text from tokens: small pieces that may be a word, part of a word, punctuation, or even a space.

The interface reveals one generated token at a time. Showing spaces as dots and line breaks as arrows makes otherwise invisible token boundaries easier to notice. A token is a piece of text, not necessarily a complete word or thought.

**Try it:** Step through punctuation, contractions, or unusual words and inspect the token labels.

## 2. Every next token has odds that depend on the text so far

**Thesis:** The model does not decide the whole answer at once. After every token, it calculates a new set of odds for what could come next.

These are conditional odds: changing the prompt or any earlier token changes the context, so the next-token probabilities change too. The probability bars are a snapshot of one moment in an unfolding process.

**Try it:** Select an earlier token, choose another candidate, and compare the next set of odds.

## 3. The model offers odds; the decoder makes the pick

**Thesis:** A language model produces probabilities. A sampling rule turns those probabilities into one selected token.

The highest-probability token is not automatically chosen unless the decoder is set to behave predictably. With sampling, a less likely token can still be selected. Keeping the model and the selection rule separate prevents the common misconception that a probability is already a decision.

**Try it:** Keep the same prompt and step more than once from the same position.

## 4. One answer hides a tree of possible answers

**Thesis:** A chat window shows one path, but generation is really a branching tree of possible continuations.

At each step, many tokens could be chosen. Once one is selected, most interfaces hide the alternatives. The story tree keeps those roads visible and lets a learner return to an earlier position without losing the other continuation.

**Try it:** Click an alternative candidate and watch a new branch appear.

## 5. A small early choice can reshape everything that follows

**Thesis:** Choosing one different token changes the context, which can change every later probability.

The model recalculates after each token. Two branches that differ by one small piece can begin similarly and then move toward very different endings. The difference is not a stored alternate answer; each branch creates a new sequence of conditional predictions.

**Try it:** Branch near the beginning, then grow both paths several tokens.

## 6. Temperature reshapes the odds; it does not add knowledge

**Thesis:** Temperature changes how strongly the decoder favors the model's top choices.

Low temperature concentrates the odds around likely tokens. Higher temperature spreads the odds toward less likely choices. It can make output more varied or surprising, but it does not teach the model new facts or make weak possibilities more truthful.

**Try it:** Move Randomness from predictable to chaotic and watch the same probability landscape change.

## 7. Random does not mean uncaused

**Thesis:** Sampling can produce different results from the same odds, while a fixed seed can make the same experiment repeatable.

A random seed supplies the repeatable starting point for the sampler's sequence of picks. Fixing the seed is useful when comparing settings because it holds one source of variation steady. A fresh seed better demonstrates the range of paths available.

**Try it:** Repeat a branch with fresh random seeds, then enable Fixed seed and repeat it again.

## 8. Likely is not the same as true

**Thesis:** A high probability means "this fits patterns the model learned," not "this is correct."

The model is predicting text, not checking a fact against reality. Fluent, familiar, and widely repeated claims may receive high probability whether or not they are accurate. Probability describes the model's expectation inside this context.

**Try it:** Give the model a confident but false premise and inspect which continuations it favors.

## 9. Models can disagree while using the same basic process

**Thesis:** Different models can assign different odds to the same prompt, even though they all generate one token at a time.

Training data, model size, and training goals shape the patterns a model learns. Changing models can change both the candidates and their probabilities. The mechanics remain recognizable even when the quality and character of the continuation differ.

**Try it:** Use the same prompt and settings with two models and compare their candidate lists.

## Curriculum boundary

Future versions may directly demonstrate chat templates, instruction tuning, grammar-constrained output, and tool calls. Those are important lessons, but they should enter this core list only when the GUI exposes enough of each mechanism for a learner to test the claim rather than merely read about it.