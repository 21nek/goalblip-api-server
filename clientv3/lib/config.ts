// API Base URL
// Bu kopyada doğrudan lokal IP kullanıyoruz.
// Sunucu log'unda görünen IP: http://192.168.1.110:4000
export const API_BASE_URL = 'http://192.168.1.110:4000';

// Debug iÃ§in
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Config] API Base URL:', API_BASE_URL);
}

