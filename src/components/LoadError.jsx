// A distinct load-failure notice, visually separate from the dashed ".empty"
// awaiting-ingestion box, so a real error is never read as "no data yet".
// Shared so every page surfaces a fetch error identically (matches the inline
// version that originated in Home.jsx and Explore.jsx).
export default function LoadError({ label }) {
  return (
    <div
      role="alert"
      style={{
        border: "1px solid var(--q-lagging)",
        borderLeftWidth: 3,
        borderRadius: "var(--radius)",
        padding: 16,
        color: "var(--muted)",
        background: "color-mix(in oklab, var(--q-lagging) 8%, transparent)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>{label}</strong>
      Unable to load. Retry shortly.
    </div>
  );
}
