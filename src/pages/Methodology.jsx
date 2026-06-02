import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import { RETENTION_DAYS } from "../data/registry.js";

export default function Methodology() {
  const { data: stats } = useData("/data/stats.json");
  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "72ch" }}>
      <h1>Methodology</h1>
      <p className="muted">
        How AI Firehose turns a daily flood into something navigable. Everything here is computed from real
        sources. The only hand-curation is which YouTube teachers to trust.
      </p>

      {stats && (
        <section className="card">
          <div className="card-head">
            <h2>By the Numbers</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>updated {stats.generated}</span>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            {stats.total_items} items and {stats.concepts} concepts, retained for {stats.retention_days} days.
          </p>
          <div className="chips">
            {Object.entries(stats.by_source || {})
              .sort((a, b) => b[1] - a[1])
              .map(([s, n]) => (
                <span key={s} className="chip">{s} {n}</span>
              ))}
          </div>
        </section>
      )}

      <h2>The Outlier Hunt</h2>
      <p>
        The field moves faster than any feed reader can summarize, so a flat chronological river is the wrong
        shape. AI Firehose is built as an outlier hunt: it surfaces what is breaking out, not everything that
        happened. Each item is embedded and classified, attention accrues to the concepts and tools it mentions,
        and the surfaces foreground the movers, the new entrants, and the ideas changing position.
      </p>

      <h2>Four Horizons, One Quarter</h2>
      <p>
        The site answers four questions and then stops: what is new in the past day, week, month, and quarter.
        These are nested windows inside a single rolling quarter of data. Nothing older than about {RETENTION_DAYS} days
        is retained. In the fastest growing industry, stale signal is noise, so the corpus deliberately
        self-expires. A useful side effect is that the maps always depict the current frontier and the
        infrastructure cost stays flat no matter how long the site runs.
      </p>

      <h2>Relative Rotation</h2>
      <p>
        Each board (Techniques, Tools, Opinions) places its entities on a rotation plane. The math is the
        Mansfield Relative Performance normalization (Roy Mansfield, 1979), applied to attention instead of
        price, the same prior-art approach used on aigamma.com. Relative strength is an entity's share of the
        total attention in its kind. The rotation ratio expresses that strength as a percentage of its own slow
        moving average (above 100 leads, below 100 trails), and the rotation momentum applies the same operation
        again with a faster smoother (above 100 gaining, below 100 fading). The two together place each entity in
        one of four quadrants: Leading, Improving, Weakening, Lagging.
      </p>
      <p className="muted">
        Bursty mentions are first smoothed into a decaying attention level, because raw one-day spikes make the
        normalization degenerate. The displayed values are clamped to a readable band.
      </p>

      <h2>The AI-Grown Taxonomy</h2>
      <p>
        Tags are not a fixed vocabulary. A model reads each item and names the concepts it discusses, coining
        new ones as the field does. Every candidate is then fitted to the existing taxonomy by embedding
        similarity, so near-duplicate names (LLM and large language models) collapse onto one concept with
        aliases rather than fragmenting. The result is the self-organizing <Link to="/glossary">Glossary</Link>.
      </p>

      <h2>Sources</h2>
      <p>
        The primary source is a curated set of high-signal YouTube teachers, who tend to surface the most
        interesting developments early. Alongside them are arXiv (research) and Hacker News (launches and
        debate), with more to come. Each source carries an authority weight that scales how strongly it moves
        the rotation, so a trusted teacher covering a new topic registers as a leading indicator.
      </p>

      <h2>No Chatbot</h2>
      <p>
        The embedding layer exists to organize, visualize, and search, not to chat. The one live model surface is
        semantic search on the <Link to="/explore">Explore</Link> page. The goal is to feel organized and
        courageous facing the frontier, not to add one more place to type a question.
      </p>
    </div>
  );
}
