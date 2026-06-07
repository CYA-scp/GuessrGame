import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Results from "./pages/Results";
import { getRandomLocations } from "./lib/locations";
import type { Location } from "./lib/locations";

interface RoundResult {
  locationName: string;
  flag: string;
  distanceKm: number;
  score: number;
}

type Screen = "home" | "game" | "results";

export default function App() {
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [locations, setLocations] = useState<Location[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const TOTAL_ROUNDS = 5;
  const MAX_SCORE = TOTAL_ROUNDS * 5000;

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) {
      setMapsError("VITE_GOOGLE_MAPS_API_KEY tapılmadı. .env faylını yoxlayın.");
      return;
    }
    if ((window as any).google?.maps) {
      setMapsReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker&loading=async`;
    script.async = true;
    script.onload = () => setMapsReady(true);
    script.onerror = () => setMapsError("Google Maps yüklənə bilmədi. API key-i yoxlayın.");
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleStart = () => {
    setLocations(getRandomLocations(TOTAL_ROUNDS));
    setResults([]);
    setTotalScore(0);
    setScreen("game");
  };

  const handleGameEnd = (roundResults: RoundResult[], total: number) => {
    setResults(roundResults);
    setTotalScore(total);
    setScreen("results");
  };

  if (screen === "game" && mapsReady && locations.length > 0) {
    return <Game locations={locations} onGameEnd={handleGameEnd} />;
  }
  if (screen === "results") {
    return (
      <Results
        totalScore={totalScore}
        maxScore={MAX_SCORE}
        rounds={results}
        onPlayAgain={() => setScreen("home")}
      />
    );
  }
  return <Home onStart={handleStart} apiError={mapsError} />;
}
