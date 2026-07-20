# Future Lessons for Next Token Lab

This document holds lessons that matter to the larger curriculum but do not belong in the current Next Token Lab interface yet. The existing lab should remain focused on next-token probabilities, sampling, temperature, seeds, and branching.

A future lesson should move into the main GUI only when a learner can manipulate the mechanism and observe the result. Explanatory copy alone is not enough.

## Phase 2: Deeper decoding statistics

These lessons extend the current probability explorer without changing its basic subject.

### 1. Sampling has more controls than temperature

**Thesis:** Temperature reshapes the probability distribution, while top-k, top-p, and penalties filter or modify it in different ways.

**What this lesson contains:**

- Top-k keeps only a fixed number of candidates.
- Top-p keeps the smallest candidate set whose probabilities reach a chosen total.
- Repetition and frequency penalties reduce selected scores based on prior tokens.
- These controls belong to the decoder, not the model's learned knowledge.

**Future GUI:** Add overlays to the probability bars showing which candidates remain eligible after each rule. Let learners turn one rule on at a time and inspect the distribution before and after filtering.

**Experiment:** Hold the model, prompt, and seed constant. Compare temperature, top-k, and top-p settings that produce similar-looking text but preserve different candidate sets.

### 2. The best next token may not begin the best whole sequence

**Thesis:** Greedy decoding makes the strongest local choice, but a series of local choices is not guaranteed to be the most probable complete continuation.

**What this lesson contains:**

- Greedy decoding selects the highest-probability token at every step.
- Sequence probability depends on every conditional probability along the path.
- A second-ranked first token can lead to a stronger sequence overall.
- Search methods such as beam search explore more than one partial sequence.

**Future GUI:** Compare a greedy path with a small beam-search tree. Display each branch's cumulative score and highlight where the globally stronger path first differs from the greedy path.

**Experiment:** Find a prompt where the greedy first token loses to another branch after several steps.

### 3. Sequence probability shrinks as text gets longer

**Thesis:** Log probabilities add across tokens, so exact long sequences become improbable even when each individual token is plausible.

**What this lesson contains:**

- Multiplying many token probabilities quickly creates tiny numbers.
- Adding log probabilities is a practical way to score a sequence.
- Raw sequence scores favor shorter text unless length is handled explicitly.
- Two sequence scores are not fairly comparable when their lengths differ greatly.

**Future GUI:** Add cumulative log probability to every branch and a chart showing how it changes token by token. Offer raw and length-normalized comparisons with plain-language labels.

**Experiment:** Compare a short completion and a longer completion before and after length normalization.

### 4. Uncertainty is not factual confidence

**Thesis:** A sharply peaked next-token distribution does not prove that the answer is correct or that the model is well calibrated.

**What this lesson contains:**

- Entropy describes how spread out the next-token distribution is.
- Low entropy can mean the wording is predictable, even when the claim is false.
- Calibration asks whether stated confidence matches observed correctness across many examples.
- Token probability and answer-level confidence are different quantities.

**Future GUI:** Pair an entropy display with a small labeled question set. Separate next-token concentration from measured answer accuracy so the two cannot be mistaken for each other.

**Experiment:** Compare the model's distribution after a familiar true statement and a familiar false statement with similarly predictable wording.

## Phase 3: Chat and post-training

These lessons reveal what chat software adds around the same token-prediction mechanism.

### 5. A chat conversation becomes one token sequence

**Thesis:** Chat roles and message bubbles are converted into serialized text and special tokens before inference.

**What this lesson contains:**

- A chat template turns structured messages such as `system`, `user`, and `assistant` into model input.
- Role markers, separators, begin/end markers, and generation prompts are tokens or text in the sequence.
- Different model families use different templates.
- Sending the wrong template can sharply reduce an otherwise capable model's performance.

**Future GUI:** Provide synchronized views for chat bubbles, the rendered template, token boundaries, and token IDs. Selecting an item in one view should highlight its representation in the others.

**Experiment:** Render the same messages with two templates, then run a model with its expected template and an incompatible one.

### 6. Special tokens are learned markers, not magic commands

**Thesis:** A special token matters because training taught the model patterns around it, not because the token inherently understands roles or actions.

**What this lesson contains:**

- Tokenizers reserve IDs for boundaries, roles, tools, and control markers.
- The model learns statistical behavior around those IDs during training.
- A marker can be meaningful to one model and unknown or ordinary to another.
- Some markers are consumed by host software as well as predicted by the model.

**Future GUI:** Add a token inspector that distinguishes ordinary pieces, reserved tokens, and host-interpreted markers. Show vocabulary metadata and where each marker entered the serialized prompt.

**Experiment:** Remove or replace one role marker and inspect how the next-token distribution changes.

### 7. Instruction tuning changes behavior, not the generation mechanism

