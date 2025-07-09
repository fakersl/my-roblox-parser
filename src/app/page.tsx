import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InputSection from '@/components/InputSection'
import SearchSection from '@/components/SearchSection'
import { Toaster } from '@/components/ui/sonner'
import { ToggleTheme } from '@/components/ToggleTheme'
import { Github, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LoginButton } from '@/components/LoginButton'

export default function Home() {
  // Gera um state único para proteção CSRF
  const generateState = () => {
    if (typeof window !== 'undefined') {
      const state = crypto.randomUUID()
      sessionStorage.setItem('oauth_state', state)
      return state
    }
    return 'default_state_' + Math.random().toString(36).substring(2)
  }

  // Construção segura da URL de autenticação
  const buildAuthUrl = () => {
    if (!process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID || !process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI) {
      console.error('Variáveis de ambiente não configuradas!')
      return '#'
    }

    const authUrl = new URL('https://auth.roblox.com/v2/authorize')
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile',
      state: generateState()
    })

    return `${authUrl.toString()}?${params.toString()}`
  }

  const handleLogin = () => {
    const authUrl = buildAuthUrl()
    if (authUrl !== '#') {
      window.location.href = authUrl
    } else {
      alert('Erro de configuração - Por favor, tente novamente mais tarde.')
    }
  }

  return (
    <main className="p-4 md:p-6 min-h-screen bg-background text-foreground relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Roblox Asset Parser</h1>
          <p className="text-sm text-muted-foreground">
            Ferramenta completa para gerenciar assets do Roblox
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LoginButton /> {/* Use o novo componente */}

          <a
            href="https://github.com/seu-usuario/roblox-asset-parser"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-accent rounded-full"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>
          <ToggleTheme />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <InputSection />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link href="/privacy" className="hover:underline hover:text-primary">
            Política de Privacidade
          </Link>
          <Link href="/terms" className="hover:underline hover:text-primary">
            Termos de Serviço
          </Link>
        </div>
        <p>
          Roblox Asset Parser - Não afiliado à Roblox Corporation | Dados obtidos através da API pública
        </p>
        <p className="mt-1">
          Desenvolvido com Next.js, Tailwind CSS e shadcn/ui
        </p>
      </footer>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </main>
  )
}