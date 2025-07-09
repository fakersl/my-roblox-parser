import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InputSection from '@/components/InputSection'
import SearchSection from '@/components/SearchSection'
import { Toaster } from '@/components/ui/sonner'
import { ToggleTheme } from '@/components/ToggleTheme'
import { Github } from 'lucide-react'

export default function Home() {
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