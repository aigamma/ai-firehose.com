/*
  AI-discourse concept axes. Each pole is a short anchor that embeds the concept
  and concrete examples (the civil pole-writing pattern). The slugs match
  src/data/registry.js AXES. precompute computes axis_vector = normalize(embed(
  pole_a) - embed(pole_b)) and projects each concept centroid onto it.
*/
export const AXES_ANCHORS = [
  {
    slug: "open-closed",
    title: "Open Weights vs Closed and Proprietary",
    pole_a: { label: "Open weights", anchor: "Open weight and open source AI: releasing model weights publicly, permissive licenses, local and self-hosted inference, community fine-tuning, Llama, Mistral, Qwen, and the open model ecosystem." },
    pole_b: { label: "Closed and proprietary", anchor: "Closed, proprietary, API-only AI: frontier models served behind paid APIs, undisclosed weights and training data, commercial moats, the closed offerings of OpenAI, Anthropic, and Google." },
  },
  {
    slug: "scaling-efficiency",
    title: "Scaling and More Compute vs Efficiency and Small Models",
    pole_a: { label: "Scaling and more compute", anchor: "Scaling laws and brute compute: ever larger models, huge pretraining runs, massive GPU clusters, the bigger is better thesis, frontier training budgets." },
    pole_b: { label: "Efficiency and small models", anchor: "Efficiency and small models: distillation, quantization, small language models, on-device inference, doing more with less compute, parameter and inference efficiency." },
  },
  {
    slug: "capability-safety",
    title: "Capabilities vs Safety and Alignment",
    pole_a: { label: "Capabilities", anchor: "Raw capability and frontier performance: pushing benchmarks, new abilities, acceleration, shipping more powerful models faster." },
    pole_b: { label: "Safety and alignment", anchor: "Safety, alignment, and governance: interpretability, evaluations, red teaming, alignment research, AI risk, responsible release, and oversight." },
  },
  {
    slug: "research-product",
    title: "Research and Theory vs Product and Applied",
    pole_a: { label: "Research and theory", anchor: "Research and theory: papers, novel architectures, training methods, theoretical results, academic and lab research contributions." },
    pole_b: { label: "Product and applied", anchor: "Product and applied AI: shipping features, developer tools, real applications, monetization, integrations, and practical build tutorials." },
  },
  {
    slug: "agents-assistive",
    title: "Autonomy and Agents vs Assistive and Copilot",
    pole_a: { label: "Autonomy and agents", anchor: "Autonomous agents: multi-step tool use, agentic workflows, planning, self-directed task completion, agent orchestration and harnesses." },
    pole_b: { label: "Assistive and copilot", anchor: "Assistive copilots: human in the loop, suggestions and autocomplete, chat assistants, augmentation rather than autonomy." },
  },
  {
    slug: "neural-symbolic",
    title: "End-to-End Neural vs Structured, Symbolic, and Tool-Use",
    pole_a: { label: "End-to-end neural", anchor: "End to end neural learning: large neural networks, learned representations, gradient descent, scaling data and parameters, minimal hand engineering." },
    pole_b: { label: "Structured and tool-use", anchor: "Structured, symbolic, and tool augmented systems: retrieval, knowledge graphs, program synthesis, verifiers, external tools, and explicit reasoning structure." },
  },
  {
    slug: "central-local",
    title: "Frontier Labs and Centralized vs Local and Community",
    pole_a: { label: "Frontier labs and centralized", anchor: "Centralized frontier labs: a few large companies with massive compute and data, cloud hosted models, concentrated capability." },
    pole_b: { label: "Local and community", anchor: "Local and community AI: hobbyists, open communities, running models on personal hardware, decentralized contributions, the r/LocalLLaMA spirit." },
  },
];
