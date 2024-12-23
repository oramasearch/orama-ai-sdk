/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ORAMA_API_KEY: process.env.ORAMA_API_KEY,
    ORAMA_API_URL: process.env.ORAMA_API_URL,
  },
  transpilePackages: ['@oramacloud/ai-sdk-provider'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@oramacloud/ai-sdk-provider': require.resolve('@oramacloud/ai-sdk-provider')
    }
    return config
  },
  images: {
    domains: ['website-assets.oramasearch.com',
      'pub-63f27474fef34587a26f8ec7f626984d.r2.dev'],
  },
}

module.exports = nextConfig