# Lessons for Lab 01: Next-Token Prediction

Lab 01 should teach a small number of ideas that learners can test directly in the interface. Each lesson begins with a plain-language claim, then points back to something visible or adjustable in the lab.

The sequence moves from the basic mechanism to its consequences. It is written for a middle-school learner first, with enough precise language to support deeper discussion.

## 1. A language model predicts what could come next, one piece at a time

**Thesis:** A model looks at the text so far, scores several possible next pieces, and selects one before predicting again.

The model does not retrieve a finished answer or commit an entire sentence at once. The robot scenario grows the continuation in increasingly large requests while exposing that they all use the same sequential process:

- **Possible next pieces:** “a” and other continuations receive probabilities, but nothing has been committed yet.
- **Generate 1 token:** ` a` joins the context as one whole-word token.
- **Generate 1 more:** the changed context produces a new probability distribution before another token is selected.
- **Generate 5 more:** five tokens appear, but each one is added before the next prediction is made.
- **Generate 20 more:** one action repeats next-token prediction 20 times, producing a longer continuation without generating a block of text all at once.

The first selected token happens to be a whole word, but models actually generate tokens, which may also be word pieces or punctuation. Whether we request 1, 5, 20, or 35 tokens, each token becomes context before the next one is predicted.

**Try it:** Use Next and Prev to watch the same one-token cycle scale from a single step to a longer continuation.

## 2. Models build text from tokens, not always whole words

**Thesis:** A token is one piece the model can predict. It may be a whole word, part of a word, punctuation, or a space joined to what follows.

The interface reveals one generated token at a time. In the bear scenario, TinyStories first produces the shared prefix ` sc`. Its most likely next token is `ared`, completing “scared,” but the lower-probability token `ary` can complete “scary” instead. The lesson follows both choices into short continuations to show that one token piece can begin multiple words, and that a possible token path is not guaranteed to produce a coherent story.

**Try it:** Build the prefix, compare its possible endings, then follow the scared and scary paths.

## 3. One early choice can reshape the whole continuation

**Thesis:** A chat window hides the other paths that were possible, and choosing one path changes every prediction that follows.

The first preset reveals four alternatives—`sc`, `excited`, `happy`, and `sad`—that were available at the same point. Ordinary chat would keep only one. The next four presets force one of those first choices and generate 35 more tokens with the same seed and temperature, making the consequences directly comparable.

The `sad` continuation is especially revealing: it treats the bear as the one feeling sad and has the robot try to cheer him up. One early choice changes how the model resolves the ambiguous “He,” then each subsequent prediction builds on that interpretation.

**Try it:** Reveal the hidden alternatives, then use Next and Prev to flip among their four 35-token continuations.

## 4. The model offers chances; the sampler makes the pick

**Thesis:** The model scores possible next tokens. Temperature reshapes those chances before the sampler selects one.

This lesson holds the prompt and seed fixed while generating 35 tokens at each of three temperatures. Because every selected token becomes context for the next prediction, temperature can influence not only one choice but the direction and coherence of the whole continuation.

The presets change only temperature:

- **Temperature 0:** always select the highest-scoring token, producing the model's most predictable path.
- **Temperature 1.5:** give lower-ranked alternatives more influence, allowing less expected turns into the story.
- **Temperature 3.0:** flatten the distribution much more strongly, so unusual selections can compound as generation continues.

Temperature changes how the sampler uses the model's scores; it does not add knowledge or improve the underlying model.

**Try it:** Use Next and Prev to compare the three 35-token continuations from the same starting point.

## 5. The model predicts language patterns, not physical randomness

**Thesis:** The model's probabilities describe likely text continuations, not the outcomes of physical simulations or uniform random processes.

A fair coin has a 50% physical chance of landing on either side. Given “I flipped a fair coin. It came up”, however, SmolLM2 assigns 74.9% to lowercase `heads` and 6.9% to lowercase `tails`. The model did not flip or observe a coin. It scored how the sentence was likely to continue based on learned language patterns.

The number example makes the same distinction in a larger distribution. After “When people are asked to pick a random number between 1 and 10, the most common answer is ”, SmolLM2 gives `1` 35.3%, `2` 17.3%, `3` 16.3%, and `7` 2.1%. A uniform number picker would give every number 10%.

These values are neither simulated randomness nor a direct frequency table of the training corpus. They are the conditional expectations learned by this particular model from its training objective and data.

**Try it:** Compare the model's uneven language odds with the even distributions defined by a fair coin and a uniform number picker.

## 6. Models can disagree while using the same basic process

**Thesis:** Different models can assign different odds to the same prompt, even though they all generate one token at a time.

Training data, model size, and training goals shape the patterns a model learns. The presets hold the prompt, temperature, and seed fixed while changing only the model. On the TinyStories-native prompt “Once upon a time, a small robot discovered”, TinyStories gives `a` 80.1%. SmolLM2 gives `a` 35.1% and `that` 20.7%.

**Try it:** Switch between the TinyStories and SmolLM2 presets and compare their candidate lists.

## 7. Likely is not the same as true

**Thesis:** A high probability means "this fits patterns the model learned," not "this is correct."

The model is predicting text, not checking a fact against reality. Fluent, familiar, and widely repeated claims may receive high probability whether or not they are accurate. Probability describes the model's expectation inside this context.

The guided example uses the base SmolLM2 135M model with the prompt “Fact: The capital of Illinois is the city of”. It gives `Chicago` 48.7%, while the correct answer, `Springfield`, gets only 1.4%. This keeps the comparison inside raw next-token prediction and makes the difference between statistical likelihood and factual accuracy directly visible.

**Try it:** Compare the model’s chance for Chicago with the much smaller chance it gives Springfield.

## Curriculum boundary

Future versions may directly demonstrate chat templates, instruction tuning, grammar-constrained output, and tool calls. Those are important lessons, but they should enter this core list only when the GUI exposes enough of each mechanism for a learner to test the claim rather than merely read about it.