**Thesis:** A base model continues text; an instruction-tuned model has been trained so requests are often followed by useful responses, but both still predict the next token.

**What this lesson contains:**

- Pretraining teaches broad continuation patterns.
- Supervised examples and preference training reshape which continuations are likely.
- Instruction tuning does not replace autoregressive generation with a separate question-answering engine.
- Base and instruct models should be compared within the same model family when possible.

**Future GUI:** Place a base model and its instruct sibling side by side. Show identical raw prompts, serialized chat prompts, and next-token distributions rather than comparing only final prose.

**Experiment:** Give both models an instruction, a document fragment, and a role-formatted chat. Compare which behavior each context makes likely.

### 8. A system prompt is context, not a higher law

**Thesis:** System instructions are privileged by the chat format and training, but they still reach the model as conditioning tokens.

**What this lesson contains:**

- The host places system content in a template-defined position.
- Post-training teaches the model to treat that position differently.
- Conflicting later text can still influence the distribution.
- Application code, permissions, and validation must enforce real security boundaries.

**Future GUI:** Show message priority in the chat view beside the actual serialized order. Let learners introduce conflicting instructions and inspect where probabilities shift.

**Experiment:** Compare the same instruction as a system message, user message, and plain raw prefix.

### 9. Context changes the current prediction; it does not retrain the model

**Thesis:** Information supplied in a prompt can guide this response without becoming permanent knowledge in the model's weights.

**What this lesson contains:**

- In-context learning changes predictions through the current token sequence.
- Weight updates happen during training or fine-tuning, not ordinary generation.
- Starting a fresh context normally removes the temporary information.
- Retrieval systems repeatedly place external information into context rather than teaching it permanently.

**Future GUI:** Run the same question before, during, and after a temporary context containing a made-up fact. Include a visible context-window meter and a reset action.

**Experiment:** Teach a fictional mapping in one conversation, verify that the model follows it, then start a clean context and ask again.

## Phase 4: Constraints, structured outputs, and tools

These lessons should use llama.cpp-style grammars and local fake tools so every step stays inspectable and no external service is required.

### 10. A grammar can make invalid tokens impossible

**Thesis:** Grammar-constrained decoding masks choices that would break a formal language before the sampler makes its pick.

**What this lesson contains:**

- The model still produces scores for possible next tokens.
- The grammar engine tracks which text prefixes remain valid.
- Invalid candidates are removed or assigned no sampling probability.
- Valid syntax does not guarantee a sensible or truthful value.

**Future GUI:** Show raw model probabilities beside the grammar-allowed distribution. Mark rejected tokens and display the grammar state that accepted or rejected each candidate.

**Experiment:** Generate a small object with and without a grammar, then compare how punctuation and field-name choices are constrained.

### 11. Structured output guarantees shape, not meaning

**Thesis:** A JSON schema or grammar can enforce output structure, but it cannot guarantee that the values are correct.

**What this lesson contains:**

- Structured-output systems translate a schema into decoding constraints or validation rules.
- Required fields, data types, enums, and nesting can be enforced.
- Semantic relationships and factual claims may still be wrong.
- Validation and retry behavior belong partly to the surrounding application.

**Future GUI:** Display a schema, its generated grammar, the allowed token set, and the parsed result in linked panes. Include separate syntax-valid and meaning-valid indicators.

**Experiment:** Require a valid weather report object, then observe that impossible temperatures can still fit the schema.

### 12. Function calling is structured token generation

**Thesis:** The model proposes a function name and arguments as tokens; host software decides whether and how to execute them.

**What this lesson contains:**

- Tool definitions are serialized into the model's context.
- The model emits a formatted tool request or special tool-call tokens.
- The application parses and validates the request.
- The model itself does not access the network, database, calculator, or filesystem.

**Future GUI:** Use a fake weather tool and a deterministic calculator. Show the tool definition, serialized prompt, token-by-token call, parsed arguments, validation result, and host execution as distinct stages.

**Experiment:** Change a tool description and inspect how the model's choice of tool or arguments changes.

### 13. A tool loop alternates between generation and software

**Thesis:** An agentic tool call is a loop in which model output causes software to act, and the result is then added to the next model context.

**What this lesson contains:**

- The model proposes an action.
- Host code checks permissions and executes an implementation.
- The tool result becomes another serialized message.
- The model generates a user-facing continuation from that new context.
- Multiple calls require explicit stopping rules, error handling, and limits.

**Future GUI:** Build a timeline with separate model and host lanes. Every transition should reveal the exact messages and tokens added to context.

**Experiment:** Run one successful call, one validation failure, and one tool error to compare how the loop recovers.

### 14. Constrained output changes sampling, not understanding

**Thesis:** Grammars and tool schemas can steer a model into valid forms even when the model has a weak understanding of the requested task.

**What this lesson contains:**

