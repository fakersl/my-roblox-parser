// app/api/roblox/route.ts
import { NextResponse } from 'next/server'

const assetCache = new Map<string, any>();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
        return NextResponse.json(
            { error: 'assetId is required' },
            { status: 400 }
        )
    }

    /* Verificando se os dados puxados já estão no cache */
    if (assetCache.has(assetId)) {
        return NextResponse.json(assetCache.get(assetId));
    }

    try {
        // Endpoint público que não requer CSRF
        const response = await fetch(
            `https://economy.roblox.com/v2/assets/${assetId}/details`
        )
        console.log('Limite:', response.headers.get('x-ratelimit-limit'));
        console.log('Restantes:', response.headers.get('x-ratelimit-remaining'));
        console.log('Reset(s):', response.headers.get('x-ratelimit-reset'));

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()

        return NextResponse.json({
            id: assetId,
            name: data.Name,
            type: data.AssetType,
            category: mapToYourCategory(data.AssetType),
            imageUrl: `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`,
            creator: data.Creator?.Name || 'Roblox',
            price: data.PriceInRobux || 0,
            isLimited: data.IsLimited || false
        })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// Mapeia tipos oficiais para suas categorias personalizadas
function mapToYourCategory(assetType: string): string {
    const map: Record<string, string> = {
        'Image': 'Image',
        'TShirt': 'TShirt',
        'Audio': 'Audio',
        'Mesh': 'Mesh',
        'Lua': 'Lua',
        'Hat': 'Hat',
        'Place': 'Place',
        'Model': 'Model',
        'Shirt': 'Shirt',
        'Pants': 'Pants',
        'Decal': 'Decal',
        'Head': 'Head',
        'Face': 'Face',
        'Gear': 'Gear',
        'Badge': 'Badge',
        'Animation': 'Animation',
        'Package': 'Package',
        'GamePass': 'GamePass',
        'Plugin': 'Plugin',
        'MeshPart': 'MeshPart',
        'HairAccessory': 'HairAccessory',
        'FaceAccessory': 'FaceAccessory',
        'NeckAccessory': 'NeckAccessory',
        'ShoulderAccessory': 'ShoulderAccessory',
        'FrontAccessory': 'FrontAccessory',
        'BackAccessory': 'BackAccessory',
        'WaistAccessory': 'WaistAccessory',
        'ClimbAnimation': 'ClimbAnimation',
        'DeathAnimation': 'DeathAnimation',
        'FallAnimation': 'FallAnimation',
        'IdleAnimation': 'IdleAnimation',
        'JumpAnimation': 'JumpAnimation',
        'RunAnimation': 'RunAnimation',
        'SwimAnimation': 'SwimAnimation',
        'WalkAnimation': 'WalkAnimation',
        'PoseAnimation': 'PoseAnimation',
        'EarAccessory': 'EarAccessory',
        'EyeAccessory': 'EyeAccessory',
        'EmoteAnimation': 'EmoteAnimation',
        'Video': 'Video',
        'TShirtAccessory': 'TShirtAccessory',
        'ShirtAccessory': 'ShirtAccessory',
        'PantsAccessory': 'PantsAccessory',
        'JacketAccessory': 'JacketAccessory',
        'SweaterAccessory': 'SweaterAccessory',
        'ShortsAccessory': 'ShortsAccessory',
        'LeftShoeAccessory': 'LeftShoeAccessory',
        'RightShoeAccessory': 'RightShoeAccessory',
        'DressSkirtAccessory': 'DressSkirtAccessory'
    }

    return map[assetType] || assetType
}
