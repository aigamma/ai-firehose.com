import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

// A living demonstration of what an agentic harness is, using this project as the
// example. The numbers come from public/data/harness.json, which is regenerated
// from the repository's own state on every build (scripts/build_harness.mjs), so
// the page is non-idempotent: it changes whenever the harness does its job.
export default function Harness() {
  const { data: h } = useData("/data/harness.json");
  useDocumentTitle("The Harness");
  const m = h?.metrics || {};

  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "72ch" }}>
      <h1>The Harness</h1>
      <p className="muted">
        What an agentic harness is, shown by example. This page is generated from the
        repository's own state at build time, so it changes whenever the harness does
        its job.
      </p>

      <h2>What an Agentic Harness Is</h2>
      <p>
        An agentic harness is the scaffolding that lets an agent, or a fleet of them,
        operate reliably and autonomously without a human in the loop at every step.
        It is not the model. It is everything around the model: the conventions it
        auto-loads, the tools it can call, a persistent memory that does not decay,
        automated verification that the work cannot silently rot, and a way to fan
        many agents out against deterministic contracts so they do not collide.
      </p>
      <p>
        Point that same shape at infrastructure and you get the "agentic harness for
        data centers" idea: a fleet with runbooks as memory, the infrastructure APIs
        as tools, verification gates, and escalation paths, doing provisioning,
        incident response, and capacity work. A testing harness is a sibling: it
        drives a system under test through scenarios and checks the outcomes.
      </p>

      <h2>This Site Is One</h2>
      <p>
        AI Firehose is built and maintained by exactly such a harness, whose job is to
        keep a knowledge-and-ingestion system fresh so that any new agent, in any tool,
        can pick up the work and nothing goes stale. The counters below are not
        decoration: each is read live from the repository, so this is a working
        demonstration rather than a diagram.
      </p>

      {h && (
        <section className="card">
          <div className="card-head">
            <h2>The Harness, By Its Own State</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>built {h.generated}</span>
          </div>
          <div className="chips">
            <span className="chip">{m.durable_concepts} durable concepts</span>
            <span className="chip">{m.categories} categories</span>
            <span className="chip">{m.lessons_sessions} logged sessions</span>
            <span className="chip">{m.staleness_gates} anti-staleness gates</span>
            <span className="chip">{m.automated_checks} test files</span>
            <span className="chip">{m.source_adapters} source adapters</span>
            <span className="chip">{m.tier2_docs} subsystem docs</span>
            <span className="chip">{m.vendor_pointers} vendor pointers</span>
            <span className="chip">{m.index_entries} index entries</span>
            <span className="chip">{m.cross_category_links} category links</span>
          </div>
          {h.latest_lesson && (
            <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Most recently, the harness wrote down: {h.latest_lesson}
            </p>
          )}
        </section>
      )}

      <h2>Its Five Pillars</h2>
      {(h?.pillars || []).map((p) => (
        <section className="card" key={p.key}>
          <div className="card-head">
            <h3 style={{ margin: 0 }}>{p.title}</h3>
            <span className="faint mono" style={{ marginLeft: "auto" }}>
              {p.count} {p.unit}
            </span>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>{p.body}</p>
        </section>
      ))}

      <h2>Why It Matters Here</h2>
      <p>
        The author faces the same firehose this site organizes, so the harness is what
        makes the tool trustworthy: because the corpus self-expires, the costs stay
        flat; because the contracts are idempotent, a run can be repeated safely;
        because the docs are gated, what you read is what is true. See the{" "}
        <Link to="/methodology">Methodology</Link> for the data pipeline, or the{" "}
        <Link to="/glossary">Glossary</Link> for the durable layer it keeps.
      </p>
    </div>
  );
}