- Constraints redistribute probability over the remaining valid candidates.
- A model can produce syntactically perfect nonsense.
- Stronger models may assign better raw probabilities before constraints are applied.
- Output reliability combines model behavior, constraints, validation, and application logic.

**Future GUI:** Compare a tiny and a larger model under the same schema. Preserve both the raw and constrained distributions so valid formatting is not mistaken for equal understanding.

**Experiment:** Ask both models for the same structured result and compare validity, values, and pre-constraint probabilities.

## Phase 5: Behavior and interpretation

These topics need careful wording because the GUI can show evidence about output behavior without proving a complete theory of what happens internally.

### 15. Reasoning traces are generated tokens too

**Thesis:** Intermediate reasoning text can support useful computation, but fluent reasoning is not proof of human-like thought or a faithful report of hidden processing.

**What this lesson contains:**

- Reasoning tokens become context for later tokens.
- More intermediate steps can help on some tasks and hurt on others.
- A plausible explanation can be produced after an answer for the wrong reason.
- Observable text should not be treated as direct access to internal cognition.

**Future GUI:** Compare direct answers, visible scratch work, and hidden scratch-work conditions on small deterministic tasks. Score answers separately from explanations.

**Experiment:** Hold the final answer task constant while changing whether intermediate tokens are generated and fed back into context.

### 16. A model reflects many training and post-training influences

**Thesis:** Calling an LLM "the average data annotator" is a useful provocation, but not a literal description of where its answers come from.

**What this lesson contains:**

- Pretraining data, synthetic data, supervised demonstrations, preference judgments, and reward signals all shape behavior.
- System prompts and decoding settings add influences at inference time.
- No single source cleanly explains every output.
- Model behavior can be studied without pretending the training mixture is fully visible.

**Future GUI:** Compare checkpoints or paired base/instruct models with a provenance diagram showing known stages. Avoid claiming exact causal attribution that the artifacts cannot support.

**Experiment:** Track how one prompt's candidate distribution changes from a base checkpoint to an instruction-tuned checkpoint.

### 17. Training frequency is not copied directly into output probability

**Thesis:** Common patterns matter, but next-token probability is not a simple lookup table of how often a token appeared in training.

**What this lesson contains:**

- The current context strongly changes the relevant distribution.
- Tokenization splits surface forms in uneven ways.
- Model capacity and learned representations allow generalization.
- Post-training can raise rare helpful behaviors and suppress common unwanted ones.

**Future GUI:** Use controlled miniature models or a documented toy corpus where training counts are known. Compare corpus frequency with context-dependent predictions.

**Experiment:** Give two contexts with the same final word and show that the next-token distribution differs despite identical global token counts.

### 18. Novel sequences can come from learned structure

**Thesis:** A model can assemble an unseen sequence from known patterns, but it does not independently verify that the result is new, useful, or true.

**What this lesson contains:**

- Exact output novelty is different from conceptual novelty.
- Statistical generation can recombine learned structures in useful ways.
- Lower probability is not a one-dimensional measure of creativity or quality.
- Claims such as "the new was never in the dataset" are evocative but too absolute.

**Future GUI:** Use a transparent toy training corpus so exact seen and unseen sequences can be identified. Keep human judgments of usefulness separate from model probability.

**Experiment:** Generate sequences absent from the toy corpus and trace which shorter patterns support them.

### 19. More randomness is not a fair trade between worse and better ideas

**Thesis:** Higher-temperature output is not a symmetric coin toss between above-average and below-average quality.

**What this lesson contains:**

- Quality has many dimensions and no single statistical center.
- Lower-probability text includes both useful surprises and rapidly growing failure modes.
- Model probability and human preference are separate measurements.
- A bell curve of answer quality would imply symmetry and a scalar axis that the data does not justify.

**Future GUI:** Collect repeated samples from one node and let human labels be added afterward. Plot probability separately from labels such as factual, useful, surprising, or coherent.

**Experiment:** Sample many continuations across temperatures and compare failure rates without treating one subjective score as ground truth.

## Later research views, not yet lesson commitments

These ideas appeared in the original scope discussion but should not be promised as straightforward lessons until the project has a defensible visualization and evidence model:

- Attention-head and neuron visualizations.
- Claims about where or whether reasoning occurs internally.
- Automatic judgments of creativity, intelligence, novelty, or answer quality.
- Comparisons across many unrelated model families at once.
- A literal bell curve of answer quality.
- Real external tool execution with credentials, network access, or side effects.

## Suggested build order

1. Add top-k, top-p, cumulative log probability, entropy, and branch comparison to the existing analysis board.
2. Build a separate chat serialization lab with raw messages, rendered templates, special tokens, and a base/instruct comparison.
3. Build a constraints lab that shows raw logits, grammar masks, schema validation, and parsed output.
4. Build a tool-calling timeline using only deterministic local tools.
5. Add behavior and interpretation lessons only where the application can clearly separate observation from speculation.