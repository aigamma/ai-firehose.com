import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import TrendBoard from "../components/TrendBoard.jsx";
import Briefing from "../components/Briefing.jsx";
import CreatorSpotlight from "../components/CreatorSpotlight.jsx";
import ItemCard from "../components/ItemCard.jsx";
import useData from "../lib/useData.js";
import useUnifiedAttention from "../lib/useUnifiedAttention.js";
import useLens from "../hooks/useLens.js";
import { filterByLens } from "../lib/lens.js";
import { SITE, HORIZONS, KINDS, DEFAULT_HORIZON, getHorizon, getKind } from "../data/registry.js";

// A distinct load-failure notice, visually separate from the dashed ".empty"
// awaiting-ingestion box, so a real error is never read as "no data yet".
function LoadError({ label }) {
  return (
    <div
      role="alert"
      style={{
        border: "1px solid var(--q-lagging)",
        borderLeftWidth: 3,
        borderRadius: "var(--radius)",
        padding: 16,
        color: "var(--muted)",
        background: "color-mix(in oklab, var(--q-lagging) 8%, transparent)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>{label}</strong>
      Unable to load. Retry shortly.
    </div>
  );
}

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
  // The personalization lens (opt-in, default off): when on and the reader follows
  // anything, narrow the boards and the new-items to their followed concepts. The
  // briefing stays global (it is the analyst's overview); the lens narrows the lists.
  const [lensOn, setLensOn] = useState(false);
  const { follows } = useLens();
  const lensActive = lensOn && follows.length > 0;
  const viewEntities = lensActive ? filterByLens(entities, follows) : entities;
  const newItems = digest?.new_items || [];
  const viewItems = lensActive ? filterByLens(newItems, follows) : newItems;

  const byKind = KINDS.map((k) => ({ kind: k, list: viewEntities.filter((e) => e.kind === k.key) }));
  const sortedByDelta = [...viewEntities].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const breakout = sortedByDelta.find((e) => e.outlier?.breakout) || sortedByDelta[0];

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
    <div className="stack">
      <header className="masthead">
        <p className="masthead-kicker">{SITE.name}</p>
        <h1 className="masthead-title">{SITE.tagline}</h1>
        <p className="masthead-stand">{SITE.description}</p>
      </header>

      <div className="dateline">
        <span ref={switcherRef} style={{ display: "inline-flex" }}>
          <HorizonSwitch value={horizon} onChange={setHorizon} />
        </span>
        <span className="dateline-phrase">The past {h.label.toLowerCase()} on the frontier</span>
        {follows.length > 0 ? (
          <button
            type="button"
            className="chip"
            aria-pressed={lensActive}
            onClick={() => setLensOn((v) => !v)}
            title={lensActive ? "Showing only the concepts you follow. Click to show everything." : "Filter this page to the concepts you follow."}
            style={lensActive ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
          >
            {lensActive ? `Your lens (${follows.length})` : `Show your lens (${follows.length})`}
          </button>
        ) : (
          <Link to="/lens" className="chip" title="Follow concepts to personalize this page">Personalize</Link>
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
        ) : lensActive && !viewEntities.length ? (
          <div className="empty">
            <strong>Nothing in your lens moved this {h.label.toLowerCase()}</strong>
            Turn off your lens above to show everything, or follow more concepts.
          </div>
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
        {digestError ? (
          <LoadError label={`New in the past ${h.label.toLowerCase()}`} />
        ) : viewItems.length ? (
          <div className="grid cols-2">
            {viewItems.map((it, i) => (
              <ItemCard key={it.id || i} item={it} linkConcepts />
            ))}
          </div>
        ) : lensActive ? (
          <div className="empty"><strong>Nothing new in your lens this {h.label.toLowerCase()}</strong>Turn off your lens above, or follow more concepts.</div>
        ) : (
          <div className="empty"><strong>New in the past {h.label.toLowerCase()}</strong>{digestLoading ? "Loading…" : "Awaiting ingestion."}</div>
        )}
      </section>
    </div>
  );
}
