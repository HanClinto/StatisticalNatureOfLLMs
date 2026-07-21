# Lessons for Lab 01: Next-Token Prediction

Lab 01 should teach a small number of ideas that learners can test directly in the interface. Each lesson begins with a plain-language claim, then points back to something visible or adjustable in the lab.

The sequence moves from the basic mechanism to its consequences. It is written for a middle-school learner first, with enough precise language to support deeper discussion.

## 1. A language model predicts what could come next, one piece at a time

**Thesis:** A model looks at the text so far, scores several possible next pieces, and selects one before predicting again.

The model does not retrieve a finished answer or commit an entire sentence at once. The robot scenario starts with a whole-word token so the visible progression is clear:

- **Possible next pieces:** “a” and other continuations receive probabilities, but nothing has been committed yet.
- **Predict after “a”:** the whole-word token “a” joins the context, then the model scores a new set of possibilities for what follows it. The selected next token and its probability panel make the changed distribution visible.
- **Keep predicting:** the model repeatedly uses the changed context to select another token, building a longer continuation.

The first selected token happens to be a whole word, but models actually generate tokens, which may also be word pieces or punctuation. The model may assign probabilities based on patterns that extend beyond the immediate token, but later tokens have not yet been selected.

**Try it:** Use Next and Prev to compare the initial choices with the new prediction made after “a.”

## 2. Models build text from tokens, not always whole words

**Thesis:** A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.

The interface reveals one generated token at a time. In the bear scenario, TinyStories first produces the shared prefix ` sc`. Its most likely next token is `ared`, completing “scared,” but the lower-probability token `ary` can complete “scary” instead. The lesson follows both choices into short continuations to show that one token piece can begin multiple words, and that a possible token path is not guaranteed to produce a coherent story.

**Try it:** Build the prefix, compare its possible endings, then follow the scared and scary paths.

## 3. The model offers chances; the sampler makes the pick

**Thesis:** The model scores possible next tokens. The sampler can reshape those chances and uses a random draw to select one.

This lesson combines three parts of one selection pipeline. First, seed 43 selects `sad` even though `sc` has the longest probability bar. Next, higher temperature moves the leading chances closer together without adding knowledge. Returning to seed 43 repeats `sad`, while seed 2 selects `excited` from the unchanged temperature-0.8 distribution.

The presets change one control at a time:

- **Odds → pick:** temperature 0.8 and seed 43 select a non-top token.
- **Higher temperature:** temperature 1.8 visibly flattens the leading probabilities.
- **Seed 43 again:** returning to the original settings repeats the original pick.
- **Seed 2:** changing only the seed changes the pick while leaving the odds unchanged.

**Try it:** Switch among the presets and watch which parts of the experiment change.

## 4. One early choice can reshape the whole continuation

**Thesis:** A chat window hides the other paths that were possible, and choosing one path changes every prediction that follows.

The first preset reveals four alternatives—`sc`, `excited`, `happy`, and `sad`—that were available at the same point. Ordinary chat would keep only one. The next four presets force one of those first choices and generate 35 more tokens with the same seed and temperature, making the consequences directly comparable.

The `sad` continuation is especially revealing: it treats the bear as the one feeling sad and has the robot try to cheer him up. One early choice changes how the model resolves the ambiguous “He,” then each subsequent prediction builds on that interpretation.

**Try it:** Reveal the hidden alternatives, then use Next and Prev to flip among their four 35-token continuations.

## 5. Models can disagree while using the same basic process

**Thesis:** Different models can assign different odds to the same prompt, even though they all generate one token at a time.

Training data, model size, and training goals shape the patterns a model learns. The presets hold the prompt, temperature, and seed fixed while changing only the model. On the TinyStories-native prompt “Once upon a time, a small robot discovered”, TinyStories gives `a` 80.1%. SmolLM2 gives `a` 35.1% and `that` 20.7%.

**Try it:** Switch between the TinyStories and SmolLM2 presets and compare their candidate lists.

## 6. Likely is not the same as true

**Thesis:** A high probability means "this fits patterns the model learned," not "this is correct."

The model is predicting text, not checking a fact against reality. Fluent, familiar, and widely repeated claims may receive high probability whether or not they are accurate. Probability describes the model's expectation inside this context.

The guided example uses the base SmolLM2 135M model with the prompt “Fact: The capital of Illinois is the city of”. It gives `Chicago` 48.7%, while the correct answer, `Springfield`, gets only 1.4%. This keeps the comparison inside raw next-token prediction and makes the difference between statistical likelihood and factual accuracy directly visible.

**Try it:** Compare the model’s chance for Chicago with the much smaller chance it gives Springfield.

## Curriculum boundary

Future versions may directly demonstrate chat templates, instruction tuning, grammar-constrained output, and tool calls. Those are important lessons, but they should enter this core list only when the GUI exposes enough of each mechanism for a learner to test the claim rather than merely read about it.