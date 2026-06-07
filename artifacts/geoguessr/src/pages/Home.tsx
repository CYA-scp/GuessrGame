interface HomeProps {
  onStart: () => void;
  apiError?: string | null;
}

export default function Home({ onStart, apiError }: HomeProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0a2040 0%, #080c18 70%)" }}>

      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="font-syne text-xl font-black geo-gradient-text">GeoStreet</div>
      </div>

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: (Math.sin(i * 7.3) * 0.5 + 1.5) + "px",
              height: (Math.sin(i * 7.3) * 0.5 + 1.5) + "px",
              top: ((i * 37.1) % 100) + "%",
              left: ((i * 53.7) % 100) + "%",
              opacity: (Math.sin(i * 2.1) * 0.3 + 0.25),
            }} />
        ))}
      </div>

      <div className="relative z-10 px-8 max-w-lg w-full">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl globe-spin"
          style={{
            background: "conic-gradient(from 0deg, #00e5c3, #0095ff, #00e5c3)",
            boxShadow: "0 0 48px rgba(0,229,195,.3)"
          }}>
          🌍
        </div>

        <h1 className="font-syne text-6xl font-black tracking-tight geo-gradient-text mb-1">GeoStreet</h1>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Dünyaya atıl, Street View-da gəz, yeri tap!
        </p>

        <div className="flex gap-6 mb-8 justify-center flex-wrap">
          {[
            { icon: "🗺️", label: "Street View-da 3D gəz" },
            { icon: "📍", label: "Xəritədə yeri işarələ" },
            { icon: "🎯", label: "Yaxın = çox xal" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 max-w-[110px]">
              <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl"
                style={{ background: "#161e35", border: "1px solid #1e2a42" }}>
                {s.icon}
              </div>
              <p className="text-xs text-center leading-snug" style={{ color: "#6b7280" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {apiError && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm text-left"
            style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#ef4444" }}>
            <p className="font-bold mb-1">⚠️ Google Maps API Key Tapılmadı</p>
            <p className="text-xs opacity-90">{apiError}</p>
            <p className="mt-2 text-xs opacity-70">
              Replit Secrets bölməsindən <strong>VITE_GOOGLE_MAPS_API_KEY</strong> əlavə edin, sonra reload edin.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 items-center">
          <button
            data-testid="button-start-game"
            onClick={onStart}
            disabled={!!apiError}
            className="font-syne font-bold text-lg px-16 py-4 rounded-full transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: apiError ? "#1e2a42" : "linear-gradient(135deg, #00e5c3, #0095ff)",
              color: apiError ? "#6b7280" : "#080c18",
              boxShadow: apiError ? "none" : "0 0 32px rgba(0,229,195,.25)",
            }}>
            Oyna 🌍
          </button>
          <p className="text-xs" style={{ color: "#6b7280" }}>5 tur • 90 saniyə • Bütün dünya</p>
        </div>
      </div>
    </div>
  );
}
