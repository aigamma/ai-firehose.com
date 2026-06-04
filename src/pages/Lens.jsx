import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import useLens from "../hooks/useLens.js";
import { KINDS, getKind } from "../data/registry.js";

const aliasText = (a) => (Array.isArray(a) ? a.join(" ") : typeof a === "string" ? a : "");

// For You: the personalization lens, the "bottled just for you" layer in its first
// form. A reader follows the concepts they want to stay sharp on (persisted in this
// browser, no account). The follow set is the foundation that future surfaces (the
// brief, the boards) will filter against. Reads the committed glossary index.
export default function Lens() {
  useDocumentTitle("For You");
  const { data, loading, error } = useData("/data/glossary/index.json");
  const { follows, toggleFollow, isFollowing, clearFollows } = useLens();

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [onlyFollowed, setOnlyFollowed] = useState(false);

  const all = useMemo(() => data?.concepts || [], [data]);
  const followSet = useMemo(() => new Set(follows), [follows]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return all.filter((c) => {
      if (kind !== "all" && c.kind !== kind) return false;
      if (onlyFollowed && !followSet.has(c.id)) return false;
      if (!ql) return true;
      return `${c.label} ${aliasText(c.aliases)} ${c.def_snippet || ""}`.toLowerCase().includes(ql);
    });
  }, [all, q, kind, onlyFollowed, followSet]);

  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "74ch" }}>
      <header>
        <p className="eyebrow">For You</p>
        <h1>Your Slice of the Firehose</h1>
        <p className="muted">
          Follow the concepts you want to stay sharp on, and this becomes your lens. It is saved in this
          browser, no account needed. Soon your daily brief and the trend boards will filter to what you
          follow; for now, your follows are a fast path back to the hubs that matter to you.
        </p>
      </header>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <strong style={{ color: "var(--text-strong)" }}>
          Following {follows.length} {follows.length === 1 ? "concept" : "concepts"}
        </strong>
        {follows.length > 0 && (
          <>
            <button type="button" className="chip" aria-pressed={onlyFollowed} onClick={() => setOnlyFollowed((v) => !v)}>
              {onlyFollowed ? "Show all" : "Show only mine"}
            </button>
            <button type="button" className="chip" onClick={clearFollows} style={{ marginLeft: "auto" }}>
              Clear lens
            </button>
          </>
        )}
      </div>

      <input
        className="search"
        type="search"
        placeholder="Search concepts to follow…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search concepts to follow"
      />
      <div className="chips" role="group" aria-label="Filter by kind">
        <button
          type="button"
          className="chip"
          aria-pressed={kind === "all"}
          onClick={() => setKind("all")}
          style={kind === "all" ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
        >
          All
        </button>
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            className="chip"
            aria-pressed={kind === k.key}
            onClick={() => setKind(k.key)}
            style={kind === k.key ? { borderColor: `var(${k.accentVar})`, color: `var(${k.accentVar})` } : undefined}
          >
            {k.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="card" role="alert">
          <strong style={{ display: "block", marginBottom: 4 }}>Unable to load the glossary.</strong>
          <span className="muted">Retry shortly.</span>
        </div>
      ) : loading && !all.length ? (
        <div className="empty">
          <strong>Loading concepts</strong>One moment.
        </div>
      ) : !filtered.length ? (
        <div className="empty">
          <strong>Nothing matches</strong>
          {onlyFollowed ? "You have not followed anything in this filter yet." : "Try a different search or kind."}
        </div>
      ) : (
        <ul className="feed">
          {filtered.map((c) => {
            const km = getKind(c.kind);
            const following = isFollowing(c.id);
            return (
              <li key={c.id} className="gloss-row">
                <div className="gloss-head">
                  <button
                    type="button"
                    onClick={() => toggleFollow(c.id)}
                    aria-pressed={following}
                    aria-label={following ? `Unfollow ${c.label}` : `Follow ${c.label}`}
                    title={following ? "Unfollow" : "Follow"}
                    style={{
                      background: "none",
                      border: 0,
                      cursor: "pointer",
                      fontSize: "1.15rem",
                      lineHeight: 1,
                      padding: 0,
                      color: following ? "var(--q-weakening)" : "var(--faint)",
                    }}
                  >
                    {following ? "★" : "☆"}
                  </button>
                  <Link to={`/technique/${c.id}`} className="lead-label">
                    {c.label}
                  </Link>
                  {km && (
                    <span className={`badge ${km.badgeClass}`}>
                      <span className="dot" style={{ background: "currentColor" }} />
                      {km.singular}
                    </span>
                  )}
                </div>
                {c.def_snippet && (
                  <p className="gloss-def muted" style={{ margin: 0 }}>
                    {c.def_snippet}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
