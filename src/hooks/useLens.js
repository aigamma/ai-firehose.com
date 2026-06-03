import { useCallback, useEffect, useState } from "react";

// A localStorage-backed personalization lens: the set of concepts a reader follows.
// This is the "bottled just for you" layer in its first form, with no account and no
// backend. Other surfaces (the brief, the trend boards) can read this to filter to a
// reader's interests. Cross-tab sync rides the storage event so following a concept
// in one tab updates the lens in another.
const KEY = "aifh:lens:v1";

function read() {
  if (typeof localStorage === "undefined") return { follows: [] };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { follows: Array.isArray(v.follows) ? v.follows : [] };
  } catch {
    return { follows: [] };
  }
}

export default function useLens() {
  const [lens, setLens] = useState(read);

  // Persist on every change; swallow quota or private-mode write failures.
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lens));
    } catch {
      /* storage unavailable; the lens still works for this session */
    }
  }, [lens]);

  // Keep other tabs in sync.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (e) => {
      if (e.key === KEY) setLens(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFollow = useCallback((id) => {
    setLens((l) => ({
      ...l,
      follows: l.follows.includes(id) ? l.follows.filter((x) => x !== id) : [...l.follows, id],
    }));
  }, []);
  const isFollowing = useCallback((id) => lens.follows.includes(id), [lens.follows]);
  const clearFollows = useCallback(() => setLens((l) => ({ ...l, follows: [] })), []);

  return { follows: lens.follows, toggleFollow, isFollowing, clearFollows };
}
