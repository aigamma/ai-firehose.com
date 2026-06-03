import { useMemo } from "react";
import useData from "./useData.js";
import { KINDS } from "../data/registry.js";

// Fetch all three per-kind attention boards for a horizon and merge them into one
// kind-tagged entity list for the unified rotation plane. KINDS is a fixed-length
// module constant, so calling useData once per kind keeps a stable hook order.
// Aggregate states: a hard error only when ALL three fail (a single missing board
// still renders the others); `anyData` is true once any board has loaded, which is
// the signal to render the plane instead of the awaiting-ingestion empty box.
export default function useUnifiedAttention(horizon) {
  const boards = KINDS.map((k) => {
    const { data, loading, error } = useData(`/data/attention/${k.key}_${horizon}.json`);
    return { kind: k.key, data, loading, error };
  });

  const entities = useMemo(() => {
    const out = [];
    for (const b of boards) {
      for (const e of b.data?.entities || []) out.push(e.kind ? e : { ...e, kind: b.kind });
    }
    return out;
    // boards is rebuilt each render but its data refs are stable, and KINDS has a
    // fixed length so this dependency array is always the same size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, boards.map((b) => b.data));

  const loading = boards.some((b) => b.loading);
  const error = boards.every((b) => b.error) ? boards[0].error : null;
  const anyData = boards.some((b) => b.data);
  return { entities, loading, error, anyData };
}
