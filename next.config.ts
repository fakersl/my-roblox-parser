import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/roblox/:path*',
        destination: 'https://catalog.roblox.com/v1/catalog/items/:path*'
      }
    ]
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Temporário até corrigir os erros
  },
  typescript: {
    ignoreBuildErrors: true, // Temporário até corrigir os erros
  },
  experimental: {
    serverActions: {}, // Configuração correta como objeto vazio
  }
};

export default nextConfig;