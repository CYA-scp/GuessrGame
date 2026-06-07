import { getEndGrade, formatDistance } from "../lib/scoring";

interface RoundResult { locationName: string; flag: string; distanceKm: number; score: number; }
interface Props { totalScore: number; maxScore: number; rounds: RoundResult[]; onPlayAgain: () => void; }

export default function Results({ totalScore, maxScore, rounds, onPlayAgain }: Props) {
  const { grade, msg } = getEndGrade(totalScore, maxScore);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto" style={{ background: "#080c18" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%,#0a3020 0%,#080c18 70%)" }} />

      <div className="relative z-10 w-full max-w-md px-6 py-10 text-center">
        <p className="font-syne text-xs tracking-widest uppercase mb-2" style={{ color: "#6b7280" }}>Oyun Bitti</p>

        <div className="font-syne font-black geo-gradient-text score-pop mb-1" style={{ fontSize: "86px", lineHeight: 1 }}>
          {totalScore.toLocaleString()}
        </div>
        <p className="mb-1" style={{ color: "#6b7280", fontSize: "15px" }}>
          / {maxScore.toLocaleString()} xal • {Math.round((totalScore/maxScore)*100)}%
        </p>
        <p className="font-syne font-bold text-xl mb-1" style={{ color: "#00e5c3" }}>{grade}</p>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>{msg}</p>

        <div className="rounded-xl overflow-hidden mb-6 text-left"
          style={{ background: "#0f1629", border: "1px solid #1e2a42" }}>
          {rounds.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm"
              style={{ borderBottom: i < rounds.length-1 ? "1px solid #1e2a42" : "none" }}>
              <span className="text-xl w-7">{r.flag}</span>
              <span className="flex-1 truncate" style={{ color: "#e8e4d8" }}>{r.locationName}</span>
              <span className="text-xs mr-3" style={{ color: "#6b7280" }}>{formatDistance(r.distanceKm)}</span>
              <span className="font-syne font-bold min-w-[48px] text-right"
                style={{ color: r.score >= 3000 ? "#00e5c3" : "#6b7280" }}>
                {r.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onPlayAgain}
          className="font-syne font-bold text-base w-full py-4 rounded-full transition-all duration-150"
          style={{ background: "linear-gradient(135deg,#00e5c3,#0095ff)", color: "#080c18" }}
          onMouseEnter={e => (e.currentTarget.style.transform="scale(1.03)")}
          onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}>
          Yenidən Oyna 🔄
        </button>
      </div>
    </div>
  );
}
