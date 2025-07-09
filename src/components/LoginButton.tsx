'use client' // Isso define que é um Client Component

import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'

export const LoginButton = () => {
    const handleLogin = () => {
        if (!process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID || !process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI) {
            console.error('Variáveis de ambiente não configuradas!')
            return
        }

        const state = crypto.randomUUID()
        sessionStorage.setItem('oauth_state', state)

        const authUrl = new URL('https://auth.roblox.com/v2/authorize')
        authUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID)
        authUrl.searchParams.append('redirect_uri', process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'openid profile')
        authUrl.searchParams.append('state', state)

        window.location.href = authUrl.toString()
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLogin}
            className="flex items-center gap-2"
        >
            <Rocket className="h-4 w-4" />
            Login com Roblox
        </Button>
    )
}