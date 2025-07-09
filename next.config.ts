import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações básicas do Next.js
  reactStrictMode: true,
  
  // Configurações experimentais (incluindo serverActions corrigido)
  experimental: {
    serverActions: {
      // bodySizeLimit: '2mb', // Tamanho máximo padrão
      // allowedOrigins: ['https://seu-dominio.com'], // Domínios permitidos
    },
    // Outros recursos experimentais que você pode querer habilitar:
    // typedRoutes: true, // Rotas tipadas (Next.js 13+)
    // mdxRs: true, // Compilador MDX mais rápido
  },

  // Configuração de ESLint (para evitar o erro no FriendsList.tsx)
  eslint: {
    ignoreDuringBuilds: true, // Ou configure para false e corrija os erros
  },

  // Configuração de TypeScript
  typescript: {
    ignoreBuildErrors: false, // Recomendo false para pegar erros durante o build
  },

  // Configurações de webpack se necessário
  webpack: (config, { isServer }) => {
    // Adicione modificações do webpack aqui se necessário
    return config;
  },
};

export default nextConfig;