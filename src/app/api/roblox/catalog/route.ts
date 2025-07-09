import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
        return NextResponse.json(
            { error: 'assetId is required' },
            { status: 400 }
        )
    }

    try {
        const response = await fetch(`https://catalog.roblox.com/v1/catalog/items/details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [{ itemType: 'Asset', id: Number(assetId) }]
            })
        })

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data.data?.[0] || {})
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}