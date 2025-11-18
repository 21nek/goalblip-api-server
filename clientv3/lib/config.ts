// API Base URL
// Environment variable'dan al, yoksa fallback kullan
// Development: local IP veya localhost
// Production: Cloudflare HTTPS URL (https://api.goalblip.com)

const getApiBaseUrl = (): string => {
  // Expo environment variable (EXPO_PUBLIC_* prefix gerekli)
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Development: Local IP (sunucuya taşınana kadar)
  // Not: Server'ın gerçek IP'sini kullan (hostname -I ile kontrol et)
  return 'http://192.168.1.105:4000';
  
  // Production: Cloudflare HTTPS (sunucuya taşındığında aktif et)
  // if (typeof __DEV__ !== 'undefined' && !__DEV__) {
  //   return 'https://api.goalblip.com';
  // }
};

export const API_BASE_URL = getApiBaseUrl();

// Debug için
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Config] API Base URL:', API_BASE_URL);
  console.log('[Config] Environment:', __DEV__ ? 'development' : 'production');
}

