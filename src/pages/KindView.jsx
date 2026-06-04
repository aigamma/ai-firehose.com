import { useState } from "react";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import TrendBoard from "../components/TrendBoard.jsx";
import useData from "../lib/useData.js";
import LoadError from "../components/LoadError.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind, DEFAULT_HORIZON, getHorizon } from "../data/registry.js";

// Per-kind deep view: the full trend heat board for one kind (Techniques, Tools, or
// Opinions) at the chosen horizon, ranked by how much attention each topic gained or
// lost versus the equally long window before it.
export default function KindView({ kindKey }) {
  const kind = getKind(kindKey);
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const h = getHorizon(horizon);
  const { data, loading, error } = useData(`/data/attention/${kindKey}_${horizon}.json`);
  const entities = data?.entities || [];
  useDocumentTitle(kind?.label);
  if (!kind) return null;

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>
        <span className={`badge ${kind.badgeClass}`}>
          <span className="dot" style={{ background: `var(${kind.accentVar})` }} />
          {kind.label}
        </span>
      </h1>
      <p className="lede muted">
        Ranked by {kind.entity}: how much attention each gained or lost over the past {h.label.toLowerCase()} versus
        the {h.label.toLowerCase()} before. The bar is current attention, the number is the change.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <HorizonSwitch value={horizon} onChange={setHorizon} />
        <span className="faint mono">growth vs the prior {h.label.toLowerCase()}</span>
      </div>

      {error ? (
        <LoadError label={kind.label} />
      ) : entities.length ? (
        <section className="card" style={{ "--tile-accent": `var(${kind.accentVar})` }}>
          <div className="card-head">
            <h2>What Is Trending</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>{entities.length} entities</span>
          </div>
          <TrendBoard kind={kind} entities={entities} showHead={false} />
        </section>
      ) : (
        <div className="empty">
          <strong>{kind.label}</strong>
          {loading ? "Loading…" : `Awaiting ingestion for the past ${h.label.toLowerCase()}.`}
        </div>
      )}
    </div>
  );
}
