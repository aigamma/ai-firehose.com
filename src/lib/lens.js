// Pure logic for the personalization lens (the "bottled just for you" layer). Kept
// free of React and localStorage so it is unit-testable and reusable across surfaces:
// the useLens hook owns persistence, while these functions own the set math and the
// filtering that the daily brief and the trend boards will apply to a reader's follows.

// Add or remove a concept id from the follow set, returning a new array (immutable).
export function toggleFollow(follows, id) {
  const set = Array.isArray(follows) ? follows : [];
  return set.includes(id) ? set.filter((x) => x !== id) : [...set, id];
}

// The concept ids an item touches. Items carry concepts as an array of slugs or of
// { slug } objects (the citation and hub shape); a bare concept record is itself, by id.
export function conceptIdsOf(item) {
  if (!item) return [];
  if (Array.isArray(item.concepts)) {
    return item.concepts.map((c) => (typeof c === "string" ? c : c && (c.slug || c.id))).filter(Boolean);
  }
  return item.id ? [item.id] : [];
}

// Narrow a list to the items that touch at least one followed concept. An empty lens
// returns the list unchanged, so the full view is always the default and the lens only
// ever narrows. This is the seam Home will use to show a reader "your slice".
export function filterByLens(items, follows) {
  const list = Array.isArray(items) ? items : [];
  const set = new Set(Array.isArray(follows) ? follows : []);
  if (!set.size) return list;
  return list.filter((it) => conceptIdsOf(it).some((id) => set.has(id)));
}
