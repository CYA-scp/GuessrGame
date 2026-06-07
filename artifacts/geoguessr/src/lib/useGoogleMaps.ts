import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("VITE_GOOGLE_MAPS_API_KEY tapılmadı. Lütfən, API key daxil edin.");
      return;
    }

    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["maps", "marker"],
      });
    }

    if (!loadPromise) {
      loadPromise = loaderInstance.load();
    }

    loadPromise
      .then(() => setIsLoaded(true))
      .catch((err) => {
        setError(`Google Maps yüklənə bilmədi: ${err.message}`);
        loadPromise = null;
      });
  }, []);

  return { isLoaded, error };
}
