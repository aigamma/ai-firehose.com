import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="stack" style={{ paddingTop: 56, textAlign: "center" }}>
      <h1>Not Found</h1>
      <p className="muted">That page is not part of the firehose.</p>
      <p>
        <Link to="/">Dashboard</Link> &middot; <Link to="/glossary">Glossary</Link> &middot;{" "}
        <Link to="/explore">Explore</Link>
      </p>
    </div>
  );
}
