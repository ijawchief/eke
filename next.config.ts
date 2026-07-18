import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "eke-mocha.vercel.app" }],
        destination: "https://veelage.co/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
