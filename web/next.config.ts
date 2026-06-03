import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/activate-uleam/registro-torneo",
        destination: "/registro-torneo",
        permanent: true,
      },
      {
        source: "/activate-uleam",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
