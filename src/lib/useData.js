import { useEffect, useState } from "react";

// Fetch a precomputed JSON artifact from /data. Three states are kept distinct:
//   - error: a network or HTTP (non-404) failure. Surfaced so the UI can show an
//     honest "Unable to load" message.
//   - data === null with no error: the artifact does not exist yet. This is the
//     honest "awaiting ingestion" empty state before the worker runs. It covers
//     both a literal 404 and the Netlify SPA fallback (netlify.toml rewrites a
//     missing /data/*.json to /index.html with HTTP 200), which we detect by a
//     non-JSON content type or a body that fails to JSON-parse, so a missing
//     artifact reads as empty rather than crashing on parsed HTML.
//   - data: the parsed artifact.
//
// A module-level cache keyed on path means repeat navigations resolve
// synchronously from memory instead of refetching the large static artifacts
// (clusters, spectrums are each tens to hundreds of KB).
// Concurrent identical fetches are deduped through an in-flight-promise map.
const cache = new Map();
const inflight = new Map();

function load(path) {
  if (cache.has(path)) return Promise.resolve(cache.get(path));
  if (inflight.has(path)) return inflight.get(path);
  const p = fetch(path)
    .then((r) => {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      // A missing artifact can return 200 via the Netlify SPA fallback, serving
      // index.html instead of JSON. Treat a non-JSON content type as the same
      // "does not exist yet" empty case a 404 produces.
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return null;
      // Even with a JSON content type, fall back to empty rather than error if
      // the body does not actually parse (a truncated or HTML response).
      return r.text().then((body) => {
        try {
          return JSON.parse(body);
        } catch {
          return null;
        }
      });
    })
    .then((data) => {
      cache.set(path, data);
      inflight.delete(path);
      return data;
    })
    .catch((err) => {
      inflight.delete(path);
      throw err;
    });
  inflight.set(path, p);
  return p;
}

export default function useData(path) {
  // Seed from cache synchronously so a revisit paints with no loading flash.
  const [state, setState] = useState(() =>
    cache.has(path)
      ? { data: cache.get(path), loading: false, error: null }
      : { data: null, loading: true, error: null }
  );

  useEffect(() => {
    let alive = true;
    if (cache.has(path)) {
      // Already resolved: settle immediately, no network.
      setState({ data: cache.get(path), loading: false, error: null });
      return () => {
        alive = false;
      };
    }
    // On a path change keep any previously loaded data visible to avoid a blank
    // flash; only flip to loading and clear a stale error.
    setState((s) => ({ data: s.data, loading: true, error: null }));
    load(path)
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        // Keep prior data on screen, but surface the error distinctly.
        if (alive) setState((s) => ({ data: s.data, loading: false, error }));
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
