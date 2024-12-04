/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ORAMA_API_KEY: process.env.ORAMA_API_KEY,
    ORAMA_API_URL: process.env.ORAMA_API_URL,
  },
  transpilePackages: ['ai-sdk-orama-provider'],
  images: {
    domains: ['website-assets.oramasearch.com',
      'learnwebcode.github.io'],
  },
}

module.exports = nextConfig