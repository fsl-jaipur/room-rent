import { useEffect, useState } from "react";

export function navigate(path: string) {
  if (window.location.pathname === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function usePathname() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return path;
}

export function getPropertyIdFromPath(path: string) {
  const match = path.match(/^\/property\/([^/]+)$/);
  return match?.[1] ?? "";
}
