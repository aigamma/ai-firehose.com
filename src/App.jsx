import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { KINDS } from "./data/registry.js";

// Home loads eagerly because it is the landing route. Every other page splits into
// its own chunk (loaded on navigation behind the Suspense boundary in Layout), so
// the initial bundle carries only the dashboard plus shared code.
const KindView = lazy(() => import("./pages/KindView.jsx"));
const Glossary = lazy(() => import("./pages/Glossary.jsx"));
const TechniqueHub = lazy(() => import("./pages/TechniqueHub.jsx"));
const Explore = lazy(() => import("./pages/Explore.jsx"));
const Watch = lazy(() => import("./pages/Watch.jsx"));
const Methodology = lazy(() => import("./pages/Methodology.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Review = lazy(() => import("./pages/Review.jsx"));
const Lens = lazy(() => import("./pages/Lens.jsx"));
const Learn = lazy(() => import("./pages/Learn.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {KINDS.map((k) => (
          <Route key={k.key} path={k.route} element={<KindView kindKey={k.key} />} />
        ))}
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/review" element={<Review />} />
        <Route path="/lens" element={<Lens />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/technique/:slug" element={<TechniqueHub />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
