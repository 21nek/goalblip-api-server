/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en'
  }
};

export default nextConfig;
