export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function calculateScore(distanceKm: number): number {
  if (distanceKm <= 0.1) return 5000;
  return Math.max(0, Math.min(5000, Math.round(5000 * Math.exp(-distanceKm / 2000))));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)} min km`;
  return `${Math.round(km)} km`;
}

export function getResultEmoji(score: number): string {
  if (score >= 4500) return "🏆";
  if (score >= 3500) return "🎯";
  if (score >= 2500) return "🌍";
  if (score >= 1500) return "🗺️";
  if (score >= 500)  return "🧭";
  return "😅";
}

export function getResultLabel(score: number): string {
  if (score >= 4500) return "Möhtəşəm!";
  if (score >= 3500) return "Əla!";
  if (score >= 2500) return "Yaxşı!";
  if (score >= 1500) return "Orta";
  if (score >= 500)  return "Zəif";
  return "Uzaq iddin...";
}

export function getEndGrade(total: number, max: number): { grade: string; msg: string } {
  const p = total / max;
  if (p >= 0.9) return { grade: "S+", msg: "Canlı atlas! Dünya səni tanıyır." };
  if (p >= 0.75) return { grade: "A",  msg: "Coğrafiyaçı ruhu var sənin." };
  if (p >= 0.6)  return { grade: "B",  msg: "Yaxşı getdi, daha səyahət et!" };
  if (p >= 0.4)  return { grade: "C",  msg: "Orta nəticə. Dünya böyükdür!" };
  if (p >= 0.2)  return { grade: "D",  msg: "Biraz çaşdın, növbəti dəfə yaxşı olar." };
  return { grade: "F", msg: "GPS sındı 😅 Amma başladın — bu əsas!" };
}
