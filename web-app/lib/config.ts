// API Base URL
// Environment variable'dan al, yoksa fallback kullan
// Development: local IP veya localhost
// Production: Cloudflare HTTPS URL (https://api.goalblip.com)

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }

  // Default: prod/staging endpoint
  return 'https://df.goalblip.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug için
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[Config] API Base URL:', API_BASE_URL);
  console.log('[Config] Environment: development');
}
