// Pure logic for the spaced-repetition scheduler (an SM-2-lite). Kept free of React,
// of localStorage, and of any wall-clock read (no Date.now, no new Date): every
// function takes the current time as `nowMs` so it is fully deterministic and
// unit-testable. The useSrs hook owns persistence and is the one impure boundary that
// captures Date.now; these functions own the interval math, the due math, and the
// defensive pruning. This mirrors the lens split (src/lib/lens.js plus useLens.js):
// the durable glossary is the enduring asset, and this scheduler is its daily-return
// loop, so the logic that decides what a reader sees next lives here, checkable.

const DAY_MS = 86400000;
const AGAIN_MS = 60000; // an "again" card returns this session, in about a minute.

const EASE_START = 2.5;
const EASE_FLOOR = 1.3;

// Clamp an ease factor to the SM-2 floor. A card never drops below 1.3, so a
// chronically hard concept still leaves the short-interval churn eventually.
function clampEase(ease) {
  const e = typeof ease === "number" && Number.isFinite(ease) ? ease : EASE_START;
  return Math.max(EASE_FLOOR, e);
}

// A fresh card: due immediately (due === nowMs), no interval, default ease, no history.
// Garbage or missing input anywhere in this module is funneled back through here, so a
// corrupt stored state is simply treated as a never-seen card rather than throwing.
export function newCard(id, nowMs) {
  const t = typeof nowMs === "number" && Number.isFinite(nowMs) ? nowMs : 0;
  return { id, due: t, interval: 0, ease: EASE_START, reps: 0, lapses: 0 };
}

// Coerce a possibly-missing or malformed stored state into a well-formed card. Any
// field that is absent or non-finite falls back to the fresh-card default, which keeps
// gradeCard total: it can never read NaN out of a damaged store.
function normalize(state, id, nowMs) {
  const base = newCard(state && state.id != null ? state.id : id, nowMs);
  if (!state || typeof state !== "object") return base;
  const num = (v, d) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  return {
    id: state.id != null ? state.id : base.id,
    due: num(state.due, base.due),
    interval: num(state.interval, base.interval),
    ease: clampEase(num(state.ease, base.ease)),
    reps: num(state.reps, base.reps),
    lapses: num(state.lapses, base.lapses),
  };
}

// Grade a card and return its next state. `grade` is one of
// "again" | "hard" | "good" | "easy". The scheduler is SM-2-lite:
//   again: a lapse. reps reset low, lapses + 1, ease - 0.20, interval back toward 0,
//          and the card is due again this session (about a minute out) so the reader
//          re-sees it before the session ends.
//   hard:  ease - 0.15, interval grows gently (max(1, interval * 1.2)), due in `interval` days.
//   good:  ease unchanged. First success is a 1-day interval; later successes
//          multiply by ease. Due in `interval` days.
//   easy:  ease + 0.15, a bigger jump (4 days from new, else interval * ease * 1.3).
// Ease is always clamped to >= 1.3. `due` is always nowMs + interval days, except
// `again`, which is nowMs + ~60000 ms. An unknown grade is treated as "good".
export function gradeCard(state, grade, nowMs) {
  const t = typeof nowMs === "number" && Number.isFinite(nowMs) ? nowMs : 0;
  const cur = normalize(state, state && state.id, t);

  if (grade === "again") {
    return {
      ...cur,
      reps: 0,
      lapses: cur.lapses + 1,
      ease: clampEase(cur.ease - 0.2),
      interval: 0,
      due: t + AGAIN_MS,
    };
  }

  let { ease, interval, reps } = cur;

  if (grade === "hard") {
    ease = clampEase(ease - 0.15);
    interval = Math.max(1, interval * 1.2);
  } else if (grade === "easy") {
    ease = clampEase(ease + 0.15);
    interval = reps === 0 ? 4 : interval * ease * 1.3;
  } else {
    // "good" (and any unrecognized grade, treated as good).
    ease = clampEase(ease);
    interval = reps === 0 ? 1 : interval * ease;
  }

  reps = reps + 1;

  return {
    ...cur,
    ease,
    interval,
    reps,
    due: t + interval * DAY_MS,
  };
}

// The ids of cards that are due at nowMs (due <= nowMs), soonest-due first. A tracked
// state with a malformed `due` is normalized to due-now, so a corrupt entry surfaces
// for review rather than hiding forever.
export function selectDue(states, nowMs) {
  const t = typeof nowMs === "number" && Number.isFinite(nowMs) ? nowMs : 0;
  const map = states && typeof states === "object" ? states : {};
  const out = [];
  for (const id of Object.keys(map)) {
    const due = normalize(map[id], id, t).due;
    if (due <= t) out.push({ id, due });
  }
  out.sort((a, b) => a.due - b.due);
  return out.map((x) => x.id);
}

// How many tracked cards are due at nowMs. The cheap signal another surface (the Home
// page nudge: "N cards due in Review") reads from the same store without building a deck.
export function dueCount(states, nowMs) {
  return selectDue(states, nowMs).length;
}

// Drop any tracked state whose id is not a live concept (the glossary slugs churn as the
// taxonomy is rebuilt). Returns a new object, leaving the input untouched. Defensive in
// the same spirit as the lens pruning its follow set.
export function pruneStates(states, validIdSet) {
  const map = states && typeof states === "object" ? states : {};
  const valid =
    validIdSet instanceof Set ? validIdSet : new Set(Array.isArray(validIdSet) ? validIdSet : []);
  const out = {};
  for (const id of Object.keys(map)) {
    if (valid.has(id)) out[id] = map[id];
  }
  return out;
}
