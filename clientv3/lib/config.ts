// API Base URL - Expo Go için mobil cihazda localhost çalışmaz
// Bilgisayarının IP adresini kullan: ifconfig veya ipconfig ile öğren
// Örnek: export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:4000
// GEÇİCİ: IP değiştiği için buraya yeni IP yazıldı (environment variable override edildi)
export const API_BASE_URL = 'http://192.168.1.111:4000';

// Debug için
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Config] API Base URL:', API_BASE_URL);
}

