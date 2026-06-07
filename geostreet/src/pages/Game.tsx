import { useEffect, useRef, useState, useCallback } from "react";
import type { Location } from "../lib/locations";
import { haversineDistance, calculateScore, formatDistance, getResultEmoji, getResultLabel } from "../lib/scoring";

interface RoundResult { locationName: string; flag: string; distanceKm: number; score: number; }
interface Props { locations: Location[]; onGameEnd: (results: RoundResult[], total: number) => void; }

const ROUND_SECONDS = 90;

export default function Game({ locations, onGameEnd }: Props) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [guessLatLng, setGuessLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [roundResult, setRoundResult] = useState<{ dist: number; score: number } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [mapExpanded, setMapExpanded] = useState(false);

  const streetViewRef = useRef<HTMLDivElement>(null);
  const guessMapRef = useRef<HTMLDivElement>(null);
  const guessMapObjRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const svRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const location = locations[roundIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const submitGuess = useCallback(() => {
    if (submitted) return;
    stopTimer();
    setSubmitted(true);

    const guess = guessLatLng ?? { lat: 0, lng: 0 };
    const dist = haversineDistance(location.lat, location.lng, guess.lat, guess.lng);
    const score = guessLatLng ? calculateScore(dist) : 0;
    setRoundResult({ dist, score });

    const newResult: RoundResult = { locationName: location.name, flag: location.flag, distanceKm: dist, score };
    setResults(prev => [...prev, newResult]);

    if (guessMapObjRef.current) {
      const g = new google.maps.LatLng(guess.lat, guess.lng);
      const a = new google.maps.LatLng(location.lat, location.lng);
      new google.maps.Marker({ position: a, map: guessMapObjRef.current,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#00e5c3", fillOpacity: 1, strokeColor: "#080c18", strokeWeight: 2 } });
      if (guessLatLng) {
        new google.maps.Polyline({ path: [g, a], map: guessMapObjRef.current,
          strokeColor: "#00e5c3", strokeOpacity: 0.7, strokeWeight: 2 });
      }
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(g); bounds.extend(a);
      guessMapObjRef.current.fitBounds(bounds, 80);
    }
  }, [submitted, guessLatLng, location, stopTimer]);

  useEffect(() => {
    if (submitted) return;
    setTimeLeft(ROUND_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { submitGuess(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [roundIdx]);

  useEffect(() => {
    if (!streetViewRef.current || !(window as any).google?.maps) return;
    const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
      position: { lat: location.lat, lng: location.lng },
      pov: location.pov ?? { heading: 0, pitch: 0 },
      zoom: 1,
      disableDefaultUI: true,
      showRoadLabels: false,
      addressControl: false,
      linksControl: true,
      panControl: true,
      zoomControl: true,
      motionTracking: false,
      motionTrackingControl: false,
    });
    svRef.current = panorama;
  }, [roundIdx]);

  useEffect(() => {
    if (!guessMapRef.current || !(window as any).google?.maps) return;
    const map = new google.maps.Map(guessMapRef.current, {
      center: { lat: 20, lng: 0 }, zoom: 2,
      disableDefaultUI: true, zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0a1628" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#040b1a" }] },
        { featureType: "road", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#1e3a5f" }, { weight: 0.8 }] },
        { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#111f35" }] },
      ],
    });
    guessMapObjRef.current = map;
    markerRef.current = null;

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || submitted) return;
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setGuessLatLng(pos);
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new google.maps.Marker({
        position: pos, map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#0095ff", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
      });
    });
  }, [roundIdx]);

  const nextRound = () => {
    if (roundIdx + 1 >= locations.length) {
      const total = results.reduce((s, r) => s + r.score, 0);
      onGameEnd(results, total);
    } else {
      setRoundIdx(i => i + 1);
      setGuessLatLng(null);
      setSubmitted(false);
      setRoundResult(null);
      setMapExpanded(false);
    }
  };

  const pct = timeLeft / ROUND_SECONDS;
  const r = 20, circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const timerColor = pct > 0.5 ? "#00e5c3" : pct > 0.25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#080c18" }}>
      <div ref={streetViewRef} className="absolute inset-0" />
      <div className="street-overlay-gradient absolute inset-0" />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20">
        <div className="font-syne font-black text-xl geo-gradient-text">GeoStreet</div>
        <div className="flex items-center gap-2">
          {locations.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: i === roundIdx ? "22px" : "8px",
                height: "8px",
                background: i < roundIdx ? "#00e5c3" : i === roundIdx ? "linear-gradient(90deg,#00e5c3,#0095ff)" : "#1e2a42",
              }} />
          ))}
        </div>
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg width="44" height="44" className="absolute inset-0 -rotate-90">
            <circle cx="22" cy="22" r={r} fill="none" stroke="#1e2a42" strokeWidth="3" />
            <circle cx="22" cy="22" r={r} fill="none" stroke={timerColor} strokeWidth="3"
              strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
              className="timer-ring-progress" />
          </svg>
          <span className="font-syne font-bold text-xs relative z-10" style={{ color: timerColor }}>{timeLeft}</span>
        </div>
      </div>

      {/* Bottom-right guess map */}
      <div className="absolute z-30 transition-all duration-300"
        style={{
          bottom: "16px", right: "16px",
          width: mapExpanded ? "380px" : "220px",
          height: mapExpanded ? "280px" : "160px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #1e2a42",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        }}>
        <div ref={guessMapRef} className="w-full h-full" />
        {!submitted && (
          <button onClick={() => setMapExpanded(x => !x)}
            className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-lg text-xs"
            style={{ background: "rgba(8,12,24,0.8)", border: "1px solid #1e2a42", color: "#e8e4d8" }}>
            {mapExpanded ? "⊙" : "⤢"}
          </button>
        )}
        {!submitted && (
          <button onClick={submitGuess}
            className="absolute bottom-2 left-1/2 font-syne font-bold text-xs px-4 py-2 rounded-full transition-all"
            style={{
              transform: "translateX(-50%)",
              background: guessLatLng ? "linear-gradient(135deg,#00e5c3,#0095ff)" : "#1e2a42",
              color: guessLatLng ? "#080c18" : "#6b7280",
              border: "none", cursor: guessLatLng ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}>
            {guessLatLng ? "Təsdiqlə ✓" : "Xəritəyə klik et"}
          </button>
        )}
      </div>

      {/* Round result overlay */}
      {submitted && roundResult && (
        <div className="absolute inset-0 flex items-center justify-center z-40 fade-in"
          style={{ background: "rgba(8,12,24,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="result-card p-8 rounded-2xl text-center max-w-xs w-full mx-4"
            style={{ background: "#0f1629", border: "1px solid #1e2a42" }}>
            <div className="text-4xl mb-2">{getResultEmoji(roundResult.score)}</div>
            <p className="font-syne font-bold text-lg mb-1" style={{ color: "#e8e4d8" }}>{getResultLabel(roundResult.score)}</p>
            <p className="font-syne font-black geo-gradient-text mb-1" style={{ fontSize: "52px", lineHeight: 1 }}>
              {roundResult.score.toLocaleString()}
            </p>
            <p className="text-sm mb-1" style={{ color: "#6b7280" }}>xal</p>
            <p className="text-sm mb-1" style={{ color: "#e8e4d8" }}>
              {location.flag} {location.name}
            </p>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
              {guessLatLng ? `Məsafə: ${formatDistance(roundResult.dist)}` : "Vaxt bitdi — xal yoxdur"}
            </p>
            <button onClick={nextRound}
              className="font-syne font-bold text-sm w-full py-3 rounded-full"
              style={{ background: "linear-gradient(135deg,#00e5c3,#0095ff)", color: "#080c18" }}>
              {roundIdx + 1 >= locations.length ? "Nəticələrə bax 🏁" : `Tur ${roundIdx + 2} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
