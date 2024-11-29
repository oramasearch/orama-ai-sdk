/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ORAMA_API_KEY: process.env.ORAMA_API_KEY,
    ORAMA_API_URL: process.env.ORAMA_API_URL,
  },
  transpilePackages: ['ai-sdk-orama-provider']
}

module.exports = nextConfig