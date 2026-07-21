# Lessons for Next Token Lab

Next Token Lab should teach a small number of ideas that learners can test directly in the interface. Each lesson begins with a plain-language claim, then points back to something visible or adjustable in the lab.

The sequence moves from the basic mechanism to its consequences. It is written for a middle-school learner first, with enough precise language to support deeper discussion.

## 1. A language model predicts what could come next, one piece at a time

**Thesis:** A model looks at the text so far, scores several possible next pieces, and selects one before predicting again.

The model does not retrieve a finished answer or commit an entire sentence at once. The robot scenario starts with a whole-word token so the visible progression is clear:

- **Possible next pieces:** “a” and other continuations receive probabilities, but nothing has been committed yet.
- **Commit one word:** the whole-word token “a” joins this generation path. Standard generation does not revise earlier tokens unless the surrounding software edits or restarts the sequence.
- **Keep predicting:** the model repeatedly uses the changed context to select another token, building a longer continuation.

The first selected token happens to be a whole word, but models actually generate tokens, which may also be word pieces or punctuation. The model may assign probabilities based on patterns that extend beyond the immediate token, but later tokens have not yet been selected.

**Try it:** Use Next and Prev to move through one prediction cycle.

## 2. Models build text from tokens, not always whole words

**Thesis:** A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.

The interface reveals one generated token at a time. In the bear scenario, TinyStories builds the word “scared” from the separate tokens ` sc` and `ared`, making the difference between human words and model pieces concrete.

**Try it:** Inspect the two token buttons that form the single word scared.

## 3. The text so far changes what could come next

**Thesis:** After every selected token, the model calculates a new set of chances from the changed context.

Scared, excited, and happy create three versions of the same story. The guided example generates one additional token after each emotion so selecting a branch reveals the probability list calculated immediately after that emotion.

**Try it:** Select each emotion’s branch and compare the next-token probability bars.

## 4. The model offers chances; the sampler makes the pick

**Thesis:** The model scores possible next tokens. The sampler can reshape those chances and uses a random draw to select one.

This lesson combines three parts of one selection pipeline. First, seed 43 selects `sad` even though `sc` has the longest probability bar. Next, higher temperature moves the leading chances closer together without adding knowledge. Returning to seed 43 repeats `sad`, while seed 2 selects `excited` from the unchanged temperature-0.8 distribution.

The presets change one control at a time:

- **Odds → pick:** temperature 0.8 and seed 43 select a non-top token.
- **Higher temperature:** temperature 1.8 visibly flattens the leading probabilities.
- **Seed 43 again:** returning to the original settings repeats the original pick.
- **Seed 2:** changing only the seed changes the pick while leaving the odds unchanged.

**Try it:** Switch among the presets and watch which parts of the experiment change.

## 5. One answer hides a tree of possible answers

**Thesis:** A chat window shows one path, but generation is really a branching tree of possible continuations.

At each step, many tokens could be chosen. Once one is selected, most interfaces hide the alternatives. The story tree keeps those roads visible and lets a learner return to an earlier position without losing the other continuation.

**Try it:** Click an alternative candidate and watch a new branch appear.

## 6. A small early choice can reshape everything that follows

**Thesis:** Choosing one different token changes the context, which can change every later probability.

The model recalculates after each token. Two branches that differ by one small piece can begin similarly and then move toward very different endings. The difference is not a stored alternate answer; each branch creates a new sequence of conditional predictions.

**Try it:** Branch near the beginning, then grow both paths several tokens.

## 7. Models can disagree while using the same basic process

**Thesis:** Different models can assign different odds to the same prompt, even though they all generate one token at a time.

Training data, model size, and training goals shape the patterns a model learns. The presets hold the prompt, temperature, and seed fixed while changing only the model. On the TinyStories-native prompt “Once upon a time, a small robot discovered”, TinyStories gives `a` 80.1%. SmolLM2 gives `a` 35.1% and `that` 20.7%.

**Try it:** Switch between the TinyStories and SmolLM2 presets and compare their candidate lists.

## 8. Likely is not the same as true

**Thesis:** A high probability means "this fits patterns the model learned," not "this is correct."

The model is predicting text, not checking a fact against reality. Fluent, familiar, and widely repeated claims may receive high probability whether or not they are accurate. Probability describes the model's expectation inside this context.

The guided example uses the base SmolLM2 135M model with the prompt “Fact: The capital of Illinois is the city of”. It gives `Chicago` 48.7%, while the correct answer, `Springfield`, gets only 1.4%. This keeps the comparison inside raw next-token prediction and makes the difference between statistical likelihood and factual accuracy directly visible.

**Try it:** Compare the model’s chance for Chicago with the much smaller chance it gives Springfield.

## Curriculum boundary

Future versions may directly demonstrate chat templates, instruction tuning, grammar-constrained output, and tool calls. Those are important lessons, but they should enter this core list only when the GUI exposes enough of each mechanism for a learner to test the claim rather than merely read about it.