// API Base URL
// Environment variable'dan al, yoksa fallback kullan
// Development: local IP veya localhost
// Production: Cloudflare HTTPS URL (https://api.goalblip.com)

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Default: prod/staging endpoint
  return 'https://df.goalblip.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug için
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Config] API Base URL:', API_BASE_URL);
  // eslint-disable-next-line no-console
  console.log('[Config] Environment:', __DEV__ ? 'development' : 'production');
}
