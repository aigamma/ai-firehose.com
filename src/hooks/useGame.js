import { useCallback, useEffect, useState } from "react";
import { xpFor, dayKey, updateStreak } from "../lib/game.js";

// A localStorage-backed gamification store: XP, total reviews, the daily streak, today's
// review count, and the unlocked achievements. The one impure boundary (mirrors useSrs.js
// and useSeen.js): lazy init from storage, write-through on change, cross-tab sync, SSR-safe
// guards, and the single Date.now capture. The XP/level/streak/mastery math stays pure in
// src/lib/game.js, so every gamification rule is unit-testable. No account, no backend.
const KEY = "aifh:game:v1";

function read() {
  const empty = { xp: 0, totalReviews: 0, streak: { current: 0, longest: 0, lastDay: null }, today: { date: null, count: 0 }, achievements: {} };
  if (typeof localStorage === "undefined") return empty;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      xp: Number(v.xp) || 0,
      totalReviews: Number(v.totalReviews) || 0,
      streak: v.streak && typeof v.streak === "object" ? v.streak : empty.streak,
      today: v.today && typeof v.today === "object" ? v.today : empty.today,
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

  // Record one review: award XP, count it, roll the streak, and track today's tally. The
  // wall clock is captured here and the day math handed to the pure helpers.
  const recordReview = useCallback((grade, isNew = false) => {
    const now = Date.now();
    const today = dayKey(now);
    setState((s) => ({
      ...s,
      xp: (s.xp || 0) + xpFor(grade, isNew),
      totalReviews: (s.totalReviews || 0) + 1,
      streak: updateStreak(s.streak, today),
      today: s.today?.date === today ? { date: today, count: (s.today.count || 0) + 1 } : { date: today, count: 1 },
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

  // Today's review count, reset if the stored day is stale (so a new day starts at zero
  // before the first review records).
  const todayCount = state.today?.date === dayKey(Date.now()) ? state.today.count || 0 : 0;

  return { game: state, todayCount, recordReview, unlock };
}
