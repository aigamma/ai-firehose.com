import { useCallback, useEffect, useState } from "react";

const KEY = "aifh-theme";

function currentTheme() {
  if (typeof document !== "undefined") {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
  }
  return "dark";
}

// Dark is the default. The pre-paint script in index.html sets the attribute
// before React mounts; this hook keeps it in sync and persists the choice.
export default function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* private mode, ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle };
}
