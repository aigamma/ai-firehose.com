# Observability

How AI Firehose reports into the fleet observability spine: one centralized
OpenTelemetry collector (Grafana Alloy on Fly) that every property ships metrics,
traces, logs, and browser RUM to, forwarding to Grafana Cloud. The collector,
runbook, dashboards, and per-runtime onboarding recipes live in a separate repo,
`observability` (github.com/aigamma/observability). This doc covers the
ai-firehose side: what is instrumented, how to turn it on, and the contracts.

The headline is LLM cost and token observability: the worker classifies every
item (Haiku), writes the briefing and glossary (Opus), and embeds and reranks
(Voyage), so it is a real cost center. Until now the worker discarded the token
usage every Anthropic and Voyage response returns. It no longer does.

## The contract: fail-open and env-gated

All instrumentation is a complete no-op unless `OTEL_EXPORTER_OTLP_ENDPOINT` is
set. With no endpoint there is no `fetch`, no allocation, no overhead, and no
behavior change, so it ships to production dormant and the test suite (which mocks
global `fetch` and would notice an extra call) is unaffected. Telemetry must never
break or slow a run; every emit is fire-and-forget with errors swallowed.

Enable it by setting, for the worker (Fly secret or the GitHub Actions ingest
env):

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://fleet-otel-collector.fly.dev
OTEL_SERVICE_NAME=ai-firehose-worker
DEPLOY_ENV=prod
```

## The worker emitter (`worker/lib/otel.mjs`)

The worker ships with zero npm runtime dependencies (see `worker/Dockerfile`:
Node built-ins plus global `fetch`). Rather than pull in an OpenTelemetry SDK,
`worker/lib/otel.mjs` hand-rolls the OTLP/HTTP JSON wire format over `fetch`. OTLP
is just HTTP and JSON, which keeps the zero-dependency design intact and is the
whole lesson. It uses `node:crypto` for span ids.

It exposes:

- `recordLlm({ system, model, operation, inputTokens, outputTokens, startMs, ok })`:
  emits a gen_ai client span (OpenTelemetry GenAI semantic conventions) carrying
  token usage, plus monotonic counters for cost, input tokens, output tokens, and
  call count. No prompt or completion text is ever attached; the collector also
  redacts as defense in depth.
- `costUsd(model, inputTokens, outputTokens)`: the pure cost function, exported
  for unit testing. The price map in this file is the single source of truth for
  $/1,000 tokens; embedding and rerank models bill input only.
- `flushTelemetry()`: awaits in-flight emits. Called explicitly at the end of
  `worker/pipeline/run.mjs` `main()`, with a `beforeExit` safety net.

### Instrumented call sites

- `worker/lib/anthropic.mjs` `call()`: the single chokepoint for both
  `structured()` and `complete()`. Captures `response.usage.{input,output}_tokens`
  and `response.model`. `structured`/`complete` accept an optional `operation`
  label (default `structured`/`complete`); pass a specific one from a stage for a
  richer cost breakdown (for example `operation: "classify"`).
- `worker/lib/voyage.mjs` `post()`: the chokepoint for `embed()` and `rerank()`.
  Captures `response.usage.total_tokens` as input tokens; operation is the API
  path (`embeddings` or `rerank`).

### Metrics emitted (Prometheus names after OTLP ingest)

- `gen_ai_cost_usd_total` (USD), labels: model, operation, service, environment.
- `gen_ai_usage_input_tokens_total`, `gen_ai_usage_output_tokens_total`.
- `gen_ai_calls_total`.

The dashboards in the `observability` repo (`dashboards/llm-cost.json`) read these.

## Verifying

With the collector live, emit a real call and read it back from the collector:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://fleet-otel-collector.fly.dev \
OTEL_SERVICE_NAME=ai-firehose-worker DEPLOY_ENV=prod \
node --input-type=module -e 'import("./worker/lib/otel.mjs").then(async m => { \
  m.recordLlm({ system:"anthropic", model:"claude-haiku-4-5-20251001", \
    operation:"classify", inputTokens:1234, outputTokens:567, \
    startMs: Date.now()-1500, ok:false }); await m.flushTelemetry(); })'
fly logs -a fleet-otel-collector
```

The span and `gen_ai.cost.usd` metric appear in the collector's debug output. Use
`ok:false` so the error trace is always retained by the collector's tail sampling
(a normal trace is only 20% sampled).

## Gotchas (learned bringing this up)

- The worker discarded `response.usage` at both `call()` and `post()`. The usage
  is on every response; the fix is to read it at the chokepoint, not to add a new
  pass.
- A reused trace id is dropped by tail sampling, which caches one decision per
  trace id. Generate a fresh span/trace id per emit. This bit the verification
  helper before the worker.
- The fail-open gate is what keeps `worker/lib/anthropic.test.mjs` green: those
  tests mock global `fetch`, so any extra collector `fetch` would corrupt them.
  Disabled-means-no-fetch is a hard contract, covered by a test in
  `worker/lib/otel.test.mjs`.

## Not yet wired (follow-ups)

- Browser RUM via Grafana Faro in `src/main.jsx` (web vitals, JS errors, and
  traceparent linking to the backend span of the same request).
- The `netlify/functions/retrieve.mjs` read path (the live search proxy).
- Richer `operation` labels threaded from each worker stage (classify, briefing,
  glossary, cluster naming) for a per-operation cost breakdown.
- Capturing Anthropic `cache_read_input_tokens` to visualize prompt-cache savings.
- The collector's incoming-ingest bearer auth (a hardening step; see the
  `observability` repo runbook).
