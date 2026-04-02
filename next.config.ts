import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn1.gttwl.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
