import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Explore from "./pages/Explore.jsx";
import Glossary from "./pages/Glossary.jsx";
import TechniqueHub from "./pages/TechniqueHub.jsx";
import Methodology from "./pages/Methodology.jsx";
import About from "./pages/About.jsx";
import KindView from "./pages/KindView.jsx";
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
          <Route key={k.key} path={k.route} element={<KindView kindKey={k.key} />} />
        ))}
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/technique/:slug" element={<TechniqueHub />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
