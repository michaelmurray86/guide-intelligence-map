import { useEffect, useState } from "react";

import { RouteLibrary } from "@/Types/RouteLibrary";
import { getRouteLibrary } from "@/lib/routeLibraryDatabase";

export function useRouteLibrary() {
  const [routes, setRoutes] = useState<RouteLibrary[]>([]);

  useEffect(() => {
    async function loadRoutes() {
      const data = await getRouteLibrary();
      setRoutes(data);
    }

    loadRoutes();
  }, []);

  return {
    routes,
    setRoutes,
  };
}
