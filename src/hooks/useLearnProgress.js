import { useState, useEffect, useCallback } from "react";

// Per-path progress through the curated learning paths, persisted to localStorage so a
// path (an inherently multi-session commitment) remembers where the reader left off and
// gives them a concrete reason to return. Stored as a flat set of "<pathSlug>::<stepSlug>"
// keys, cross-tab synced like useSeen. The path and step slugs are validated by the
// check_glossary gate, so the keys are stable.

const KEY = "aifh:learn:v1";
const composite = (path, step) => `${path}::${step}`;

function readSet() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return new Set(Array.isArray(v) ? v : []);
  } catch {
    return new Set();
  }
}

export default function useLearnProgress() {
  const [done, setDone] = useState(readSet);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (e) => {
      if (e.key === KEY) setDone(readSet());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((set) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...set]));
    } catch {
      /* storage unavailable: keep the in-memory set */
    }
  }, []);

  const toggleStep = useCallback(
    (path, step) => {
      if (!path || !step) return;
      setDone((prev) => {
        const next = new Set(prev);
        const k = composite(path, step);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isDone = useCallback((path, step) => done.has(composite(path, step)), [done]);

  // Progress for one path: how many of its steps are done, and the index of the first
  // unfinished step (-1 when complete), which drives the "Resume" affordance.
  const pathProgress = useCallback(
    (path, steps) => {
      const list = Array.isArray(steps) ? steps : [];
      let doneCount = 0;
      let firstUnfinished = -1;
      list.forEach((s, i) => {
        if (done.has(composite(path, s))) doneCount += 1;
        else if (firstUnfinished === -1) firstUnfinished = i;
      });
      return { done: doneCount, total: list.length, firstUnfinished };
    },
    [done]
  );

  return { isDone, toggleStep, pathProgress };
}
