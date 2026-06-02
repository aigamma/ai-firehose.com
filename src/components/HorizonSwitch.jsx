import { HORIZONS } from "../data/registry.js";

// The Day / Week / Month / Quarter selector. Each horizon is a nested window
// inside the single retained quarter of data.
export default function HorizonSwitch({ value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label="Time horizon">
      {HORIZONS.map((h) => (
        <button key={h.key} aria-pressed={value === h.key} onClick={() => onChange(h.key)}>
          {h.label}
        </button>
      ))}
    </div>
  );
}
