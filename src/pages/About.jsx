import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

export default function About() {
  useDocumentTitle("About");
  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "72ch" }}>
      <h1>About</h1>
      <p>
        AI Firehose is a personal instrument for staying organized and courageous on the AI frontier, and a way
        to absorb the newest and most salient developments each day as an aspiring AI engineer.
      </p>
      <p>
        It is the third in a trilogy. <a href="https://aigamma.com" target="_blank" rel="noreferrer">aigamma.com</a>{" "}
        was built to learn PhD-level mathematics by interacting with models directly.{" "}
        <a href="https://worldthought.com" target="_blank" rel="noreferrer">worldthought.com</a> was built to learn
        philosophy and the interconnections between major thinkers. This one is built to face the daily flood of
        AI and stay on the bleeding edge.
      </p>
      <p>It is personal first. If other people find it useful too, that is welcome.</p>
      <p className="muted">
        There is no chatbot, and the corpus self-expires at a quarter so nothing here is stale. For how it works,
        see the <Link to="/methodology">methodology</Link>.
      </p>
    </div>
  );
}
