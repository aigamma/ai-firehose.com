/*
  Zero-dependency OpenTelemetry emitter for the worker.

  The worker ships with no npm runtime dependencies (see worker/Dockerfile: Node
  built-ins plus global fetch), so rather than pull in an OpenTelemetry SDK this
  hand-rolls the OTLP/HTTP JSON wire format over the same fetch the worker already
  uses. OTLP is just HTTP and JSON, which is the whole lesson.

  It is FAIL-OPEN and ENV-GATED: with no OTEL_EXPORTER_OTLP_ENDPOINT set it is a
  complete no-op (no fetch, no allocation, no overhead), so production runs and the
  test suite (which mock global fetch and would notice an extra call) are unaffected
  until the collector endpoint is wired in. It captures the gen_ai.* token usage the
  worker previously discarded, derives a cost, and ships a span plus metrics to the
  fleet collector. No prompt or completion text is ever attached; the collector also
  redacts as defense in depth.

  Collector and runbook: the `observability` repo (github.com/aigamma/observability).
  Subsystem doc: docs/OBSERVABILITY.md.
*/
import { randomBytes } from "node:crypto";

const ENDPOINT = (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "").replace(/\/+$/, "");
const SERVICE = process.env.OTEL_SERVICE_NAME || "ai-firehose-worker";
const ENVIRONMENT = process.env.DEPLOY_ENV || "prod";
const ENABLED = ENDPOINT.length > 0;

// Bearer auth for the hardened fleet collector (it rejects unauthenticated pushes
// with 401). Parse OTEL_EXPORTER_OTLP_HEADERS ("Authorization=Bearer <token>") once.
const HEADERS = (() => {
  const h = { "content-type": "application/json" };
  const raw = process.env.OTEL_EXPORTER_OTLP_HEADERS || "";
  for (const pair of raw.split(",")) {
    const eq = pair.indexOf("=");
    if (eq > 0) h[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  return h;
})();

// USD per 1,000 tokens, [input, output]. The single source of truth for cost.
// Embedding and rerank models bill input only. Keep roughly in step with the
// provider price sheets; an out-of-date entry undercounts but never breaks a run.
const PRICES = {
  "claude-haiku-4-5-20251001": [0.0008, 0.004],
  "claude-sonnet-4-6": [0.003, 0.015],
  "claude-opus-4-8": [0.015, 0.075],
  "voyage-3": [0.00006, 0],
  "rerank-2": [0.00005, 0],
};

// Exported for unit testing: pure, deterministic.
export function costUsd(model, inputTokens = 0, outputTokens = 0) {
  const [pin, pout] = PRICES[model] || [0, 0];
  return (Number(inputTokens) / 1000) * pin + (Number(outputTokens) / 1000) * pout;
}

const pending = new Set();
function send(path, payload) {
  const p = fetch(`${ENDPOINT}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  })
    .then(() => {})
    .catch(() => {}); // fail-open: telemetry must never break or slow a run
  pending.add(p);
  p.finally(() => pending.delete(p));
}

const hex = (n) => randomBytes(n).toString("hex");
const sAttr = (k, v) => ({ key: k, value: { stringValue: String(v) } });
const iAttr = (k, v) => ({ key: k, value: { intValue: String(Math.round(Number(v) || 0)) } });
const resource = () => ({
  attributes: [sAttr("service.name", SERVICE), sAttr("deployment.environment", ENVIRONMENT)],
});

/*
  Record one LLM or embedding call as a gen_ai client span (OpenTelemetry GenAI
  semantic conventions) carrying token usage, plus monotonic counters for cost,
  input/output tokens, and call count. Labels stay low-cardinality (model,
  operation, service, environment); never prompt text, ids, or user data.
*/
export function recordLlm({ system, model, operation, inputTokens = 0, outputTokens = 0, startMs, ok = true }) {
  if (!ENABLED) return; // the no-op path
  const start = Number.isFinite(startMs) ? startMs : Date.now();
  const startNano = `${start}000000`;
  const endNano = `${Date.now()}000000`;
  const inTok = Math.round(Number(inputTokens) || 0);
  const outTok = Math.round(Number(outputTokens) || 0);
  const cost = costUsd(model, inTok, outTok);

  const span = {
    traceId: hex(16),
    spanId: hex(8),
    name: `${operation} ${system}`,
    kind: 3, // CLIENT
    startTimeUnixNano: startNano,
    endTimeUnixNano: endNano,
    attributes: [
      sAttr("gen_ai.system", system),
      sAttr("gen_ai.request.model", model),
      sAttr("gen_ai.operation.name", operation),
      iAttr("gen_ai.usage.input_tokens", inTok),
      iAttr("gen_ai.usage.output_tokens", outTok),
    ],
    status: { code: ok ? 1 : 2 }, // OK / ERROR
  };
  send("/v1/traces", { resourceSpans: [{ resource: resource(), scopeSpans: [{ spans: [span] }] }] });

  const labels = [
    sAttr("gen_ai.request.model", model),
    sAttr("gen_ai.operation.name", operation),
    sAttr("service.name", SERVICE),
    sAttr("deployment.environment", ENVIRONMENT),
  ];
  const counter = (name, unit, value) => ({
    name,
    unit,
    sum: {
      aggregationTemporality: 2, // cumulative
      isMonotonic: true,
      dataPoints: [{ asDouble: value, timeUnixNano: endNano, attributes: labels }],
    },
  });
  send("/v1/metrics", {
    resourceMetrics: [
      {
        resource: resource(),
        scopeMetrics: [
          {
            metrics: [
              counter("gen_ai.cost.usd", "usd", cost),
              counter("gen_ai.usage.input_tokens", "", inTok),
              counter("gen_ai.usage.output_tokens", "", outTok),
              counter("gen_ai.calls", "", 1),
            ],
          },
        ],
      },
    ],
  });
}

// Await any in-flight telemetry. Called explicitly at the end of a run, and as a
// safety net on natural process exit (process.exit on failure skips this, fine).
export async function flushTelemetry() {
  if (pending.size === 0) return;
  await Promise.allSettled([...pending]);
}

if (ENABLED) process.on("beforeExit", () => void flushTelemetry());
