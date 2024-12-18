/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ORAMA_API_KEY: process.env.ORAMA_API_KEY,
    ORAMA_API_URL: process.env.ORAMA_API_URL,
  },
  transpilePackages: ['@orama/ai-sdk-provider'],
  images: {
    domains: ['website-assets.oramasearch.com',
      'pub-63f27474fef34587a26f8ec7f626984d.r2.dev'],
  },
}

module.exports = nextConfig