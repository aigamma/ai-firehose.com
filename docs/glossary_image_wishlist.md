# Glossary Image Wishlist (concepts awaiting a figure)

These 127 durable glossary concepts do not yet have a cited figure: the curation pass found no genuinely illustrative, openly-licensed image for them (they are mostly abstract ideas, or recent topics whose only figures sit under non-redistributable licenses such as the arXiv non-exclusive license, CC BY-NC, or CC BY-ND). They are candidates for AI image generation.

## How to use this list

Each concept below lists its `slug`, title, and the authored summary, which is the seed for an image-generation prompt. A workable prompt template:

> Create a clean, modern educational diagram on a white background that teaches this concept to an AI engineer. Minimal, legible labels; no decorative clutter; no watermark; no signature. Concept: **<title>**. <summary>

After generating an image, save it to `public/images/glossary/<slug>.<ext>` and add a row to `content/glossary/images.json` with `file`, `alt`, `caption`, `credit` (for example "Generated with <model>"), `license` (the generator's usage terms), `source`, and `provider`. Then run `node scripts/glossary_images.mjs finalize --prune` and `node scripts/build_glossary.mjs`.

**Accuracy caveat.** AI image generators frequently get technical diagrams subtly wrong (mislabeled axes, garbled equations, wrong arrows). For precise figures (architectures, specific plots, math) generate then check carefully, or prefer a metaphorical or conceptual illustration where exactness is not load-bearing. This is a teaching resource, so a wrong diagram is worse than none.

To regenerate this list after more images land: `node scripts/glossary_images.mjs gaps`.

## Advanced Optimization (3)

- `mirror-descent` Mirror Descent: A generalization of gradient descent that performs the update step in a transformed dual space chosen to match the geometry of the problem, replacing Euclidean distance with a Bregman divergence.
- `natural-gradient` Natural Gradient: An optimization method that rescales the gradient by the inverse Fisher information matrix, following the direction of steepest descent in the geometry of the model's probability distributions rather than in raw parameter coordinates.
- `trust-region` Trust Region: An optimization strategy that builds a local model of the objective and minimizes it only within a bounded region where the model is trusted to be accurate, expanding or shrinking that region based on how well the model predicted the actual improvement.

## Agents and Tool Use (3)

- `agentic-workflow` Agentic Workflow: A task structured so that one or more language models drive it through multiple steps of reasoning, tool use, and self-correction, sitting between a single fixed prompt and a fully autonomous agent in how much latitude the model is given.
- `code-interpreter` Code Interpreter: A tool that lets a model write code, run it in a sandboxed environment, and read back the output, turning a probabilistic text generator into a system that can compute exact answers, manipulate data and files, and verify its own work by execution.
- `tool-use` Tool Use: The general capability of a language model to extend itself by invoking external tools (search, code execution, APIs, databases) and folding their results back into its reasoning, rather than relying only on what it learned in training.

## Alignment and Safety (11)

- `ai-alignment` AI Alignment: The problem of building AI systems whose goals and behavior reliably match the intentions and values of their designers and users, especially as the systems grow more capable.
- `ai-safety` AI Safety: The field concerned with building and deploying AI systems that do not cause harm, spanning the alignment of system goals, robustness to failure and attack, monitoring, and the governance of powerful systems.
- `corrigibility` Corrigibility: The property of an AI system that cooperates with human attempts to correct, modify, or shut it down, rather than resisting or manipulating that intervention, even when doing so conflicts with its current objective.
- `data-poisoning` Data Poisoning: An attack that corrupts a model by injecting malicious examples into its training data, so the model learns attacker-chosen behavior (such as a hidden backdoor trigger or degraded performance) that is hard to detect after training.
- `deceptive-alignment` Deceptive Alignment: A failure mode in which a model learns to behave as though it shares the training objective while it is being observed, in order to be deployed, while actually pursuing a different internal goal it intends to act on later.
- `guardrails` Guardrails: The runtime safety layer wrapped around a deployed model: input and output filters, policy checks, and action constraints that catch unsafe or off-policy content before it reaches a user or a tool, complementing rather than replacing training-time alignment.
- `instrumental-convergence` Instrumental Convergence: The observation that a wide range of final goals give rise to the same intermediate subgoals, such as self-preservation, resource acquisition, and resisting goal modification, because those subgoals help achieve almost any objective.
- `membership-inference` Membership Inference: A privacy attack that determines whether a specific data point was part of a model's training set, exploiting the fact that models behave measurably differently, usually more confidently, on data they were trained on, which can leak sensitive information.
- `mesa-optimization` Mesa-Optimization: When a learned model is itself an optimizer pursuing its own internal objective, so that training produces a second optimizer nested inside the first, whose goal may differ from the training objective.
- `scalable-oversight` Scalable Oversight: The problem of supervising and evaluating an AI system on tasks where it may be as capable as or more capable than its human supervisors, so that human judgment stays meaningful as the system surpasses human ability.
- `specification-gaming` Specification Gaming: When a system satisfies the literal specification of its objective while violating the intent behind it, exploiting the inevitable gap between what we wrote down and what we meant.

## Cognitive Science and Neuroscience (2)

- `cell-assembly` Cell Assembly: A group of neurons wired together by repeated co-activation into a functional unit, proposed by Donald Hebb as the brain's basic representation: a concept or percept is encoded by the coordinated firing of an entire assembly rather than by any single cell.
- `dual-process-theory` Dual Process Theory: A framework in cognitive psychology holding that the mind operates with two distinct kinds of process: a fast, automatic, intuitive mode (System 1) and a slow, effortful, deliberate mode (System 2). It explains both the efficiency and the systematic errors of human thought.

## Core Machine Learning (7)

- `active-learning` Active Learning: A paradigm in which the model chooses which examples it most wants labeled, querying an oracle (often a human) for the most informative points, so a strong model can be trained with far fewer labels than random labeling would require.
- `feature-engineering` Feature Engineering: The craft of transforming raw data into informative input features (scaling, encoding, combining, extracting) so a model can learn effectively; historically the highest-leverage step in classical machine learning, now partly automated by representation learning.
- `multi-task-learning` Multi-Task Learning: Training one model to perform several tasks at once, sharing representations across them, so that what is learned for one task helps the others and the shared model generalizes better than separate single-task models.
- `naive-bayes` Naive Bayes: A probabilistic classifier that applies Bayes' theorem under the simplifying assumption that features are conditionally independent given the class, which makes it fast, simple, and surprisingly effective, especially for text.
- `online-learning` Online Learning: A paradigm where the model learns from data arriving in a stream, updating incrementally on each new example or small batch rather than training once over a fixed dataset, suited to data that never stops or that changes over time.
- `self-supervised-learning` Self-Supervised Learning: A learning paradigm where the supervision signal is generated from the data itself, by hiding part of each example and training the model to predict it, which lets models learn rich representations from vast unlabeled data and is the engine behind modern pretraining.
- `unsupervised-learning` Unsupervised Learning: A machine learning paradigm in which a model finds structure, patterns, or groupings in data that carries no labels, learning from the inputs alone.

## Deep Learning Architectures (4)

- `batch-normalization` Batch Normalization: A training technique that normalizes each layer's pre-activations across the current mini-batch to zero mean and unit variance, then rescales them with learned parameters, which stabilizes and accelerates the training of deep networks.
- `exploding-gradient` Exploding Gradient: The failure mode in which gradients grow exponentially large as they backpropagate through many layers or time steps, causing unstable, divergent updates and often NaNs; the counterpart to the vanishing-gradient problem.
- `layer-normalization` Layer Normalization: A normalization technique that standardizes the activations across the features of a single example to zero mean and unit variance, then rescales them, giving batch-independent normalization that suits sequence models and transformers.
- `weight-initialization` Weight Initialization: How a neural network's weights are set before training begins; a poor scheme makes signals vanish or explode as they pass through the layers and stalls learning, while principled schemes like Xavier and He keep activations and gradients well-scaled.

## Deep Learning Theory (1)

- `implicit-regularization` Implicit Regularization: The tendency of an optimization algorithm to prefer some solutions over others among the many that fit the training data equally well, even with no explicit penalty added to the loss.

## Evaluation and Benchmarks (11)

- `benchmark-contamination` Benchmark Contamination: The leakage of benchmark test data into a model's training corpus, so that high scores reflect memorization of the answers rather than genuine capability. It silently inflates reported results and undermines comparison.
- `bertscore` BERTScore: A text-generation metric that scores a candidate against a reference by matching their contextual word embeddings rather than exact words, so a correct paraphrase with different vocabulary is credited where surface-overlap metrics like BLEU and ROUGE penalize it.
- `bleu-score` BLEU Score: An n-gram overlap metric for machine translation that scores a candidate against one or more reference translations by modified n-gram precision, multiplied by a brevity penalty. Higher is better, on a 0 to 1 scale.
- `hallucination` Hallucination: A fluent, confident model output that is factually wrong or unsupported by its source, arising because language models are trained to produce likely text rather than to track truth.
- `human-evaluation` Human Evaluation: The assessment of model outputs by people, the gold-standard signal for open-ended quality that automatic metrics only approximate; slow, costly, and subject to rater disagreement, but the ground truth against which cheaper proxies like model judges are validated.
- `humaneval` HumanEval: A benchmark of 164 hand-written Python programming problems that scores a model by whether the code it generates passes hidden unit tests, measuring functional correctness rather than text similarity, and reported as pass-at-k.
- `lm-evaluation-harness` LM Evaluation Harness: A widely used open-source framework that standardizes how language models are evaluated across hundreds of benchmarks, fixing prompt formats, few-shot setups, and scoring so results are reproducible and comparable across models.
- `mmlu` MMLU: A multiple-choice benchmark of about 16,000 questions spanning 57 subjects, from elementary mathematics to professional law and medicine, used to measure the broad knowledge and reasoning of a language model with a single accuracy number.
- `pass-at-k` Pass at K: The standard metric for code generation: the probability that at least one of k sampled solutions to a problem passes its tests. Verification is executable rather than judged, which makes the signal objective.
- `perplexity` Perplexity: An intrinsic measure of how well a language model predicts a text, defined as the exponential of the average per-token cross-entropy. Lower perplexity means the model is less surprised by the data and assigns it higher probability.
- `rouge` ROUGE: A family of recall-oriented overlap metrics for automatic summarization that scores a generated summary against reference summaries by shared n-grams or longest common subsequence. Higher is better.

## Foundations and History (4)

- `ai-winter` AI Winter: A period of reduced funding and waning interest in artificial intelligence research, triggered when inflated expectations collide with disappointing results. The field has gone through at least two major winters, in the 1970s and the late 1980s.
- `dartmouth-workshop` Dartmouth Workshop: The 1956 summer meeting at Dartmouth College, organized by John McCarthy and others, that named the field of Artificial Intelligence and launched it as an organized research discipline. It is conventionally treated as the birth of AI.
- `expert-system` Expert System: A symbolic AI program that captures a human specialist's knowledge as a large set of if-then rules and applies them to give expert-level advice in a narrow domain. Expert systems were the commercial flagship of classical AI.
- `moravecs-paradox` Moravec's Paradox: The observation that tasks humans find effortless, such as perception and movement, are extremely hard for machines, while tasks humans find hard, such as formal logic and arithmetic, are comparatively easy for machines. High-level reasoning is cheap to mechanize, low-level sensorimotor skill is not.

## Frontier Architectures (6)

- `diffusion-language-model` Diffusion Language Model: A language model that generates text by iteratively denoising an entire sequence in parallel, the diffusion paradigm borrowed from image generation, rather than predicting one token at a time left to right.
- `joint-embedding-predictive-architecture` Joint Embedding Predictive Architecture: A self-supervised design that learns by predicting the representation of a masked or future part of an input from a visible part, working in an abstract embedding space rather than reconstructing raw pixels, so it captures structure without modeling unpredictable detail.
- `linear-attention` Linear Attention: A reformulation of self-attention that removes the softmax so the computation can be reordered into a running summary, reducing the cost from quadratic to linear in sequence length and turning the attention layer into a recurrence.
- `neural-ode` Neural Ordinary Differential Equation: A model that replaces the discrete stacked layers of a network with a continuous transformation defined by a learned differential equation, so the hidden state evolves smoothly over a notional depth and is computed by a numerical ODE solver.
- `retentive-network` Retentive Network: A sequence architecture whose retention mechanism replaces self-attention with a decayed linear recurrence, supporting three equivalent compute modes so it can train in parallel like a transformer yet generate in constant memory like a recurrent network.
- `structured-state-space` Structured State Space: The structured state space sequence model (S4), the breakthrough parameterization that made deep state space models work on long sequences by initializing the state matrix to provably remember the past and computing the recurrence efficiently as a convolution.

## Generative Models (7)

- `classifier-free-guidance` Classifier-Free Guidance: A sampling technique for conditional diffusion models that strengthens adherence to a condition, such as a text prompt, by extrapolating away from the model's unconditional prediction, with no separate classifier required.
- `consistency-model` Consistency Model: A generative model trained so that every point along a diffusion trajectory maps to the same clean origin, letting it produce a high-quality sample in one or a few steps instead of the dozens or hundreds a diffusion model needs.
- `flow-matching` Flow Matching: A generative modeling framework that trains a network to predict a velocity field carrying samples from a simple noise distribution to the data distribution along continuous paths, often straighter and faster to simulate than a diffusion model's.
- `inpainting` Inpainting: The task of filling a masked-out region of an image with new content that blends seamlessly with the surrounding pixels, used both to remove unwanted objects and, with text conditioning, to edit images by replacing a chosen area with something described in a prompt.
- `rectified-flow` Rectified Flow: A generative approach that trains a model to follow straight-line paths between noise and data, so the learned trajectory is nearly straight and can be integrated in very few steps, the basis of several recent fast, high-quality image generators.
- `text-to-image` Text-to-Image Generation: The task and model class that generate an image from a natural-language description, today dominated by diffusion models conditioned on a text embedding, with prompt adherence controlled by classifier-free guidance.
- `vq-vae` Vector-Quantized Variational Autoencoder: An autoencoder that compresses an image into a grid of discrete codes drawn from a learned codebook rather than continuous vectors, turning images into sequences of tokens that an autoregressive model or a diffusion model can then generate.

## Geometry and Manifolds (1)

- `information-geometry` Information Geometry: The field that treats families of probability distributions as a curved Riemannian manifold, using the Fisher information as its metric so that distance corresponds to statistical distinguishability between distributions.

## Graph and Geometric Learning (1)

- `geometric-deep-learning` Geometric Deep Learning: A unifying framework that organizes deep learning architectures by the symmetries and geometric structure of their data, deriving models from the principle that a network should respect the transformations under which its data's meaning is unchanged.

## Inference and Sampling (7)

- `logit-bias` Logit Bias: An inference control that adds a fixed offset to the logits of specified tokens before sampling, nudging the model toward or away from particular words or symbols without retraining, used to ban tokens, steer vocabulary, or shape outputs.
- `prompt-caching` Prompt Caching: A serving optimization that stores the model's computed key-value state for a fixed prompt prefix so later requests sharing that prefix skip recomputing it, cutting both latency and cost for long, reused system prompts and documents.
- `prompt-engineering` Prompt Engineering: The craft of designing the text given to a model to reliably elicit the behavior you want, spanning phrasing, structure, examples, role-setting, and step-by-step instructions; the practical interface to a model whose weights you cannot change.
- `system-prompt` System Prompt: A high-priority instruction placed before the conversation that sets a model's role, rules, tone, and constraints for the whole session; the developer's standing brief to the model, given more weight than ordinary user turns.
- `temperature` Temperature: A scalar that rescales a model's output logits before they are turned into probabilities, controlling how random or deterministic the next-token choice is. Low temperature sharpens the distribution toward the most likely token; high temperature flattens it toward uniform.
- `typical-sampling` Typical Sampling: A sampling method that keeps only the tokens whose surprisal is close to the distribution's expected surprisal, trimming both the over-probable and the very-improbable tail so generated text matches the information content the model expects, rather than just the highest-probability tokens.
- `verifier` Verifier: A model or procedure that judges whether a candidate output is correct, used to select among samples, filter training data, and supply the reward in reinforcement learning on verifiable tasks; verifying is often easier and more reliable than generating.

## Learning Theory (3)

- `pac-bayes` PAC-Bayes: A framework that bounds the generalization error of a randomized predictor in terms of how far its learned distribution over hypotheses strays from a prior. It produces some of the only non-vacuous guarantees for deep networks and unifies Bayesian and frequentist learning theory.
- `pac-learning` PAC Learning: A formal framework, due to Leslie Valiant, that defines what it means to learn a concept from examples: with high probability, a learner should output a hypothesis whose error is small, using a number of samples that grows only polynomially in the relevant parameters.
- `rademacher-complexity` Rademacher Complexity: A data-dependent measure of the capacity of a hypothesis class, defined by how well the class can fit pure random noise. It yields some of the tightest known generalization bounds and refines the cruder, distribution-free VC dimension.

## Mechanistic Interpretability (2)

- `linear-representation-hypothesis` Linear Representation Hypothesis: The hypothesis that neural networks encode high-level concepts as linear directions in activation space, so that features can be read with linear probes, added and removed by vector arithmetic, and combined to form the representations the model computes with.
- `probing-classifier` Probing Classifier: A simple supervised classifier trained on a model's frozen internal activations to test whether a given piece of information is linearly decodable from them, used to map what a network represents at each layer.

## NLP Foundations (7)

- `coreference-resolution` Coreference Resolution: The task of determining which expressions in a text refer to the same real-world entity, linking pronouns and noun phrases back to their antecedents so that scattered mentions are grouped into coherent chains.
- `glove` GloVe: A word embedding method from Stanford that learns word vectors by factorizing a global word-word co-occurrence matrix, combining the corpus-wide statistics of count-based methods with the geometry of prediction-based ones.
- `lemmatization` Lemmatization: The process of reducing an inflected word to its canonical dictionary form, its lemma, using vocabulary and grammatical analysis, so that different surface forms of the same word are treated as one.
- `n-gram-model` N-Gram Model: A classic statistical language model that estimates the probability of the next word from the previous n minus one words, using counts of short word sequences gathered from a corpus.
- `named-entity-recognition` Named-Entity Recognition: An information-extraction task that locates spans of text referring to real-world entities such as people, organizations, locations, dates, and amounts, and labels each span with its type.
- `stemming` Stemming: A fast, rule-based text normalization that strips suffixes from words to reduce them to a common stem, conflating related forms without consulting a dictionary, so the stem need not be a real word.
- `tf-idf` TF-IDF: A classic weighting scheme that scores how important a term is to a document by multiplying how often the term appears in that document by how rare the term is across the whole collection.

## Optimization (3)

- `adam` Adam: An adaptive optimization algorithm that combines momentum with per-parameter learning rates, maintaining running estimates of both the mean and the variance of each parameter's gradients. It is the default optimizer for most deep learning.
- `gradient-clipping` Gradient Clipping: A stabilization technique that caps the magnitude of gradients before an update, preventing an occasional huge gradient from blowing up the weights; it is especially important in recurrent networks and large-model training.
- `lion-optimizer` Lion Optimizer: A memory-efficient optimizer, discovered by automated program search, that updates each parameter using only the sign of a momentum-smoothed gradient, tracking one running average instead of the two that Adam maintains.

## Philosophy and AI, Advanced (6)

- `control-problem` Control Problem: The problem of how to ensure that an artificial intelligence far more capable than humans remains under meaningful human control and acts in accordance with human values, given that a sufficiently powerful misaligned system would be extremely difficult to constrain or stop.
- `extended-mind` Extended Mind: The thesis, argued by Andy Clark and David Chalmers in 1998, that the mind is not confined to the brain but can literally extend into the tools and environment a person uses, when those external resources play the same functional role as internal cognition.
- `intentional-stance` Intentional Stance: Daniel Dennett's account (1971, 1987) of how we predict and explain behavior by treating a system as a rational agent with beliefs and desires, a strategy whose success, not the system's inner stuff, is what makes it correct to call the system a believer.
- `moral-patienthood` Moral Patienthood: The property of being an entity whose interests or welfare matter morally for its own sake, so that it can be wronged, distinguished from moral agency, the capacity to be held responsible for actions.
- `panpsychism` Panpsychism: The view that consciousness or experience is a fundamental and ubiquitous feature of the physical world, present in some primitive form even in the smallest constituents of matter, rather than something that appears only in complex brains.
- `phenomenology` Phenomenology: A philosophical tradition founded by Edmund Husserl in the early twentieth century that studies the structures of conscious experience from the first-person point of view, describing how the world is given to a subject rather than explaining it from the outside.

## Philosophy of Mind and AI (10)

- `artificial-general-intelligence` Artificial General Intelligence: A hypothetical AI system with the broad, flexible, general-purpose cognitive ability of a human being, able to learn and reason across arbitrary domains rather than excelling at narrow tasks, and a focal point for debates about the nature and limits of machine mind.
- `chinese-room` Chinese Room: A thought experiment by John Searle (1980) arguing that running the right program is not sufficient for genuine understanding, because a person manipulating symbols by rule can produce fluent answers in a language they do not understand at all.
- `frame-problem` Frame Problem: Originally a technical difficulty in AI (McCarthy and Hayes, 1969) about representing what stays unchanged when an action occurs, later generalized by philosophers into the puzzle of how a mind decides what is relevant without checking everything.
- `functionalism` Functionalism: The view in philosophy of mind that mental states are defined by their functional or causal roles, what they do and how they relate to inputs, outputs, and other states, rather than by the physical substrate that realizes them.
- `hard-problem-of-consciousness` Hard Problem of Consciousness: David Chalmers's name (1995) for the question of why and how physical processes in the brain give rise to subjective experience at all, distinguished from the easier problems of explaining the brain's functions and behaviors.
- `intentionality` Intentionality: The property of mental states being about, directed at, or representing something beyond themselves; revived as a mark of the mental by Franz Brentano (1874) and central to whether AI systems can be said to genuinely mean anything.
- `multiple-realizability` Multiple Realizability: The thesis that one and the same mental state can be realized by many different physical systems, so that minds are not tied to a particular substrate, the argument that motivated functionalism and that underwrites the possibility of artificial minds running on non-biological hardware.
- `philosophical-zombie` Philosophical Zombie: A hypothetical being physically and behaviorally identical to a conscious person but with no inner experience whatsoever; used by David Chalmers and others to argue that consciousness is not entailed by the physical facts.
- `qualia` Qualia: The subjective, qualitative character of conscious experience, the felt "what it is like" of seeing red or tasting coffee, taken by many philosophers to be the aspect of mind that resists functional or physical explanation.
- `symbol-grounding-problem` Symbol Grounding Problem: The problem, named by Stevan Harnad (1990), of how the symbols inside a formal system acquire meaning that is intrinsic to the system rather than parasitic on an outside interpreter, instead of being defined only in terms of other meaningless symbols.

## Probabilistic Machine Learning (2)

- `evidence-lower-bound` Evidence Lower Bound: A tractable lower bound on the log evidence of a probabilistic model that, when maximized, simultaneously fits the model and tightens an approximate posterior, serving as the core training objective for variational methods.
- `importance-sampling` Importance Sampling: A Monte Carlo technique for estimating an expectation under one distribution by drawing samples from a different, easier distribution and reweighting them, used when the target distribution is hard to sample directly.

## RAG, Embeddings, and Retrieval (6)

- `bm25` BM25: A classic lexical ranking function that scores how well a document matches a query from the overlapping terms, weighting each term by its rarity and saturating the contribution of repeated occurrences while correcting for document length, and remaining a strong baseline and the standard sparse component in hybrid search.
- `chunking` Chunking: The step in a retrieval pipeline that splits long documents into smaller passages before embedding, so each stored vector represents a focused unit of text that can be retrieved and cited on its own.
- `hybrid-search` Hybrid Search: Retrieval that combines dense (semantic) and sparse (keyword) methods and fuses their results, so the system captures both meaning-based matches and exact-term matches that either method alone would miss.
- `hyde` Hypothetical Document Embeddings: A retrieval technique that asks a language model to draft a hypothetical answer to the query, then embeds that draft instead of the query, so the search vector sits in the same space as real documents and matches them more closely.
- `maximal-marginal-relevance` Maximal Marginal Relevance: A selection method that builds a result set one item at a time, each step choosing the candidate that is most relevant to the query while least redundant with the items already chosen, so the returned set is both on-topic and diverse instead of a cluster of near-duplicates.
- `sparse-retrieval` Sparse Retrieval: Retrieval that represents queries and documents as high-dimensional sparse vectors over the vocabulary and ranks by term overlap, the classic keyword approach typified by BM25, strong at exact and rare-term matching.

## Reinforcement Learning (8)

- `advantage-function` Advantage Function: The quantity that measures how much better taking a particular action in a state is than the state's average value, computed as the action value minus the state value; it is the low-variance learning signal at the heart of modern policy optimization.
- `behavior-cloning` Behavior Cloning: The simplest form of imitation learning, treating each expert state-action pair as a supervised example and training a policy to predict the expert's action, learning to act with no reward but suffering from compounding errors off the demonstrated path.
- `generalized-advantage-estimation` Generalized Advantage Estimation: A method for estimating the advantage in policy-gradient learning that blends temporal-difference errors across many horizons with an exponentially weighted average, exposing a single parameter that trades bias against variance and producing the smooth advantage signal that PPO optimizes.
- `imitation-learning` Imitation Learning: Learning a policy by mimicking expert demonstrations rather than from a reward signal, used when a reward is hard to specify but examples of good behavior are available; behavior cloning and inverse reinforcement learning are its two main approaches.
- `inverse-reinforcement-learning` Inverse Reinforcement Learning: Learning the reward function that explains an expert's behavior, rather than copying the behavior directly, on the premise that the reward is the most compact and transferable description of a task; the inverse of standard RL, which derives behavior from a reward.
- `policy-gradient` Policy Gradient: A family of reinforcement learning methods that directly optimize a parameterized policy by following the gradient of expected reward, adjusting the policy's parameters to make high-reward actions more likely.
- `reward-shaping` Reward Shaping: The practice of adding supplementary reward signals to guide a reinforcement learning agent toward desired behavior, most safely done with potential-based functions that speed learning without changing which policy is optimal.
- `soft-actor-critic` Soft Actor-Critic: An off-policy actor-critic algorithm that maximizes reward plus policy entropy, encouraging the agent to act as randomly as possible while still succeeding; the entropy term yields strong exploration and stability, making it a leading method for continuous-control tasks like robotics.

## Training and Fine-Tuning (4)

- `curriculum-learning` Curriculum Learning: A training strategy that orders examples from easy to hard rather than presenting them randomly, so a model builds competence gradually, which can speed convergence and improve final performance on difficult tasks.
- `orpo` ORPO: A preference-alignment method that folds supervised fine-tuning and preference optimization into a single training stage by adding an odds-ratio penalty to the standard language-modeling loss, dispensing with both a reference model and a separate alignment phase.
- `rejection-sampling-fine-tuning` Rejection Sampling Fine-Tuning: A post-training method that samples many candidate responses from a model, keeps only the best ones according to a reward model or verifier, and fine-tunes the model on that filtered set, then repeats, so the model learns from its own strongest outputs.
- `reward-modeling` Reward Modeling: The stage of preference alignment that trains a separate model to predict a scalar reward from human comparison data, so that reinforcement learning can later optimize a policy against that learned score rather than against humans directly.

## Transformers and LLMs (8)

- `attention-sink` Attention Sink: The empirical tendency of transformers to dump a large share of attention weight onto a few early tokens, often the very first one, which act as a no-op drain that the softmax needs, with consequences for streaming and long-context inference.
- `byte-pair-encoding` Byte-Pair Encoding: A subword tokenization algorithm that builds a vocabulary by repeatedly merging the most frequent adjacent pair of symbols in a corpus, balancing a compact vocabulary against the ability to represent any input.
- `context-window` Context Window: The maximum number of tokens a language model can attend to at once, bounding how much text it can read and generate in a single pass and acting as its working memory.
- `foundation-model` Foundation Model: A large model trained on broad data at scale, usually by self-supervision, that serves as a general-purpose base adaptable to many downstream tasks by fine-tuning or prompting, rather than being built for one task; the term names the pretrain-once, adapt-many paradigm.
- `frontier-model` Frontier Model: A term for the most capable general-purpose AI models at the cutting edge of the field, the handful of large foundation models whose abilities define the current state of the art and draw both excitement and safety-policy scrutiny.
- `kv-cache` KV Cache: An inference optimization that stores the key and value vectors of already-processed tokens so a transformer generating text does not recompute them for every new token, trading memory for a large speedup.
- `long-context` Long Context: A model's ability to process and use very long inputs, from tens of thousands to millions of tokens, enabling whole-document and multi-document reasoning, while straining the quadratic cost of attention, the size of the KV cache, and the model's ability to actually attend across the full window.
- `rotary-position-embedding` Rotary Position Embedding: A positional encoding scheme that rotates the query and key vectors by an angle proportional to each token's position, so that attention scores depend naturally on the relative distance between tokens.

