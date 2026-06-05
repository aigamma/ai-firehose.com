import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import TrendBoard from "../components/TrendBoard.jsx";
import Briefing from "../components/Briefing.jsx";
import CreatorSpotlight from "../components/CreatorSpotlight.jsx";
import ItemCard from "../components/ItemCard.jsx";
import LoadError from "../components/LoadError.jsx";
import useData from "../lib/useData.js";
import useUnifiedAttention from "../lib/useUnifiedAttention.js";
import useSeen from "../hooks/useSeen.js";
import { itemKey, isNewSince, countNewSince, clearedCount, allCleared } from "../lib/seen.js";
import useSrs from "../hooks/useSrs.js";
import { SITE, HORIZONS, KINDS, DEFAULT_HORIZON, getHorizon, getKind } from "../data/registry.js";

export default function Home() {
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const h = getHorizon(horizon);
  const { data: digest, loading: digestLoading, error: digestError } = useData(`/data/digests/${horizon}.json`);
  const { entities, loading: attnLoading, error: attnError, anyData: anyAttn } = useUnifiedAttention(horizon);
  const { data: creators } = useData("/data/creators.json");
  const featuredCreator = creators?.creators?.find((c) => c.videos?.length);
  const synthetic = digest?.synthetic;

  // Group the merged boards by kind for the three trend heat boards, and pick the
  // hero: the strongest breakout by growth, else the single biggest mover. Both read
  // the live boards (which carry `delta`), not the digest, so the lede always matches
  // what the boards show.
  const newItems = digest?.new_items || [];

  const byKind = KINDS.map((k) => ({ kind: k, list: entities.filter((e) => e.kind === k.key) }));
  const sortedByDelta = [...entities].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const breakout = sortedByDelta.find((e) => e.outlier?.breakout) || sortedByDelta[0];

  // The returning-visitor layer: what is new since the reader was last here, and how
  // much of this window's wire they have cleared (the "conquer the firehose" loop).
  // All client-side (localStorage); with the corpus frozen it simply reads as nothing
  // new and degrades quietly until the daily worker refresh lands.
  const { lastVisit, read, toggleRead, markRead, setBatch } = useSeen();
  const newSince = countNewSince(newItems, lastVisit);
  const cleared = clearedCount(newItems, read);
  const wireDone = allCleared(newItems, read);

  // Spaced-repetition nudge: how many glossary cards are due in Review. Reads the
  // same aifh:srs:v1 store the Review page writes, so a reader who studied yesterday
  // is invited back today. Zero (and hidden) until they have reviewed anything.
  const { dueCount } = useSrs();
  const srsDue = dueCount();

  // Arrow keys cycle the horizon (Day to Quarter), but ONLY when focus is within
  // the switcher, so the global page is not robbed of arrow-key scrolling and
  // reading. The listener binds to the switcher container and reads the current
  // horizon through a ref, so the effect attaches once instead of re-binding on
  // every horizon change.
  const switcherRef = useRef(null);
  const horizonRef = useRef(horizon);
  horizonRef.current = horizon;
  useEffect(() => {
    const el = switcherRef.current;
    if (!el) return undefined;
    const onKey = (e) => {
      const i = HORIZONS.findIndex((x) => x.key === horizonRef.current);
      if (e.key === "ArrowRight" && i < HORIZONS.length - 1) {
        e.preventDefault();
        setHorizon(HORIZONS[i + 1].key);
      }
      if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        setHorizon(HORIZONS[i - 1].key);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="stack home-stack">
      <header className="masthead">
        <h1 className="masthead-kicker">{SITE.name}</h1>
      </header>

      <div className="dateline">
        <span ref={switcherRef} style={{ display: "inline-flex" }}>
          <HorizonSwitch value={horizon} onChange={setHorizon} />
        </span>
        <span className="dateline-phrase">The past {h.label.toLowerCase()} on the frontier</span>
        {newSince > 0 && (
          <span className="dateline-new" title="Items published since you were last here">
            {newSince} new since your last visit
          </span>
        )}
        {srsDue > 0 && (
          <Link to="/review" className="chip dateline-due" title="Spaced-repetition cards are due in Review">
            {srsDue} {srsDue === 1 ? "card" : "cards"} due
          </Link>
        )}
        {synthetic && (
          <span className="synthetic-ribbon" title="Placeholder data until the live worker runs">
            demo data
          </span>
        )}
        {digest?.generated && (
          <span className="faint mono dateline-stamp">updated {digest.generated}</span>
        )}
      </div>

      <Briefing horizon={horizon} />

      {breakout && (
        <Link to={`/technique/${breakout.id}`} className="breakout">
          <span className="breakout-tag">Breaking Out</span>
          <strong>{breakout.label}</strong>
          <span className="faint mono">
            {getKind(breakout.kind)?.singular} · {(breakout.delta ?? 0) >= 0 ? "+" : ""}{Math.round(breakout.delta ?? 0)} vs prior {h.label.toLowerCase()} · attention {breakout.attention}
          </span>
        </Link>
      )}

      <section className="card">
        <div className="card-head">
          <h2>What Moved</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>growth vs the prior {h.label.toLowerCase()}</span>
        </div>
        <p className="muted" style={{ margin: "0 0 14px", maxWidth: "70ch" }}>
          The topics that gained or lost the most attention against the {h.label.toLowerCase()} before. The bar is the share of the conversation each holds now, green when rising and red when cooling.
        </p>
        {attnError ? (
          <LoadError label="Trend boards" />
        ) : anyAttn ? (
          <div className="heat-grid">
            {byKind.map(({ kind, list }) => (
              <TrendBoard key={kind.key} kind={kind} entities={list} limit={8} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <strong>Trend boards</strong>
            {attnLoading ? "Loading…" : "Awaiting ingestion."}
          </div>
        )}
      </section>

      {featuredCreator && (
        <section className="card">
          <div className="card-head">
            <h2>Watch</h2>
            <Link to="/watch" className="eyebrow" style={{ marginLeft: "auto" }}>See all in Watch</Link>
          </div>
          <CreatorSpotlight creator={featuredCreator} compact />
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Fresh Off the Wire</h2>
          <span className="eyebrow" style={{ marginLeft: "auto" }}>past {h.label.toLowerCase()}</span>
        </div>
        {newItems.length > 0 && (
          <div className="wire-status">
            {wireDone ? (
              <span className="wire-done">You have cleared this {h.label.toLowerCase()}'s wire.</span>
            ) : (
              <span className="faint">{cleared} of {newItems.length} cleared</span>
            )}
            <button
              type="button"
              className="chip"
              onClick={() => setBatch(newItems.map(itemKey), !wireDone)}
              title={wireDone ? "Mark all of these unread again" : "Mark every item here as read"}
            >
              {wireDone ? "Show all again" : "Mark all read"}
            </button>
          </div>
        )}
        {digestError ? (
          <LoadError label={`New in the past ${h.label.toLowerCase()}`} />
        ) : newItems.length ? (
          <div className="grid cols-2">
            {newItems.map((it, i) => {
              const k = itemKey(it);
              return (
                <ItemCard
                  key={`${it.id || k || "item"}-${i}`}
                  item={it}
                  linkConcepts
                  isNew={isNewSince(it, lastVisit)}
                  read={read.has(k)}
                  onToggleRead={toggleRead}
                  onMarkRead={markRead}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty"><strong>New in the past {h.label.toLowerCase()}</strong>{digestLoading ? "Loading…" : "Awaiting ingestion."}</div>
        )}
      </section>
    </div>
  );
}
