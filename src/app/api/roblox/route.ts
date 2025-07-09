import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { ids } = await request.json()

        // Primeiro tentamos a API de thumbnails que não tem CORS
        const thumbnailRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${ids.join(',')}&size=420x420&format=Png`)
        const thumbnailData = await thumbnailRes.json()

        // Para cada ID, buscamos informações adicionais
        const assets = await Promise.all(
            ids.map(async (id: string, index: number) => {
                const imageUrl = thumbnailData.data[index]?.imageUrl || ''

                try {
                    // Usamos a API de marketplace como fallback
                    const infoRes = await fetch(`https://api.roblox.com/marketplace/productinfo?assetId=${id}`)
                    if (infoRes.ok) {
                        const infoData = await infoRes.json()
                        return {
                            id,
                            name: infoData.Name || `Asset ${id}`,
                            type: infoData.AssetTypeId || 0,
                            imageUrl
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching info for ${id}:`, error)
                }

                return {
                    id,
                    name: `Asset ${id}`,
                    type: 0,
                    imageUrl
                }
            })
        )

        return NextResponse.json({ success: true, data: assets })
    } catch (error) {
        console.error('Error in Roblox API route:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch asset data'
            },
            { status: 500 }
        )
    }
}
