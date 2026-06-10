import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import useSrs from "../hooks/useSrs.js";
import { selectDue } from "../lib/srs.js";
import { KINDS, getKind } from "../data/registry.js";

const aliasText = (a) => (Array.isArray(a) ? a.join(", ") : typeof a === "string" ? a : "");

// How many never-seen concepts to introduce per session, so a first-time reader always
// has a deck even though nothing is due yet, without burying them under hundreds at once.
const DAILY_NEW_CAP = 15;
// How many not-yet-due cards "Study ahead" pulls forward when the queue is clear.
const STUDY_AHEAD = 10;

const GRADES = [
  { key: "again", label: "Again", hint: "1", note: "Forgot it" },
  { key: "hard", label: "Hard", hint: "2", note: "Shaky" },
  { key: "good", label: "Good", hint: "3", note: "Got it" },
  { key: "easy", label: "Easy", hint: "4", note: "Easy" },
];

// Flashcard Review: a persisted spaced-repetition surface over the durable glossary.
// No backend, no scoring server; it reads the committed glossary index and schedules
// each concept locally (localStorage, key aifh:srs:v1) with an SM-2-lite scheduler so
// the field's vocabulary returns on the right day. Due cards come first, then a capped
// trickle of brand-new concepts. The durable glossary is the enduring asset; this is
// its daily-return loop. Every card links into its hub to go deeper.
export default function Review() {
  useDocumentTitle("Review");
  const { data, loading, error } = useData("/data/glossary/index.json");
  const { states, grade, prune, seeLess, challenging, toggleFav, remove } = useSrs();

  const pool = useMemo(() => (data?.concepts || []).filter((c) => c && c.def_snippet), [data]);
  const byId = useMemo(() => new Map(pool.map((c) => [c.id, c])), [pool]);

  const [kind, setKind] = useState("all");
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  // Cards pulled forward by "Study ahead" when nothing is naturally due.
  const [ahead, setAhead] = useState([]);
  // A monotonic tick to force a fresh deck snapshot after each grade (due times shift).
  const [tick, setTick] = useState(0);

  // Once the live concept ids are known, drop scheduler state for any slug that has
  // churned out of the glossary. Runs when the id set changes, not every render.
  const idsKey = useMemo(() => pool.map((c) => c.id).join("|"), [pool]);
  useEffect(() => {
    if (!pool.length) return;
    prune(new Set(pool.map((c) => c.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // The pool narrowed to the active kind filter.
  const filtered = useMemo(
    () => (kind === "all" ? pool : pool.filter((c) => c.kind === kind)),
    [pool, kind]
  );

  // The session deck, rebuilt from the live scheduler state: every due card (soonest
  // first) restricted to the current filter, then brand-new (untracked) concepts up to
  // the daily cap, then any cards the reader explicitly pulled forward with "Study
  // ahead". `tick` is a dependency so the snapshot refreshes after each grade. Capturing
  // Date.now in this memo is acceptable: it is the render-time read the hook mirrors,
  // and the pure selectDue keeps the decision testable.
  const deck = useMemo(() => {
    const now = Date.now();
    const inFilter = (id) => byId.has(id) && (kind === "all" || byId.get(id).kind === kind);

    const due = selectDue(states, now).filter(inFilter);
    const dueSet = new Set(due);

    const fresh = [];
    for (const c of filtered) {
      if (fresh.length >= DAILY_NEW_CAP) break;
      if (!(c.id in states) && !dueSet.has(c.id)) fresh.push(c.id);
    }
    const freshSet = new Set(fresh);

    const aheadIds = ahead.filter((id) => inFilter(id) && !dueSet.has(id) && !freshSet.has(id));

    return [...due, ...fresh, ...aheadIds].map((id) => byId.get(id)).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, filtered, byId, kind, ahead, tick]);

  // Always work the front of the deck: grading a card reschedules it out of "due", so
  // the next due card slides to the front. No running index to drift out of range.
  const card = deck[0];

  // How many cards are due right now within the current filter (for the counter and the
  // clear-queue state). Recomputed alongside the deck.
  const dueNow = useMemo(() => {
    const now = Date.now();
    return selectDue(states, now).filter(
      (id) => byId.has(id) && (kind === "all" || byId.get(id).kind === kind)
    ).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, byId, kind, tick]);

  // A kind change starts a fresh count and a hidden answer, and clears any study-ahead
  // pull (its cards belong to the prior filter's session).
  useEffect(() => {
    setRevealed(false);
    setReviewed(0);
    setAhead([]);
  }, [kind]);

  const reveal = useCallback(() => setRevealed(true), []);

  // Grade the front card, then advance: bump the reviewed counter, hide the answer, and
  // tick so the deck memo re-snapshots the now-updated scheduler state.
  const onGrade = useCallback(
    (g) => {
      if (!card) return;
      grade(card.id, g);
      setReviewed((n) => n + 1);
      setRevealed(false);
      setTick((t) => t + 1);
    },
    [card, grade]
  );

  // Manage the front card: see it less often, mark it challenging, or remove it. Each moves
  // the card out of the live queue, so advance like a grade (hide the answer, re-snapshot).
  // Favorite is handled separately (a flag toggle that leaves the card in place).
  const manage = useCallback(
    (fn) => {
      if (!card) return;
      fn(card.id);
      setRevealed(false);
      setTick((t) => t + 1);
    },
    [card]
  );

  // Pull a few not-yet-due cards forward when the natural queue is clear.
  const studyAhead = useCallback(() => {
    const now = Date.now();
    const dueSet = new Set(selectDue(states, now));
    const picks = [];
    for (const c of filtered) {
      if (picks.length >= STUDY_AHEAD) break;
      if (!dueSet.has(c.id)) picks.push(c.id);
    }
    setAhead(picks);
    setRevealed(false);
    setTick((t) => t + 1);
  }, [states, filtered]);

  // Keyboard: Space/Enter flips, then grades Good on a second press for fast review;
  // 1-4 grade directly once revealed; the card div holds focus. Listener is rebuilt when
  // its closure deps change and is cleaned up each time.
  const cardRef = useRef(null);
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (revealed) onGrade("good");
        else reveal();
        return;
      }
      if (revealed) {
        const g = GRADES.find((x) => x.hint === e.key);
        if (g) {
          e.preventDefault();
          onGrade(g.key);
        }
      }
    },
    [revealed, onGrade, reveal]
  );

  const kindMeta = card ? getKind(card.kind) : null;

  return (
    <div className="stack page-centered" style={{ paddingTop: 24, maxWidth: "60ch" }}>
      <header>
        <p className="eyebrow">Study</p>
        <h1>Flashcard Review</h1>
        <p className="muted">
          Spaced repetition over the durable glossary, {pool.length || 0} concepts and growing. Each card
          is scheduled to return on the day you are about to forget it, saved in this browser. Recall the
          term, reveal the definition, then grade yourself. Press Space to flip, then 1 to 4 to grade.
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
      ) : !pool.length ? (
        <div className="empty">
          <strong>{loading ? "Loading the deck" : "No cards here"}</strong>
          {loading ? "One moment." : "Nothing to review yet."}
        </div>
      ) : !card ? (
        <div className="empty">
          <strong>You are clear, nothing due right now.</strong>
          Spaced repetition is working: every card in this filter is scheduled for a future day. Come back
          tomorrow, or study a few ahead of schedule.
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn" onClick={studyAhead}>
              Study ahead
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={cardRef}
            className="card"
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={`Flashcard: ${card.label}. ${revealed ? "Answer shown. Grade one through four." : "Press Space to reveal the answer."}`}
            style={{ minHeight: 210, display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span className={`badge ${kindMeta?.badgeClass || ""}`}>
                <span className="dot" style={{ background: "currentColor" }} />
                {kindMeta?.singular || "Concept"}
              </span>
              {!(card.id in states) && (
                <span className="chip" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                  New
                </span>
              )}
              <span className="faint mono" style={{ marginLeft: "auto" }}>
                {dueNow} due
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

          {revealed ? (
            <div className="stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GRADES.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className="btn"
                    onClick={() => onGrade(g.key)}
                    title={`${g.note} (press ${g.hint})`}
                    style={{ flex: "1 1 0", minWidth: 88 }}
                  >
                    {g.label} <span className="faint mono" style={{ marginLeft: 4 }}>{g.hint}</span>
                  </button>
                ))}
              </div>
              <p className="faint" style={{ margin: 0, fontSize: "0.82rem" }}>
                How well did you recall it? Again resurfaces it this session; Easy waits the longest.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={reveal}>
                Reveal
              </button>
              <span className="faint mono">Space to flip, 1 to 4 to grade</span>
            </div>
          )}

          <div className="srs-manage" role="group" aria-label="Manage this card">
            <button type="button" className="srs-manage-btn" onClick={() => manage(seeLess)} title="Push it further out and keep spacing it: you will see it less often">
              See less often
            </button>
            <button type="button" className="srs-manage-btn" onClick={() => manage(challenging)} title="Bring it back soon and keep it frequent">
              Challenging
            </button>
            <button type="button" className={`srs-manage-btn${states[card.id]?.fav ? " is-fav" : ""}`} onClick={() => toggleFav(card.id)} title="Favorite this card">
              {states[card.id]?.fav ? "★ Favorited" : "☆ Favorite"}
            </button>
            <button type="button" className="srs-manage-btn srs-remove" onClick={() => manage(remove)} title="Remove from your deck: it will not return">
              Remove
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="faint mono" style={{ marginLeft: "auto" }}>
              {reviewed} reviewed - {dueNow} due
            </span>
          </div>
        </>
      )}
    </div>
  );
}
