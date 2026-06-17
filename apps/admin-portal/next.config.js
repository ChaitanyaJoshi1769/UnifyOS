/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@unifyos/shared-types', '@unifyos/shared-utils'],
  env: {
    API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
