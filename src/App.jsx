import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import Explore from "./pages/Explore.jsx";
import Glossary from "./pages/Glossary.jsx";
import TechniqueHub from "./pages/TechniqueHub.jsx";
import { KINDS } from "./data/registry.js";

// Routes are derived from the registry where possible. Per-kind deep views and
// the embedding-driven surfaces arrive in later phases; for now they are honest
// placeholders so navigation and the steering harness can be exercised end to end.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {KINDS.map((k) => (
          <Route key={k.key} path={k.route} element={<Placeholder title={k.label} phase="Phases 4 and 5" />} />
        ))}
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/technique/:slug" element={<TechniqueHub />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/methodology" element={<Placeholder title="Methodology" phase="Phase 6" />} />
        <Route path="/about" element={<Placeholder title="About" phase="Phase 6" />} />
        <Route path="*" element={<Placeholder title="Not Found" notFound />} />
      </Route>
    </Routes>
  );
}
