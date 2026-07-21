# Lessons for Next Token Lab

Next Token Lab should teach a small number of ideas that learners can test directly in the interface. Each lesson begins with a plain-language claim, then points back to something visible or adjustable in the lab.

The sequence moves from the basic mechanism to its consequences. It is written for a middle-school learner first, with enough precise language to support deeper discussion.

## 1. A language model predicts what could come next

**Thesis:** A model looks at the text so far and gives several possible next pieces a chance.

The model does not retrieve a finished answer. It assigns probabilities to possible continuations, selects one piece, adds it to the text, and repeats. The bear scenario begins with several plausible emotions so learners can see this choice before learning more specialized vocabulary.

**Try it:** Compare the chances for scared, excited, happy, and other possible continuations.

## 2. Models build text from tokens, not always whole words

**Thesis:** A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.

The interface reveals one generated token at a time. In the bear scenario, TinyStories builds the word “scared” from the separate tokens ` sc` and `ared`, making the difference between human words and model pieces concrete.

**Try it:** Inspect the two token buttons that form the single word scared.

## 3. The text so far changes what could come next

**Thesis:** After every selected token, the model calculates a new set of chances from the changed context.

Scared, excited, and happy create three versions of the same story. The guided example generates one additional token after each emotion so selecting a branch reveals the probability list calculated immediately after that emotion.

**Try it:** Select each emotion’s branch and compare the next-token probability bars.

## 4. The model offers chances; a picking rule chooses one

**Thesis:** A language model produces probabilities. A sampling rule, sometimes called a decoder, turns those probabilities into one selected token.

The highest-probability token is not automatically chosen unless the picking rule is set to behave predictably. Keeping the model and the selection rule separate prevents the common misconception that a probability is already a decision.

**Try it:** Keep the same prompt and step more than once from the same position.

## 5. One answer hides a tree of possible answers

**Thesis:** A chat window shows one path, but generation is really a branching tree of possible continuations.

At each step, many tokens could be chosen. Once one is selected, most interfaces hide the alternatives. The story tree keeps those roads visible and lets a learner return to an earlier position without losing the other continuation.

**Try it:** Click an alternative candidate and watch a new branch appear.

## 6. A small early choice can reshape everything that follows

**Thesis:** Choosing one different token changes the context, which can change every later probability.

The model recalculates after each token. Two branches that differ by one small piece can begin similarly and then move toward very different endings. The difference is not a stored alternate answer; each branch creates a new sequence of conditional predictions.

**Try it:** Branch near the beginning, then grow both paths several tokens.

## 7. Temperature reshapes the odds; it does not add knowledge

**Thesis:** Temperature changes how strongly the decoder favors the model's top choices.

Low temperature concentrates the odds around likely tokens. Higher temperature spreads the odds toward less likely choices. It can make output more varied or surprising, but it does not teach the model new facts or make weak possibilities more truthful.

**Try it:** Move Randomness from predictable to chaotic and watch the same probability landscape change.

## 8. Random choices can still be repeated

**Thesis:** Sampling can produce different results from the same odds, while a fixed seed can make the same experiment repeatable.

A random seed supplies the repeatable starting point for the sampler's sequence of picks. Fixing the seed is useful when comparing settings because it holds one source of variation steady. A fresh seed better demonstrates the range of paths available.

**Try it:** Repeat a branch with fresh random seeds, then enable Fixed seed and repeat it again.

## 9. Likely is not the same as true

**Thesis:** A high probability means "this fits patterns the model learned," not "this is correct."

The model is predicting text, not checking a fact against reality. Fluent, familiar, and widely repeated claims may receive high probability whether or not they are accurate. Probability describes the model's expectation inside this context.

The guided example uses the base SmolLM2 135M model with the prompt “Fact: The capital of Illinois is the city of”. It gives `Chicago` 48.7%, while the correct answer, `Springfield`, gets only 1.4%. This keeps the comparison inside raw next-token prediction and makes the difference between statistical likelihood and factual accuracy directly visible.

**Try it:** Compare the model’s chance for Chicago with the much smaller chance it gives Springfield.

## 10. Models can disagree while using the same basic process

**Thesis:** Different models can assign different odds to the same prompt, even though they all generate one token at a time.

Training data, model size, and training goals shape the patterns a model learns. Changing models can change both the candidates and their probabilities. The mechanics remain recognizable even when the quality and character of the continuation differ.

**Try it:** Use the same prompt and settings with two models and compare their candidate lists.

## Curriculum boundary

Future versions may directly demonstrate chat templates, instruction tuning, grammar-constrained output, and tool calls. Those are important lessons, but they should enter this core list only when the GUI exposes enough of each mechanism for a learner to test the claim rather than merely read about it.