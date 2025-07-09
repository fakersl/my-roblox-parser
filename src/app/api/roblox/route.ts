import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const query = searchParams.get('query')
    const cursor = searchParams.get('cursor')

    try {
        let url: string
        let options: RequestInit = {}

        if (assetId) {
            url = 'https://catalog.roblox.com/v1/catalog/items/details'
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{ itemType: 'Asset', id: Number(assetId) }]
                })
            }
        } else if (query) {
            url = `https://catalog.roblox.com/v1/search/items?keyword=${query}&limit=30`
            if (cursor) url += `&cursor=${cursor}`
        } else {
            return NextResponse.json(
                { error: 'Parâmetros inválidos' },
                { status: 400 }
            )
        }

        const response = await fetch(url, options)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Erro na API Roblox')
        }

        return NextResponse.json(assetId ? data.data[0] : data)
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro desconhecido' },
            { status: 500 }
        )
    }
}