import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      // Désactive le Router Cache pour les pages dynamiques (auth)
      // 0 = jamais cacher, toujours re-fetch au serveur
      dynamic: 0,
    },
  },
};

export default nextConfig;
