import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
        return NextResponse.json(
            { error: 'assetId é obrigatório' },
            { status: 400 }
        )
    }

    try {
        // Tentando pegar o token X-CSRF
        const csrfResponse = await fetch('https://catalog.roblox.com/v1/search/items?category=All&limit=1')
        const csrfToken = csrfResponse.headers.get('x-csrf-token')

        if (!csrfToken) {
            throw new Error('Falha ao pegar token CSRF')
        }

        // Agora fazemos a requisição com o token
        const response = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                items: [{ itemType: 'Asset', id: Number(assetId) }]
            })
        })

        if (!response.ok) {
            throw new Error(`API retornou ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data.data?.[0] || {})
    } catch (error) {
        console.error('Erro ao buscar o catálogo do Roblox:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}