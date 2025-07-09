import { NextResponse } from 'next/server'

const assetTypeMap: Record<number, string> = {
    8: "hataccessory",
    41: "hairaccessory",
    42: "faceaccessory",
    43: "neckaccessory",
    44: "shouldersaccessory",
    45: "frontaccessory",
    46: "backaccessory",
    47: "waistaccessory",
    48: "climbanimation",
    49: "deathanimation",
    50: "fallanimation",
    51: "idleanimation",
    52: "jumpanimation",
    53: "runanimation",
    54: "swimanimation",
    55: "walkanimation",
    56: "poseanimation",
    61: "emoteanimation",
    17: "head",
    18: "face",
    27: "torso",
    28: "rightarm",
    29: "leftarm",
    30: "leftleg",
    31: "rightleg",
    2: "graphictshirt",
    11: "shirt",
    12: "pants",
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const idsRaw = searchParams.get('ids')
        if (!idsRaw) return NextResponse.json({ success: false, error: 'No IDs provided' }, { status: 400 })

        const ids = idsRaw.split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id))
        if (ids.length === 0) return NextResponse.json({ success: false, error: 'No valid IDs provided' }, { status: 400 })

        const postBody = {
            itemDetailsRequest: {
                itemIds: ids,
                itemType: "Asset",
            },
        }

        const catalogRes = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody),
        })

        if (!catalogRes.ok) throw new Error('Catalog API failed')

        const catalogData = await catalogRes.json()

        const parsed = catalogData.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            assetTypeId: item.assetType,
            type: assetTypeMap[item.assetType] ?? 'unknown',
            imageUrl: item.iconImageUrl ?? ''
        }))


        return NextResponse.json({ success: true, data: parsed })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
    }
}
