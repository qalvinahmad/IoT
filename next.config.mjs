/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'assets.aceternity.com',
        },
      ],
      domains: [
        "api.microlink.io",
      ],
    },
  };
  
  export default nextConfig;
  