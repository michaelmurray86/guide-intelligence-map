import { useCallback, useEffect, useRef, useState } from "react";

import { RouteLibrary } from "@/Types/RouteLibrary";
import { getRouteLibrary } from "@/lib/routeLibraryDatabase";

const MAX_LOAD_ATTEMPTS = 3;

export function useRouteLibrary() {
  const [routes, setRoutes] = useState<RouteLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadRoutes = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
        try {
          const data = await getRouteLibrary();
          setRoutes(data);
          return;
        } catch (error) {
          console.error(`Route library load attempt ${attempt} failed:`, error);

          if (attempt < MAX_LOAD_ATTEMPTS) {
            await new Promise(resolve =>
              setTimeout(resolve, attempt * 750)
            );
          }
        }
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();

    const handleRoutesChanged = () => {
      loadRoutes();
    };

    const handleRetry = () => {
      loadRoutes();
    };

    window.addEventListener("route-library-changed", handleRoutesChanged);
    window.addEventListener("online", handleRetry);
    document.addEventListener("visibilitychange", handleRetry);

    return () => {
      window.removeEventListener(
        "route-library-changed",
        handleRoutesChanged
      );
      window.removeEventListener("online", handleRetry);
      document.removeEventListener("visibilitychange", handleRetry);
    };
  }, [loadRoutes]);

  return {
    routes,
    setRoutes,
    loading,
    reloadRoutes: loadRoutes,
  };
}
