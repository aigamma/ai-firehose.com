import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KINDS } from "../data/registry.js";
import ItemCard from "./ItemCard.jsx";

// Local discovery seeds. Kept here (not in the registry) on purpose: these are a
// presentation aid for the search box, not a structural constant of the corpus.
const SEEDS = [
  "agentic coding",
  "retrieval augmented generation",
  "mixture of experts",
  "context windows",
  "model evaluation",
  "inference acceleration",
];

// Live semantic search over the corpus. Calls /api/retrieve (the Netlify
// function): Pinecone dense retrieve plus a Voyage rerank. In plain `npm run dev`
// there is no function, so it fails gracefully into the error state.
//
// The query is mirrored into the URL (?q=) so a search is shareable and
// deep-linkable; the kind facet filters the already-returned results in the
// client and never re-issues the network request.
export default function SemanticSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const [facet, setFacet] = useState(""); // client-side kind filter, "" = all
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  // The query actually behind `results`, so a retry re-runs the right term even
  // after the user has typed something new into the box.
  const [activeQuery, setActiveQuery] = useState("");

  // One in-flight request at a time: a new search aborts the prior one, and an
  // unmount aborts whatever is open. Held in a ref so it survives re-renders.
  const abortRef = useRef(null);
  // Guards the deep-link auto-run so it fires at most once, on first mount.
  const didAutoRun = useRef(false);

  const run = async (query) => {
    const term = (query ?? q).trim();
    if (!term) return;

    // Abort any prior request before starting a new one.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);
    setActiveQuery(term);
    // Reflect the live query in the URL so the search is shareable. replace so
    // each keystroke-driven search does not stack history entries.
    setSearchParams({ q: term }, { replace: true });

    try {
      const r = await fetch(`/api/retrieve?q=${encodeURIComponent(term)}`, { signal: controller.signal });
      if (!r.ok) throw new Error(`search unavailable (HTTP ${r.status})`);
      const j = await r.json();
      setResults(j.results || []);
    } catch (e2) {
      // An abort is an expected, silent cancellation, not a failure to surface.
      if (e2.name === "AbortError") return;
      setErr(e2.message);
      setResults(null);
    } finally {
      // Only the most recent request should clear the spinner; a late-aborted
      // one must not flip loading off under a newer in-flight request.
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  };

  // On first mount, if the URL carries ?q=, run that search once.
  useEffect(() => {
    if (didAutoRun.current) return;
    didAutoRun.current = true;
    const initial = (searchParams.get("q") || "").trim();
    if (initial) run(initial);
    // Intentionally mount-only: deep-link auto-run is a one-shot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abort the open request when the component unmounts.
  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  // The kind facet filters in the client. Counts drive the facet labels and let
  // us tell "no results at all" apart from "the filter hid them".
  const counts = useMemo(() => {
    const c = { "": results?.length || 0 };
    for (const k of KINDS) c[k.key] = 0;
    for (const x of results || []) if (x.kind in c) c[x.kind] += 1;
    return c;
  }, [results]);

  const shown = useMemo(
    () => (results || []).filter((x) => !facet || x.kind === facet),
    [results, facet],
  );

  const hasResults = Array.isArray(results);
  const filteredOut = hasResults && results.length > 0 && shown.length === 0;

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); run(); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="search"
          style={{ flex: "1 1 260px", width: "auto" }}
          aria-label="Search the corpus by meaning"
          placeholder="Search the corpus by meaning, for example: agents that browse the web"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" type="submit">Search</button>
      </form>

      {/* Discovery seeds, shown until a search has produced results. */}
      {!hasResults && !loading && (
        <div className="chips" style={{ marginTop: 10 }} aria-label="Suggested searches">
          {SEEDS.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => { setQ(ex); run(ex); }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Client-side kind facet: only meaningful once results are in. */}
      {hasResults && results.length > 0 && (
        <div className="segmented" role="group" aria-label="Filter results by kind" style={{ marginTop: 12 }}>
          <button type="button" aria-pressed={facet === ""} onClick={() => setFacet("")}>
            All ({counts[""]})
          </button>
          {KINDS.map((k) => (
            <button key={k.key} type="button" aria-pressed={facet === k.key} onClick={() => setFacet(k.key)}>
              {k.singular} ({counts[k.key]})
            </button>
          ))}
        </div>
      )}

      {loading && <p className="muted" style={{ marginTop: 12 }} role="status">Searching…</p>}

      {err && !loading && (
        <div role="alert" style={{ marginTop: 12 }}>
          <p className="faint" style={{ margin: "0 0 8px" }}>
            Search failed: {err}. Live search runs on the deployed site or via netlify dev.
          </p>
          <button className="btn" type="button" onClick={() => run(activeQuery || q)}>Retry</button>
        </div>
      )}

      {!loading && !err && hasResults && results.length === 0 && (
        <p className="muted" style={{ marginTop: 12 }}>No results for this query.</p>
      )}

      {!loading && !err && filteredOut && (
        <p className="muted" style={{ marginTop: 12 }}>No results match the current filter.</p>
      )}

      {!loading && !err && shown.length > 0 && (
        <div className="stack" style={{ marginTop: 12 }}>
          {shown.map((x, i) => (
            <ItemCard key={`${x.url || x.title}-${i}`} item={x} />
          ))}
        </div>
      )}
    </div>
  );
}
