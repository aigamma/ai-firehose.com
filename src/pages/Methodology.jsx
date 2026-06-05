import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import PageHero from "../components/PageHero.jsx";
import { RETENTION_DAYS, AXES, KINDS } from "../data/registry.js";

export default function Methodology() {
  const { data: stats } = useData("/data/stats.json");
  useDocumentTitle("Methodology");
  return (
    <div className="stack article" style={{ paddingTop: 24 }}>
      <PageHero
        eyebrow="How It Works"
        title="Methodology"
        lede="How AI Firehose turns a daily flood into something navigable. Everything here is computed from real sources; the only hand-curation is which YouTube teachers to trust."
      />

      {stats && (
        <section className="card">
          <div className="card-head">
            <h2>By the Numbers</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>updated {stats.generated}</span>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            {stats.total_items} items and {stats.concepts} concepts tracked in the live corpus, retained for {stats.retention_days} days. The durable
            <Link to="/glossary"> Glossary</Link> adds a permanent, separately authored knowledge layer that does not expire.
          </p>
          <div className="chips">
            {Object.entries(stats.by_source || {})
              .sort((a, b) => b[1] - a[1])
              .map(([s, n]) => (
                <span key={s} className="chip">{s} {n}</span>
              ))}
          </div>
          <div className="kindbar" title="Distribution by kind">
            {KINDS.map((k) => {
              const total = Object.values(stats.by_kind || {}).reduce((a, b) => a + b, 0) || 1;
              const n = stats.by_kind?.[k.key] || 0;
              return <span key={k.key} title={`${k.label} ${n}`} style={{ width: `${(n / total) * 100}%`, background: `var(${k.accentVar})` }} />;
            })}
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

      <h2>What Is Trending</h2>
      <p>
        Techniques, Tools, and Opinions each get a ranked board of the topics moving the most right now. A topic is
        ranked by how much attention it gained or lost over the chosen window (Day, Week, Month, or Quarter) versus
        the equally long window just before it, measured in weighted mentions. The bar shows how much attention a
        topic holds now, the signed number shows the change, and topics that just surfaced or broke out are flagged.
      </p>
      <p className="muted">
        An earlier version plotted a Mansfield Relative Performance rotation plane (Roy Mansfield, 1979), the
        prior-art approach used on aigamma.com. On this corpus (a few hundred topics over a rolling quarter, most
        appearing for the first time within the window) that normalization pinned almost every topic to the edge of
        its readable band and could not say what was actually trending. The growth measure is honest on sparse,
        bursty data: it never divides by a near-empty baseline and is not clamped. The underlying momentum and
        four-quadrant status are still computed, and surface on each concept hub.
      </p>

      <h2>The Daily Briefing</h2>
      <p>
        Each window opens with a short briefing: a model reads the window's movers, breakouts, and new items and
        writes a few sentences on what is happening, with every claim linked to the concept or the item it came
        from. It is generated in batch, not in conversation, then sanitized and cached, so it costs nothing when
        the day is quiet. The aim is one honest paragraph that orients before the charts.
      </p>

      <h2>The AI-Grown Taxonomy</h2>
      <p>
        Tags are not a fixed vocabulary. A model reads each item and names the concepts it discusses, coining
        new ones as the field does. Every candidate is then fitted to the existing taxonomy by embedding
        similarity, so near-duplicate names (LLM and large language models) collapse onto one concept with
        aliases rather than fragmenting. The result is the self-organizing <Link to="/glossary">Glossary</Link>.
      </p>

      <h2>The Discourse Axes</h2>
      <p>
        Beyond clustering, every concept is projected onto seven hand-authored axes of AI discourse. Each pole is
        embedded as a short anchor, and a concept sits where its meaning falls between them. Browse them on the{" "}
        <Link to="/explore">Explore</Link> page.
      </p>
      <ul>
        {AXES.map((a) => (
          <li key={a.slug}>{a.title}</li>
        ))}
      </ul>

      <h2>Sources</h2>
      <p>
        The primary source is a curated set of high-signal YouTube teachers, who tend to surface the most
        interesting developments early. Alongside them: arXiv (research), Hacker News (launches and debate),
        GitHub (trending repositories), Hugging Face (daily papers and models), and a manifest of lab blogs and
        newsletters, with community sources such as Reddit. Each source carries an authority weight that scales
        how strongly it moves the rotation, so a trusted teacher covering a new topic registers as a leading
        indicator.
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
