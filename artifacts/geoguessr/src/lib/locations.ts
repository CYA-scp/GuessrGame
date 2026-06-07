export interface Location {
  lat: number;
  lng: number;
  name: string;
  country: string;
  flag: string;
  hint: string;
  pov?: { heading: number; pitch: number };
}

export const WORLD_LOCATIONS: Location[] = [
  { lat: 48.8584, lng: 2.2945, name: "Paris, Fransa", country: "Fransa", flag: "🇫🇷", hint: "Dəmir qüllənin gölgəsindəki küçə", pov: { heading: 120, pitch: 0 } },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo, Yaponiya", country: "Yaponiya", flag: "🇯🇵", hint: "Çırağan işıqlarının şəhəri", pov: { heading: 180, pitch: 0 } },
  { lat: 40.7484, lng: -73.9967, name: "New York, ABŞ", country: "ABŞ", flag: "🇺🇸", hint: "Göydələnlər arasında Manhattan", pov: { heading: 90, pitch: 10 } },
  { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro, Braziliya", country: "Braziliya", flag: "🇧🇷", hint: "Uca dağlar arasındakı şəhər", pov: { heading: 45, pitch: 5 } },
  { lat: -33.8688, lng: 151.2093, name: "Sidney, Avstraliya", country: "Avstraliya", flag: "🇦🇺", hint: "Opera evinin yanındakı sahil", pov: { heading: 270, pitch: 0 } },
  { lat: 51.5074, lng: -0.1278, name: "London, Böyük Britaniya", country: "Böyük Britaniya", flag: "🇬🇧", hint: "Qırmızı avtobusların şəhəri", pov: { heading: 0, pitch: 0 } },
  { lat: 41.9028, lng: 12.4964, name: "Roma, İtaliya", country: "İtaliya", flag: "🇮🇹", hint: "Əbədi şəhər, qədim daşlar", pov: { heading: 150, pitch: 5 } },
  { lat: 55.7558, lng: 37.6173, name: "Moskva, Rusiya", country: "Rusiya", flag: "🇷🇺", hint: "Qırmızı meydanın ətrafı", pov: { heading: 200, pitch: 0 } },
  { lat: 13.7563, lng: 100.5018, name: "Bangkok, Tailand", country: "Tailand", flag: "🇹🇭", hint: "Məbədlər və əjdaha damları", pov: { heading: 90, pitch: 0 } },
  { lat: 30.0444, lng: 31.2357, name: "Qahirə, Misir", country: "Misir", flag: "🇪🇬", hint: "Qədim sivilizasiyanın şəhəri", pov: { heading: 270, pitch: 0 } },
  { lat: -34.6037, lng: -58.3816, name: "Buenos Aires, Argentina", country: "Argentina", flag: "🇦🇷", hint: "Cənubi Amerikanın Paris'i", pov: { heading: 60, pitch: 0 } },
  { lat: 37.5665, lng: 126.9780, name: "Seul, Cənubi Koreya", country: "Cənubi Koreya", flag: "🇰🇷", hint: "K-pop və texnologiyanın paytaxtı", pov: { heading: 180, pitch: 0 } },
  { lat: 19.0760, lng: 72.8777, name: "Mumbay, Hindistan", country: "Hindistan", flag: "🇮🇳", hint: "Bollywood şəhəri", pov: { heading: 90, pitch: 0 } },
  { lat: 43.6532, lng: -79.3832, name: "Toronto, Kanada", country: "Kanada", flag: "🇨🇦", hint: "CN qülləsinin şəhəri", pov: { heading: 0, pitch: 10 } },
  { lat: -33.9249, lng: 18.4241, name: "Kəptown, Cənubi Afrika", country: "Cənubi Afrika", flag: "🇿🇦", hint: "Masa dağının ətəyindəki şəhər", pov: { heading: 315, pitch: 0 } },
  { lat: 25.2048, lng: 55.2708, name: "Dubay, BƏƏ", country: "BƏƏ", flag: "🇦🇪", hint: "Səhranın ortasındakı göydələnlər", pov: { heading: 180, pitch: 10 } },
  { lat: 52.3676, lng: 4.9041, name: "Amsterdam, Hollandiya", country: "Hollandiya", flag: "🇳🇱", hint: "Kanallar üzərindəki şəhər", pov: { heading: 90, pitch: 0 } },
  { lat: 41.0082, lng: 28.9784, name: "İstanbul, Türkiyə", country: "Türkiyə", flag: "🇹🇷", hint: "İki qitənin görüşdüyü şəhər", pov: { heading: 135, pitch: 0 } },
  { lat: 59.9343, lng: 30.3351, name: "Sankt-Peterburq, Rusiya", country: "Rusiya", flag: "🇷🇺", hint: "Şimal paytaxtı, saraylar şəhəri", pov: { heading: 270, pitch: 0 } },
  { lat: 37.9838, lng: 23.7275, name: "Afina, Yunanıstan", country: "Yunanıstan", flag: "🇬🇷", hint: "Akropol və qədim tarix", pov: { heading: 45, pitch: 5 } },
  { lat: 22.3193, lng: 114.1694, name: "Honq Konq", country: "Honq Konq", flag: "🇭🇰", hint: "Dəniz kənarındakı işıqlı şəhər", pov: { heading: 180, pitch: 0 } },
  { lat: 1.3521, lng: 103.8198, name: "Sinqapur", country: "Sinqapur", flag: "🇸🇬", hint: "Bağlar şəhəri, super modern", pov: { heading: 90, pitch: 0 } },
  { lat: 47.4979, lng: 19.0402, name: "Budapeşt, Macarıstan", country: "Macarıstan", flag: "🇭🇺", hint: "Dunay üzərindəki kraliça şəhər", pov: { heading: 270, pitch: 0 } },
  { lat: 50.0755, lng: 14.4378, name: "Praqa, Çexiya", country: "Çexiya", flag: "🇨🇿", hint: "Sehirli köhnə şəhər mərkəzi", pov: { heading: 180, pitch: 0 } },
  { lat: 59.9139, lng: 10.7522, name: "Oslo, Norveç", country: "Norveç", flag: "🇳🇴", hint: "Fyordların paytaxtı", pov: { heading: 90, pitch: 0 } },
  { lat: 64.1466, lng: -21.9426, name: "Reykjavik, İslandiya", country: "İslandiya", flag: "🇮🇸", hint: "Şimali işıqların şəhəri", pov: { heading: 180, pitch: 0 } },
  { lat: -36.8485, lng: 174.7633, name: "Aukland, Yeni Zelandiya", country: "Yeni Zelandiya", flag: "🇳🇿", hint: "Yelkənlilər şəhəri", pov: { heading: 270, pitch: 0 } },
  { lat: 4.2105, lng: 101.9758, name: "Kuala Lumpur, Malayziya", country: "Malayziya", flag: "🇲🇾", hint: "Petronas qüllələrinin şəhəri", pov: { heading: 0, pitch: 10 } },
  { lat: 14.5995, lng: 120.9842, name: "Manila, Filippin", country: "Filippin", flag: "🇵🇭", hint: "Tropik cənnətin paytaxtı", pov: { heading: 90, pitch: 0 } },
  { lat: -4.3217, lng: 15.3219, name: "Kinşasa, DR Konqo", country: "DR Konqo", flag: "🇨🇩", hint: "Afrika qitəsinin nəhəng şəhəri", pov: { heading: 180, pitch: 0 } },
];

export function getRandomLocations(count: number): Location[] {
  const shuffled = [...WORLD_LOCATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
