import { useCallback, useEffect, useState } from "react";
import { xpFor } from "../lib/game.js";

// A localStorage-backed gamification store: XP, total reviews, and the unlocked achievements.
// The one impure boundary (mirrors useSrs.js and useSeen.js): lazy init from storage, write-
// through on change, cross-tab sync, SSR-safe guards, and the single Date.now capture. The
// XP/level/mastery math stays pure in src/lib/game.js, so every rule is unit-testable. No
// account, no backend, and deliberately no streak or daily quota (a rejected dark pattern).
const KEY = "aifh:game:v1";

function read() {
  const empty = { xp: 0, totalReviews: 0, achievements: {} };
  if (typeof localStorage === "undefined") return empty;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      xp: Number(v.xp) || 0,
      totalReviews: Number(v.totalReviews) || 0,
      achievements: v.achievements && typeof v.achievements === "object" ? v.achievements : {},
    };
  } catch {
    return empty;
  }
}

export default function useGame() {
  const [state, setState] = useState(read);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable; the session still tracks progress in memory */
    }
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (e) => {
      if (e.key === KEY) setState(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Record one review: award XP and count it. No streak and no daily quota by design.
  const recordReview = useCallback((grade, isNew = false) => {
    setState((s) => ({
      ...s,
      xp: (s.xp || 0) + xpFor(grade, isNew),
      totalReviews: (s.totalReviews || 0) + 1,
    }));
  }, []);

  // Mark achievement ids unlocked (idempotent; stamps the unlock time).
  const unlock = useCallback((ids) => {
    if (!ids || !ids.length) return;
    const now = Date.now();
    setState((s) => {
      const ach = { ...s.achievements };
      let changed = false;
      for (const id of ids) if (!ach[id]) { ach[id] = now; changed = true; }
      return changed ? { ...s, achievements: ach } : s;
    });
  }, []);

  return { game: state, recordReview, unlock };
}
