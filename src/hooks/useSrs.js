import { useCallback, useEffect, useState } from "react";
import { gradeCard, newCard, dueCount as countDue, pruneStates } from "../lib/srs.js";

// A localStorage-backed spaced-repetition store: the per-concept scheduler state that
// turns the durable glossary into a daily-return loop. No account, no backend. This
// hook is the one impure boundary, mirroring useLens.js: it owns persistence (lazy init
// from storage, write-through on every change, cross-tab sync via the storage event,
// SSR-safe typeof guards) and it is where Date.now() is captured. The interval math
// itself stays pure in src/lib/srs.js, so every scheduling decision is unit-testable.
// Other surfaces (the Home page nudge: "N cards due in Review") can read the same store
// through dueCount without building a deck.
const KEY = "aifh:srs:v1";

function read() {
  if (typeof localStorage === "undefined") return { cards: {} };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { cards: v && typeof v.cards === "object" && v.cards ? v.cards : {} };
  } catch {
    return { cards: {} };
  }
}

export default function useSrs() {
  const [store, setStore] = useState(read);

  // Persist on every change; swallow quota or private-mode write failures.
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      /* storage unavailable; the scheduler still works for this session */
    }
  }, [store]);

  // Keep other tabs in sync: grading in one tab updates the deck in another.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (e) => {
      if (e.key === KEY) setStore(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Grade a card by id. Captures the wall clock here (the impure boundary) and hands a
  // fixed nowMs to the pure scheduler. An untracked id starts from a fresh card, so the
  // first grade on a brand-new concept schedules it correctly.
  const grade = useCallback((id, g) => {
    if (!id) return;
    const now = Date.now();
    setStore((s) => {
      const prev = s.cards[id] || newCard(id, now);
      return { ...s, cards: { ...s.cards, [id]: gradeCard(prev, g, now) } };
    });
  }, []);

  // How many tracked cards are due right now. If validIds is given, count only the due
  // cards that are still live concepts (so a nudge never counts a churned slug).
  const dueCount = useCallback(
    (validIds) => {
      const now = Date.now();
      if (validIds) {
        const valid = validIds instanceof Set ? validIds : new Set(validIds);
        return countDue(pruneStates(store.cards, valid), now);
      }
      return countDue(store.cards, now);
    },
    [store.cards]
  );

  // Drop scheduler state for ids that are no longer live concepts (glossary slug churn).
  // A no-op write is avoided so this can run on load without thrashing storage.
  const prune = useCallback((validIdSet) => {
    setStore((s) => {
      const next = pruneStates(s.cards, validIdSet);
      if (Object.keys(next).length === Object.keys(s.cards).length) return s;
      return { ...s, cards: next };
    });
  }, []);

  return { states: store.cards, grade, dueCount, prune };
}
