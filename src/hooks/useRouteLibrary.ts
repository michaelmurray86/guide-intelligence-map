import { useCallback, useEffect, useState } from "react";

import { RouteLibrary } from "@/Types/RouteLibrary";
import { getRouteLibrary } from "@/lib/routeLibraryDatabase";

const MAX_LOAD_ATTEMPTS = 3;

export function useRouteLibrary() {
  const [routes, setRoutes] = useState<RouteLibrary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutes = useCallback(async () => {
    setLoading(true);

    for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
      const data = await getRouteLibrary();

      if (data.length > 0 || attempt === MAX_LOAD_ATTEMPTS) {
        setRoutes(data);
        setLoading(false);
        return;
      }

      await new Promise(resolve =>
        setTimeout(resolve, attempt * 750)
      );
    }
  }, []);

  useEffect(() => {
    loadRoutes();

    const handleRoutesChanged = () => {
      loadRoutes();
    };

    window.addEventListener(
      "route-library-changed",
      handleRoutesChanged
    );

    return () => {
      window.removeEventListener(
        "route-library-changed",
        handleRoutesChanged
      );
    };
  }, [loadRoutes]);

  return {
    routes,
    setRoutes,
    loading,
    reloadRoutes: loadRoutes,
  };
}
