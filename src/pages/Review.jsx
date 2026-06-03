import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { KINDS, getKind } from "../data/registry.js";

// Self-seeded Fisher-Yates so Shuffle reorders deterministically per seed, with no
// dependence on wall-clock Date or shared Math.random state. Pure.
function shuffle(arr, seed) {
  const a = [...arr];
  let s = ((seed * 9301 + 49297) % 233280) || 1;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const aliasText = (a) => (Array.isArray(a) ? a.join(", ") : typeof a === "string" ? a : "");

// Flashcard Review: an active-recall study surface over the durable glossary. No
// backend, no scoring server; it reads the committed glossary index and lets a
// reader test themselves on the field's vocabulary and jump to any hub to go
// deeper. The "stay sharp" tool an aspiring engineer bookmarks.
export default function Review() {
  useDocumentTitle("Review");
  const { data, loading, error } = useData("/data/glossary/index.json");
  const pool = useMemo(() => (data?.concepts || []).filter((c) => c && c.def_snippet), [data]);

  const [kind, setKind] = useState("all");
  const [seed, setSeed] = useState(1);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState(0);

  const deck = useMemo(() => {
    const filtered = kind === "all" ? pool : pool.filter((c) => c.kind === kind);
    return shuffle(filtered, seed);
  }, [pool, kind, seed]);

  // A new deck (kind change, shuffle, or first data) restarts the session.
  useEffect(() => {
    setPos(0);
    setRevealed(false);
    setSeen(0);
  }, [kind, seed, pool.length]);

  const card = deck[pos];

  const next = useCallback(() => {
    setRevealed(false);
    setSeen((n) => n + 1);
    setPos((p) => (deck.length ? (p + 1) % deck.length : 0));
  }, [deck.length]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (revealed) next();
        else setRevealed(true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    },
    [revealed, next]
  );

  const kindMeta = card ? getKind(card.kind) : null;

  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "60ch" }}>
      <header>
        <p className="eyebrow">Study</p>
        <h1>Flashcard Review</h1>
        <p className="muted">
          Active recall over the durable glossary, {pool.length || 0} concepts and growing. Read the term,
          recall what it means, then reveal and open the hub to go deeper. Focus a card and press Space to
          flip, again to advance.
        </p>
      </header>

      <div className="chips" role="group" aria-label="Filter the deck by kind">
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
      ) : !card ? (
        <div className="empty">
          <strong>{loading ? "Loading the deck" : "No cards here"}</strong>
          {loading ? "One moment." : "Nothing to review in this filter yet."}
        </div>
      ) : (
        <>
          <div
            className="card"
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={`Flashcard: ${card.label}. ${revealed ? "Answer shown." : "Press Space to reveal the answer."}`}
            style={{ minHeight: 210, display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span className={`badge ${kindMeta?.badgeClass || ""}`}>
                <span className="dot" style={{ background: "currentColor" }} />
                {kindMeta?.singular || "Concept"}
              </span>
              <span className="faint mono" style={{ marginLeft: "auto" }}>
                {pos + 1} / {deck.length}
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              {card.label}
            </p>

            {revealed ? (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <p style={{ margin: 0, lineHeight: 1.6 }}>{card.def_snippet}</p>
                {aliasText(card.aliases) && (
                  <p className="faint" style={{ margin: 0, fontSize: "0.85rem" }}>
                    Also known as: {aliasText(card.aliases)}
                  </p>
                )}
                <Link to={`/technique/${card.id}`} className="eyebrow" style={{ color: "var(--accent)" }}>
                  Open the full hub
                </Link>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 16, fontStyle: "italic" }}>
                Recall the definition, then reveal.
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {revealed ? (
              <button type="button" className="btn" onClick={next}>
                Next card
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => setRevealed(true)}>
                Reveal
              </button>
            )}
            <button type="button" className="chip" onClick={() => setSeed((s) => s + 1)} title="Reshuffle the deck">
              Shuffle
            </button>
            <span className="faint mono" style={{ marginLeft: "auto" }}>
              {seen} reviewed
            </span>
          </div>
        </>
      )}
    </div>
  );
}
