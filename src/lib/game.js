// Pure gamification logic over the spaced-repetition deck and the durable glossary. Like
// src/lib/srs.js, it reads no wall clock and no storage: every function takes nowMs or a
// day string, so the XP curve, level math, streak rollover, mastery counts, and achievement
// checks are deterministic and unit-testable. The useGame hook owns persistence and is the
// one impure boundary that captures Date.now. This turns "learn the field" into a game: XP
// and levels for reviewing, a daily streak, mastery toward the whole glossary, per-category
// mastery, and an achievements wall, all client-side (no backend, no account).

// A card whose interval has grown to this many days is treated as "mastered" (a mature card
// in SM-2 terms): you have recalled it enough that the scheduler now spaces it weeks apart.
export const MATURE_INTERVAL_DAYS = 21;

// XP for one review, by grade. A correct recall is worth more than a lapse, and a brand-new
// concept gives a small first-seen bonus, so exploring the glossary is itself rewarded.
export function xpFor(grade, isNew = false) {
  const base = { again: 2, hard: 8, good: 10, easy: 12 }[grade] ?? 10;
  return base + (isNew ? 5 : 0);
}

// Level from cumulative XP on a gentle quadratic curve: level L begins at 50 * (L-1)^2 XP,
// so early levels come fast and later ones cost more. Returns the level and the progress
// into it (for a progress bar) plus the XP remaining to the next level.
export function levelFor(xp) {
  const x = Math.max(0, Number(xp) || 0);
  const level = Math.floor(Math.sqrt(x / 50)) + 1;
  const start = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return { level, xp: x, into: x - start, span: next - start, toNext: next - x };
}

// The local day string (YYYY-MM-DD) for a timestamp, in the reader's own timezone, so the
// streak rolls over at their midnight rather than UTC's.
export function dayKey(nowMs) {
  const d = new Date(typeof nowMs === "number" && Number.isFinite(nowMs) ? nowMs : 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prevDayKey(today) {
  const [y, m, d] = String(today).split("-").map(Number);
  const dt = new Date(y || 1970, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// Advance a streak given the day of a review. Same day: unchanged. The next day: +1. A gap
// of more than one day: resets to 1. Tracks the longest run ever seen.
export function updateStreak(streak, today) {
  const s = streak && typeof streak === "object" ? streak : {};
  const cur = Math.max(0, Number(s.current) || 0);
  const longest = Math.max(0, Number(s.longest) || 0);
  if (s.lastDay === today) {
    const c = Math.max(1, cur);
    return { current: c, longest: Math.max(longest, c), lastDay: today };
  }
  const current = s.lastDay === prevDayKey(today) ? cur + 1 : 1;
  return { current, longest: Math.max(longest, current), lastDay: today };
}

// Mastery over the deck: how many tracked concepts are mature (interval >= the threshold and
// not removed), overall and per category. `concepts` is the glossary index ([{id, category}]).
export function masteryStats(srsStates, concepts = []) {
  const states = srsStates && typeof srsStates === "object" ? srsStates : {};
  const catOf = new Map();
  const byCategory = {};
  for (const c of concepts) {
    const cat = c.category || "Uncategorized";
    catOf.set(c.id, cat);
    byCategory[cat] = byCategory[cat] || { mastered: 0, total: 0 };
    byCategory[cat].total += 1;
  }
  let mastered = 0;
  for (const [id, st] of Object.entries(states)) {
    if (!st || st.removed) continue;
    if ((Number(st.interval) || 0) >= MATURE_INTERVAL_DAYS) {
      mastered += 1;
      const cat = catOf.get(id);
      if (cat && byCategory[cat]) byCategory[cat].mastered += 1;
    }
  }
  return { mastered, total: concepts.length, byCategory };
}

// The achievement catalog. Each predicate reads a context (computed from the game store plus
// the derived mastery), so the same context yields the same unlocked set.
export const ACHIEVEMENTS = [
  { id: "first", label: "First Card", desc: "Review your first flashcard.", check: (c) => c.totalReviews >= 1 },
  { id: "hundred", label: "Century", desc: "Review 100 cards.", check: (c) => c.totalReviews >= 100 },
  { id: "thousand", label: "Marathon", desc: "Review 1,000 cards.", check: (c) => c.totalReviews >= 1000 },
  { id: "streak7", label: "Week Streak", desc: "Review seven days in a row.", check: (c) => c.streak >= 7 },
  { id: "streak30", label: "Month Streak", desc: "Review thirty days in a row.", check: (c) => c.streak >= 30 },
  { id: "level5", label: "Adept", desc: "Reach level 5.", check: (c) => c.level >= 5 },
  { id: "level10", label: "Scholar", desc: "Reach level 10.", check: (c) => c.level >= 10 },
  { id: "mastered50", label: "Grounded", desc: "Master 50 concepts.", check: (c) => c.mastered >= 50 },
  { id: "mastered250", label: "Fluent", desc: "Master 250 concepts.", check: (c) => c.mastered >= 250 },
  { id: "category", label: "Category Master", desc: "Master every concept in a category.", check: (c) => c.categoryDone },
];

// Which achievement ids the context satisfies that are not already unlocked.
export function newlyUnlocked(ctx, unlocked = {}) {
  const c = ctx || {};
  return ACHIEVEMENTS.filter((a) => a.check(c) && !unlocked[a.id]).map((a) => a.id);
}
