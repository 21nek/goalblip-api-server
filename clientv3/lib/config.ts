// API Base URL
// Bu kopyada doÄŸrudan lokal IP kullanÄ±yoruz.
// Sunucu log'unda gÃ¶rÃ¼nen IP: http://192.168.1.108:4000
export const API_BASE_URL = 'http://192.168.1.108:4000';

// Debug iÃ§in
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Config] API Base URL:', API_BASE_URL);
}

