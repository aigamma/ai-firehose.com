import { useEffect, useState } from "react";

// Fetch a precomputed JSON artifact from /data. A 404 returns null data rather
// than an error, so the scaffold can render honest "awaiting ingestion" empty
// states before the worker has ever run.
export default function useData(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState({ data: null, loading: true, error: null });
    fetch(path)
      .then((r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (alive) setState({ data: null, loading: false, error });
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}
