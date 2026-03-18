// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Allow local images from /public folder
    unoptimized: false, // keep optimized
  },
};

module.exports = nextConfig;
