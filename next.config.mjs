/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",  // <=== enables static exports
  reactStrictMode: true,
  basePath: '/canvas'
};

module.exports = nextConfig;