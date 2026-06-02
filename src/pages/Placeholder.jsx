import { Link } from "react-router-dom";

// Honest placeholder for surfaces that arrive in later phases. The scaffold and
// the steering harness are real; these views are not built yet.
export default function Placeholder({ title, phase, notFound }) {
  return (
    <div className="stack" style={{ paddingTop: 40 }}>
      <h1>{title}</h1>
      {notFound ? (
        <p className="muted">
          That page does not exist. Head back to the <Link to="/">dashboard</Link>.
        </p>
      ) : (
        <div className="empty">
          <strong>Under construction</strong>
          This surface arrives in {phase}. The scaffold, registry, and steering harness are in place.
        </div>
      )}
    </div>
  );
}
