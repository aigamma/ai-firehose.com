import { useState, useEffect, useCallback, useRef } from "react";

// Persistence for the returning-visitor layer. Two localStorage keys:
//   aifh:lastVisit  - ms epoch of the previous visit. Read ONCE on mount (so it
//                     reflects the last time, not this time), then re-stamped to
//                     "now" only when the reader leaves (tab hidden or unmount), so
//                     this whole session's items keep reading as new.
//   aifh:read:v1    - the set of cleared item keys (capped so it cannot grow without
//                     bound), cross-tab synced like useSrs.
// This hook is the impure boundary that owns Date.now(); the pure date and set math
// lives in src/lib/seen.js.

const VISIT_KEY = "aifh:lastVisit";
const READ_KEY = "aifh:read:v1";
const READ_CAP = 800;

function readNumber(key) {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function readArray(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : null;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function useSeen() {
  // The previous visit's timestamp, captured once before we overwrite it. 0 means
  // no prior visit (a first-ever load), which the seen helpers treat as "no baseline".
  const [lastVisit] = useState(() => readNumber(VISIT_KEY));

  // Stamp "now" when the reader leaves, so the next visit compares against this one.
  useEffect(() => {
    const stamp = () => {
      try {
        window.localStorage.setItem(VISIT_KEY, String(Date.now()));
      } catch {
        /* storage unavailable (private mode): degrade silently */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stamp();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stamp();
    };
  }, []);

  const [read, setRead] = useState(() => new Set(readArray(READ_KEY)));

  // Cross-tab sync: another tab clearing an item is reflected here.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (e) => {
      if (e.key === READ_KEY) setRead(new Set(readArray(READ_KEY)));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((set) => {
    try {
      let arr = [...set];
      if (arr.length > READ_CAP) arr = arr.slice(arr.length - READ_CAP);
      window.localStorage.setItem(READ_KEY, JSON.stringify(arr));
    } catch {
      /* storage unavailable: keep the in-memory set, lose only persistence */
    }
  }, []);

  const toggleRead = useCallback(
    (key) => {
      if (!key) return;
      setRead((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markRead = useCallback(
    (key) => {
      if (!key) return;
      setRead((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Mark or clear a whole batch of keys at once (the "mark all read" / "show again"
  // shortcuts on a window's wire). One write instead of N.
  const setBatch = useCallback(
    (keys, value) => {
      const ks = (Array.isArray(keys) ? keys : []).filter(Boolean);
      if (!ks.length) return;
      setRead((prev) => {
        const next = new Set(prev);
        for (const k of ks) {
          if (value) next.add(k);
          else next.delete(k);
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { lastVisit, read, toggleRead, markRead, setBatch };
}
