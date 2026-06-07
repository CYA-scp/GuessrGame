import { useEffect, useRef, useState, useCallback } from "react";
import { Location } from "@/lib/locations";
import { haversineDistance, calculateScore, formatDistance, getResultEmoji, getResultLabel } from "@/lib/scoring";

interface RoundResult {
  locationName: string;
  flag: string;
  distanceKm: number;
  score: number;
}

interface GameProps {
  locations: Location[];
  onGameEnd: (results: RoundResult[], total: number) => void;
}

const TOTAL_ROUNDS = 5;
const ROUND_TIME = 90;

export default function Game({ locations, onGameEnd }: GameProps) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const svPanoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const guessMapRef = useRef<google.maps.Map | null>(null);
  const guessMarkerRef = useRef<google.maps.Marker | null>(null);
  const correctMarkerRef = useRef<google.maps.Marker | null>(null);
  const lineRef = useRef<google.maps.Polyline | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [guessLatLng, setGuessLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<{ dist: number; score: number } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [svReady, setSvReady] = useState(false);
  const [svError, setSvError] = useState(false);

  const currentLoc = locations[round];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(ROUND_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Init Street View
  useEffect(() => {
    if (!streetViewRef.current || !currentLoc) return;

    setSvReady(false);
    setSvError(false);
    setGuessLatLng(null);
    setShowResult(false);
    setRoundResult(null);

    const sv = new google.maps.StreetViewService();
    const loc = { lat: currentLoc.lat, lng: currentLoc.lng };

    sv.getPanorama({ location: loc, radius: 5000 }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
        if (!svPanoramaRef.current) {
          svPanoramaRef.current = new google.maps.StreetViewPanorama(streetViewRef.current!, {
            position: data.location.latLng,
            pov: currentLoc.pov || { heading: 0, pitch: 0 },
            zoom: 0,
            addressControl: false,
            showRoadLabels: false,
            fullscreenControl: false,
            motionTrackingControl: false,
            linksControl: true,
            panControl: true,
            enableCloseButton: false,
          });
        } else {
          svPanoramaRef.current.setPano(data.location.pano!);
          svPanoramaRef.current.setPov(currentLoc.pov || { heading: 0, pitch: 0 });
        }
        setSvReady(true);
        startTimer();
      } else {
        setSvError(true);
        setSvReady(true);
        startTimer();
      }
    });

    return () => stopTimer();
  }, [round, currentLoc, startTimer, stopTimer]);

  // Init guess map
  useEffect(() => {
    if (!mapRef.current || guessMapRef.current) return;

    guessMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0d1b2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#4a6080" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0d1b2e" }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1a3a5c" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "landscape", stylers: [{ color: "#1a2a3a" }] },
        { featureType: "water", stylers: [{ color: "#070e1a" }] },
        { featureType: "road", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ],
    });

    guessMapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || showResult) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setGuessLatLng({ lat, lng });

      if (guessMarkerRef.current) {
        guessMarkerRef.current.setPosition(e.latLng);
      } else {
        guessMarkerRef.current = new google.maps.Marker({
          position: e.latLng,
          map: guessMapRef.current!,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#00e5c3",
            fillOpacity: 1,
            strokeColor: "#080c18",
            strokeWeight: 2,
          },
        });
      }
    });
  }, [showResult]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleSubmit = useCallback(() => {
    stopTimer();
    setShowResult(true);
    setMapExpanded(true);

    const guessPos = guessLatLng || { lat: 0, lng: 0 };
    const dist = haversineDistance(currentLoc.lat, currentLoc.lng, guessPos.lat, guessPos.lng);
    const score = guessLatLng ? calculateScore(dist) : 0;

    setRoundResult({ dist, score });

    const correctPos = { lat: currentLoc.lat, lng: currentLoc.lng };

    // Show correct marker
    if (correctMarkerRef.current) correctMarkerRef.current.setMap(null);
    correctMarkerRef.current = new google.maps.Marker({
      position: correctPos,
      map: guessMapRef.current!,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#080c18",
        strokeWeight: 2,
      },
      title: currentLoc.name,
    });

    // Draw line between guess and correct
    if (lineRef.current) lineRef.current.setMap(null);
    if (guessLatLng) {
      lineRef.current = new google.maps.Polyline({
        path: [{ lat: guessPos.lat, lng: guessPos.lng }, correctPos],
        map: guessMapRef.current!,
        strokeColor: "#00e5c3",
        strokeWeight: 2,
        strokeOpacity: 0.7,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }],
      });
    }

    // Fit map to show both markers
    const bounds = new google.maps.LatLngBounds();
    if (guessLatLng) bounds.extend({ lat: guessPos.lat, lng: guessPos.lng });
    bounds.extend(correctPos);
    guessMapRef.current!.fitBounds(bounds, 60);
  }, [guessLatLng, currentLoc, stopTimer]);

  const handleNext = () => {
    const guessPos = guessLatLng || { lat: 0, lng: 0 };
    const dist = roundResult?.dist ?? haversineDistance(currentLoc.lat, currentLoc.lng, guessPos.lat, guessPos.lng);
    const score = roundResult?.score ?? 0;

    const newResult: RoundResult = {
      locationName: currentLoc.name,
      flag: currentLoc.flag,
      distanceKm: dist,
      score,
    };

    const newResults = [...results, newResult];
    const newTotal = totalScore + score;

    // Cleanup markers
    if (guessMarkerRef.current) { guessMarkerRef.current.setMap(null); guessMarkerRef.current = null; }
    if (correctMarkerRef.current) { correctMarkerRef.current.setMap(null); correctMarkerRef.current = null; }
    if (lineRef.current) { lineRef.current.setMap(null); lineRef.current = null; }
    if (guessMapRef.current) guessMapRef.current.setCenter({ lat: 20, lng: 0 }), guessMapRef.current.setZoom(2);

    setResults(newResults);
    setTotalScore(newTotal);
    setMapExpanded(false);
    setShowResult(false);
    setGuessLatLng(null);

    if (round + 1 >= TOTAL_ROUNDS) {
      onGameEnd(newResults, newTotal);
    } else {
      setRound(prev => prev + 1);
    }
  };

  const timeFrac = timeLeft / ROUND_TIME;
  const circumference = 2 * Math.PI * 21;
  const dashOffset = circumference * (1 - timeFrac);
  const timerColor = timeLeft > 30 ? "#00e5c3" : timeLeft > 10 ? "#f59e0b" : "#ef4444";

  return (
    <div className="fixed inset-0" style={{ background: "#080c18" }}>
      {/* Street View fills the screen */}
      <div ref={streetViewRef} className="absolute inset-0" style={{ zIndex: 1 }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 street-overlay-gradient" style={{ zIndex: 2 }} />

      {svError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="text-center p-8 rounded-2xl" style={{ background: "rgba(8,12,24,.85)", border: "1px solid #1e2a42" }}>
            <div className="text-6xl mb-4">🌐</div>
            <p className="font-syne font-bold text-xl mb-2" style={{ color: "#00e5c3" }}>Street View tapılmadı</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Bu yer üçün görüntü mövcud deyil.<br />Xəritədə təxminini et!</p>
          </div>
        </div>
      )}

      {/* HUD - top bar */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
        style={{ zIndex: 10, background: "linear-gradient(to bottom, rgba(8,12,24,.95), transparent)" }}>
        <div className="font-syne font-black text-lg geo-gradient-text">GeoStreet</div>
        <div className="font-syne font-bold text-xs tracking-widest uppercase" style={{ color: "#00e5c3" }}>
          TUR {round + 1} / {TOTAL_ROUNDS}
        </div>
        <div className="font-syne font-bold text-sm" style={{ color: "#e8e4d8" }}>
          XAL: <span style={{ color: "#00e5c3" }}>{totalScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Timer - centered top */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
        <div className="relative w-14 h-14">
          <svg width="56" height="56" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="22" cy="22" r="21" fill="none" stroke="#1e2a42" strokeWidth="3" />
            <circle cx="22" cy="22" r="21" fill="none"
              stroke={timerColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="timer-ring-progress"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-syne font-bold text-base"
            style={{ color: timerColor }}>{timeLeft}</div>
        </div>
      </div>

      {/* Location hint badge */}
      {!showResult && svReady && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 mt-4 px-4 py-1.5 rounded-full text-xs font-syne font-bold tracking-wide"
          style={{ zIndex: 10, background: "rgba(8,12,24,.7)", border: "1px solid #1e2a42", color: "#6b7280", backdropFilter: "blur(8px)" }}>
          📍 Bu yer haradır?
        </div>
      )}

      {/* Map panel */}
      <div
        className={`absolute transition-all duration-300 rounded-2xl overflow-hidden`}
        style={{
          zIndex: 20,
          bottom: 16,
          right: 16,
          width: mapExpanded ? "min(680px, calc(100vw - 32px))" : 320,
          border: "1px solid #1e2a42",
          boxShadow: "0 8px 40px rgba(0,0,0,.7)",
          background: "#0f1629",
        }}>

        {/* Map header */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid #1e2a42", background: "#0f1629" }}>
          <span className="font-syne font-bold text-xs tracking-widest uppercase" style={{ color: "#6b7280" }}>
            Dünya Xəritəsi
          </span>
          {!showResult && (
            <button
              data-testid="button-toggle-map"
              onClick={() => setMapExpanded(e => !e)}
              className="text-xs px-2 py-1 rounded-md transition-all"
              style={{ background: "#161e35", border: "1px solid #1e2a42", color: "#6b7280" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#e8e4d8"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; }}>
              {mapExpanded ? "🔽 Kiçilt" : "🔍 Böyüt"}
            </button>
          )}
        </div>

        {/* The actual map */}
        <div
          ref={mapRef}
          style={{
            height: mapExpanded ? "calc(55vh - 88px)" : 200,
            transition: "height 0.3s ease",
            cursor: showResult ? "default" : "crosshair",
          }}
        />

        {/* Map footer */}
        {!showResult && (
          <div className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderTop: "1px solid #1e2a42", background: "#0f1629" }}>
            <div className="flex-1 flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
              <div className="w-2 h-2 rounded-full"
                style={{ background: guessLatLng ? "#00e5c3" : "#1e2a42", boxShadow: guessLatLng ? "0 0 6px #00e5c3" : "none" }} />
              {guessLatLng ? "Yer seçildi!" : "Xəritəyə klik et"}
            </div>
            <button
              data-testid="button-submit-guess"
              onClick={handleSubmit}
              disabled={!guessLatLng}
              className="font-syne font-bold text-sm px-5 py-2 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: guessLatLng ? "linear-gradient(135deg, #00e5c3, #0095ff)" : "#1e2a42",
                color: guessLatLng ? "#080c18" : "#6b7280",
              }}>
              Təxmin Et →
            </button>
          </div>
        )}
      </div>

      {/* Result overlay */}
      {showResult && roundResult && (
        <div className="absolute inset-0 flex items-center justify-center fade-in"
          style={{ zIndex: 30, background: "rgba(8,12,24,.8)", backdropFilter: "blur(4px)" }}>
          <div className="result-card rounded-2xl p-8 text-center w-full max-w-sm mx-4"
            style={{ background: "#0f1629", border: "1px solid #253350", boxShadow: "0 20px 80px rgba(0,0,0,.6)" }}>

            <span className="text-5xl block mb-3">{getResultEmoji(roundResult.score)}</span>
            <p className="font-syne text-xs tracking-widest uppercase mb-1" style={{ color: "#6b7280" }}>Doğru yer</p>
            <p className="font-syne font-black text-2xl mb-6"
              style={{ color: "#e8e4d8" }}>{currentLoc.flag} {currentLoc.name}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl p-3" style={{ background: "#161e35", border: "1px solid #1e2a42" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Məsafə</p>
                <p className="font-syne font-bold text-xl" style={{ color: "#22c55e" }}>
                  {guessLatLng ? formatDistance(roundResult.dist) : "—"}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#161e35", border: "1px solid #1e2a42" }}>
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>Xal</p>
                <p className="font-syne font-bold text-xl" style={{ color: "#00e5c3" }}>
                  +{roundResult.score.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="font-syne font-bold text-base mb-5"
              style={{ color: roundResult.score >= 3000 ? "#00e5c3" : "#6b7280" }}>
              {getResultLabel(roundResult.score)}
            </p>

            <button
              data-testid="button-next-round"
              onClick={handleNext}
              className="font-syne font-bold text-base w-full py-4 rounded-full transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, #00e5c3, #0095ff)",
                color: "#080c18",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              {round + 1 >= TOTAL_ROUNDS ? "Nəticələrə Bax 🏆" : "Növbəti Tur →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
