import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import UnifiedRotationChart from "../components/UnifiedRotationChart.jsx";
import Briefing from "../components/Briefing.jsx";
import CreatorSpotlight from "../components/CreatorSpotlight.jsx";
import ItemCard from "../components/ItemCard.jsx";
import Sparkline from "../components/Sparkline.jsx";
import useData from "../lib/useData.js";
import useUnifiedAttention from "../lib/useUnifiedAttention.js";
import { SITE, HORIZONS, QUADRANTS, quadrantOf, DEFAULT_HORIZON, getHorizon, getKind } from "../data/registry.js";

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

function QuadrantLegend() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {Object.values(QUADRANTS).map((q) => (
        <span key={q.key} className="badge" title={q.note}>
          <span className="dot" style={{ background: `var(${q.colorVar})` }} />
          {q.label}
        </span>
      ))}
    </div>
  );
}

function Reasons({ outlier }) {
  const r = [];
  if (outlier?.breakout) r.push("breakout");
  if (outlier?.new_entrant) r.push("new");
  if (outlier?.quadrant_jump) r.push("jump");
  return <span className="faint mono">{r.join(" · ")}</span>;
}

export default function Home() {
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const h = getHorizon(horizon);
  const { data: digest, loading: digestLoading, error: digestError } = useData(`/data/digests/${horizon}.json`);
  const { entities, loading: attnLoading, error: attnError, anyData: anyAttn } = useUnifiedAttention(horizon);
  const { data: creators } = useData("/data/creators.json");
  const featuredCreator = creators?.creators?.find((c) => c.videos?.length);
  const synthetic = digest?.synthetic;
  const breakout = digest?.outliers?.[0] || digest?.movers?.[0];

  // Top Movers: the biggest trend shifts (largest |momentum - 100|) among entities
  // that have a real trajectory, deduped by concept across kinds. Derived from the
  // merged boards rather than digest.movers, which in a sparse window is dominated
  // by new entrants (those are surfaced separately under Just Surfaced, so the brief
  // does not say the same thing twice).
  const movers = [];
  const seenMover = new Set();
  for (const e of [...entities]
    .filter((e) => !e.outlier?.new_entrant)
    .sort((a, b) => Math.abs((b.momentum ?? 100) - 100) - Math.abs((a.momentum ?? 100) - 100))) {
    if (seenMover.has(e.id)) continue;
    seenMover.add(e.id);
    movers.push(e);
    if (movers.length >= 6) break;
  }

  // Just Surfaced: new entrants across all three kinds (the plane omits them, they
  // have no trajectory). Dedupe by id; a concept can surface on more than one board.
  const surfaced = [];
  const seen = new Set();
  for (const e of entities) {
    if (e.outlier?.new_entrant && !seen.has(e.id)) {
      seen.add(e.id);
      surfaced.push(e);
    }
  }

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
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p className="lede">{SITE.description}</p>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span ref={switcherRef} style={{ display: "inline-flex" }}>
          <HorizonSwitch value={horizon} onChange={setHorizon} />
        </span>
        <span className="muted">
          What is new in the past <strong>{h.label.toLowerCase()}</strong>.
        </span>
        {synthetic && (
          <span className="synthetic-ribbon" title="Placeholder data until the live worker runs">
            demo data
          </span>
        )}
        {digest?.generated && (
          <span className="faint mono" style={{ marginLeft: "auto" }}>updated {digest.generated}</span>
        )}
      </div>

      {breakout && (
        <Link to={`/technique/${breakout.id}`} className="breakout">
          <span className="breakout-tag">Breaking out</span>
          <strong>{breakout.label}</strong>
          <span className="faint mono">
            {getKind(breakout.kind)?.singular} · momentum {breakout.momentum} · attention {breakout.attention}
          </span>
        </Link>
      )}

      <Briefing horizon={horizon} />

      <section className="card">
        <div className="card-head">
          <h2>Relative Rotation</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>Mansfield Relative Performance (1979)</span>
        </div>
        <QuadrantLegend />
        <div className="dash-main" style={{ marginTop: 16 }}>
          <div className="dash-plane">
            {attnError ? (
              <LoadError label="Rotation plane" />
            ) : anyAttn ? (
              <UnifiedRotationChart entities={entities} />
            ) : (
              <div className="empty">
                <strong>Rotation plane</strong>
                {attnLoading ? "Loading…" : "Awaiting ingestion."}
              </div>
            )}
          </div>

          <div className="dash-brief">
            <div className="brief-block">
              <div className="brief-head"><span className="eyebrow">Top Movers</span></div>
              {attnError ? (
                <LoadError label="Top movers" />
              ) : movers.length ? (
                <ul className="leaders">
                  {movers.map((m) => (
                    <li key={m.id}>
                      <span className="dot" style={{ background: `var(${quadrantOf(m.quadrant).colorVar})` }} />
                      <span className="lead-label" title={`${m.quadrant} · ratio ${m.ratio} · momentum ${m.momentum}`}>
                        <Link to={`/technique/${m.id}`}>{m.label}</Link>
                      </span>
                      <Sparkline values={m.sparkline} stroke={`var(${quadrantOf(m.quadrant).colorVar})`} />
                      <span className="mono">m {m.momentum}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="faint" style={{ margin: 0 }}>{attnLoading ? "Loading…" : "No strong movers this window."}</p>
              )}
            </div>

            <div className="brief-block">
              <div className="brief-head"><span className="eyebrow">Breaking Out</span></div>
              {digestError ? (
                <LoadError label="Breakouts and new entrants" />
              ) : digest?.outliers?.length ? (
                <ul className="feed">
                  {digest.outliers.map((o, i) => {
                    const kind = getKind(o.kind);
                    return (
                      <li key={i}>
                        <span className="dot" style={{ background: `var(${quadrantOf(o.quadrant).colorVar})` }} />
                        <span className="lead-label">
                          <Link to={`/technique/${o.id}`}>{o.label}</Link>
                        </span>
                        {kind && <span className={`badge ${kind.badgeClass}`}>{kind.singular}</span>}
                        <Reasons outlier={o.outlier} />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="faint" style={{ margin: 0 }}>{digestLoading ? "Loading…" : "No breakouts this window."}</p>
              )}
            </div>

            {surfaced.length > 0 && (
              <div className="brief-block">
                <div className="brief-head"><span className="eyebrow">Just Surfaced</span></div>
                <p className="just-surfaced">
                  {surfaced.map((e) => (
                    <Link key={e.id} to={`/technique/${e.id}`} className="surfaced-item">
                      {e.label}
                    </Link>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
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
          <h2>What Is New</h2>
          <span className="eyebrow" style={{ marginLeft: "auto" }}>past {h.label.toLowerCase()}</span>
        </div>
        {digestError ? (
          <LoadError label={`New in the past ${h.label.toLowerCase()}`} />
        ) : digest?.new_items?.length ? (
          <div className="grid cols-2">
            {digest.new_items.map((it, i) => (
              <ItemCard key={it.id || i} item={it} linkConcepts />
            ))}
          </div>
        ) : (
          <div className="empty"><strong>New in the past {h.label.toLowerCase()}</strong>{digestLoading ? "Loading…" : "Awaiting ingestion."}</div>
        )}
      </section>
    </div>
  );
}
