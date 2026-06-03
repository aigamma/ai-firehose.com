import { Link } from "react-router-dom";
import { getKind } from "../data/registry.js";
import RichText from "./RichText.jsx";

// Concepts arrive from Pinecone metadata as either a string array or a single
// comma-joined string (the worker tolerates both). Coerce to a clean label list
// so the chip row never renders character-by-character or a stray empty chip.
function conceptLabels(concepts) {
  const raw = Array.isArray(concepts)
    ? concepts
    : typeof concepts === "string"
      ? concepts.split(",")
      : [];
  return raw.map((c) => String(c).trim()).filter(Boolean);
}

// A published_at is an ISO date (or empty). Render it as a stable, locale short
// date; if it is missing or unparseable, render nothing rather than "Invalid Date".
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// A relevance score is a 0..1 rerank/dense score (rounded to 3 decimals upstream).
// Show it as a whole percent. Clamp so a fail-open dense score over 1 never prints
// "120%". Tabular numerals keep the digits from jittering as the list re-renders.
function formatScore(score) {
  const n = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  return `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;
}

// One semantic-search result. The title links out to the source (results are
// external URLs, so a plain anchor, not a Link). The kind chip and a left accent
// seam carry the kind's color via --tile-accent, matching the rotation boards.
// When `linkConcepts` is set (the Home "What Is New" feed, where concepts are
// glossary slugs), each concept chip becomes a wiki-link into its hub, per the
// citation contract; otherwise chips are plain text (the default, for search).
export default function ItemCard({ item, linkConcepts = false }) {
  const kind = getKind(item.kind);
  const concepts = conceptLabels(item.concepts);
  const date = formatDate(item.published_at);
  const pct = formatScore(item.score);
  const accent = kind ? `var(${kind.accentVar})` : "var(--accent)";

  return (
    <article className="card" style={{ "--tile-accent": accent, padding: 14 }}>
      <div className="feed-head" style={{ flexWrap: "wrap" }}>
        {kind && <span className={`badge ${kind.badgeClass}`}>{kind.singular}</span>}
        <span className="lead-label" style={{ flex: "1 1 auto", whiteSpace: "normal" }}>
          {item.url && item.url.startsWith("/") ? (
            <Link to={item.url}>{item.title || item.url}</Link>
          ) : (
            <a href={item.url} target="_blank" rel="noreferrer">{item.title || item.url}</a>
          )}
        </span>
        {pct && (
          <span className="mono" style={{ fontVariantNumeric: "tabular-nums", color: "var(--faint)" }} title="Relevance">
            {pct}
          </span>
        )}
      </div>

      {(item.author_or_channel || date) && (
        <div className="faint" style={{ fontSize: "0.8rem", marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.author_or_channel && <span>{item.author_or_channel}</span>}
          {item.author_or_channel && date && <span aria-hidden="true">·</span>}
          {date && <time dateTime={item.published_at}>{date}</time>}
        </div>
      )}

      {item.summary && (
        <p className="gloss-def faint summary-clamp" style={{ margin: "8px 0 0" }}>
          <RichText as="span" text={item.summary} />
        </p>
      )}

      {concepts.length > 0 && (
        <div className="chips" style={{ marginTop: 10 }}>
          {concepts.map((c) =>
            linkConcepts ? (
              <Link key={c} to={`/technique/${c}`} className="chip">{c.replace(/-/g, " ")}</Link>
            ) : (
              <span key={c} className="chip">{c}</span>
            )
          )}
        </div>
      )}
    </article>
  );
}
