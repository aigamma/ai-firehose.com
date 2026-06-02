import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import RotationBoard from "../components/RotationBoard.jsx";
import Constellation from "../components/Constellation.jsx";
import useData from "../lib/useData.js";
import { SITE, KINDS, HORIZONS, QUADRANTS, DEFAULT_HORIZON, getHorizon, getKind } from "../data/registry.js";

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
  const { data: digest } = useData(`/data/digests/${horizon}.json`);
  const { data: constellation } = useData(`/data/constellation.json`);
  const synthetic = digest?.synthetic || constellation?.synthetic;
  const breakout = digest?.outliers?.[0] || digest?.movers?.[0];

  // Arrow keys cycle the horizon (Day to Quarter), unless typing in a field.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.matches?.("input, select, textarea")) return;
      const i = HORIZONS.findIndex((x) => x.key === horizon);
      if (e.key === "ArrowRight" && i < HORIZONS.length - 1) setHorizon(HORIZONS[i + 1].key);
      if (e.key === "ArrowLeft" && i > 0) setHorizon(HORIZONS[i - 1].key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [horizon]);

  return (
    <div className="stack">
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p className="lede">{SITE.description}</p>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <HorizonSwitch value={horizon} onChange={setHorizon} />
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

      <section className="card">
        <div className="card-head">
          <h2>Relative Rotation</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>Mansfield Relative Performance (1979)</span>
        </div>
        <QuadrantLegend />
        <div className="grid cols-3" style={{ marginTop: 16 }}>
          {KINDS.map((k) => (
            <RotationBoard key={k.key} kindKey={k.key} horizon={horizon} />
          ))}
        </div>
      </section>

      <div className="grid cols-2">
        <section className="card">
          <div className="card-head">
            <h2>Constellation</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>idea-space map</span>
          </div>
          {constellation?.points ? (
            <>
              <Constellation points={constellation.points} />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
                {KINDS.map((k) => (
                  <span key={k.key} className={`badge ${k.badgeClass}`}>
                    <span className="dot" style={{ background: `var(${k.accentVar})` }} />
                    {k.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty"><strong>Idea-space map</strong>Awaiting ingestion.</div>
          )}
        </section>

        <section className="card">
          <div className="card-head"><h2>Outliers</h2></div>
          {digest?.outliers?.length ? (
            <ul className="feed">
              {digest.outliers.map((o, i) => {
                const kind = getKind(o.kind);
                return (
                  <li key={i}>
                    <span className="dot" style={{ background: `var(${QUADRANTS[o.quadrant].colorVar})` }} />
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
            <div className="empty"><strong>Breakouts and new entrants</strong>Awaiting ingestion.</div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>What Is New</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>past {h.label.toLowerCase()}</span>
        </div>
        {digest?.new_items?.length ? (
          <ul className="feed">
            {digest.new_items.map((it, i) => {
              const kind = getKind(it.kind);
              return (
                <li key={i} className="feed-rich">
                  <div className="feed-head">
                    {kind && (
                      <span className={`badge ${kind.badgeClass}`}>
                        <span className="dot" style={{ background: `var(${kind.accentVar})` }} />
                        {kind.singular}
                      </span>
                    )}
                    <span className="lead-label">
                      {it.url && it.url !== "#" ? (
                        <a href={it.url} target="_blank" rel="noreferrer">{it.title}</a>
                      ) : (
                        it.title
                      )}
                    </span>
                    <span className="faint mono">{it.author_or_channel || it.source}</span>
                  </div>
                  {it.concepts?.length > 0 && (
                    <div className="chips">
                      {it.concepts.slice(0, 4).map((slug) => (
                        <Link key={slug} to={`/technique/${slug}`} className="chip">
                          {slug.replace(/-/g, " ")}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty"><strong>New in the past {h.label.toLowerCase()}</strong>Awaiting ingestion.</div>
        )}
      </section>
    </div>
  );
}
