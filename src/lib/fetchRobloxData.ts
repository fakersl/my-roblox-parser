// src/lib/fetchRobloxData.ts
export type Asset = {
    id: number
    name: string
    assetTypeId: number
    thumbnailUrl: string
}

export type CategorizedAssets = {
    [category: string]: Asset[]
}

const assetTypeMap: Record<number, string> = {
    // Accessories
    41: "HatAccessory",
    42: "HairAccessory",
    43: "FaceAccessory",
    44: "NeckAccessory",
    45: "ShoulderAccessory",
    46: "FrontAccessory",
    47: "BackAccessory",
    48: "WaistAccessory",

    // Clothing
    11: "Shirt",
    12: "Pants",
    13: "GraphicTShirt",

    // Body parts
    18: "Face",
    19: "Head",
    17: "Torso",
    15: "LeftArm",
    16: "RightArm",
    24: "LeftLeg",
    25: "RightLeg",

    // Animations
    32: "IdleAnimation",
    33: "WalkAnimation",
    34: "RunAnimation",
    35: "SwimAnimation",
    36: "ClimbAnimation",
    37: "FallAnimation",
    39: "JumpAnimation",
}

export async function fetchRobloxAssets(ids: number[]): Promise<CategorizedAssets> {
    const uniqueIds = [...new Set(ids)].filter(Boolean)

    const url = `https://catalog.roblox.com/v1/catalog/items/details?itemIds=${uniqueIds.join(",")}`
    const res = await fetch(url)
    const data = await res.json()

    const thumbnails = await fetch(
        `https://www.roblox.com/item-thumbnails?params=${encodeURIComponent(
            JSON.stringify(uniqueIds.map((id) => ({ assetId: id, imageSize: "110x110" })))
        )}`
    ).then((res) => res.json())

    const thumbMap: Record<number, string> = {}
    thumbnails.forEach((thumb: any) => {
        thumbMap[thumb.id] = thumb.thumbnailUrl
    })

    const categorized: CategorizedAssets = {}

    for (const item of data.data) {
        const category = assetTypeMap[item.assetTypeId]
        if (!category) continue

        const asset: Asset = {
            id: item.id,
            name: item.name,
            assetTypeId: item.assetTypeId,
            thumbnailUrl: thumbMap[item.id] || "",
        }

        if (!categorized[category]) categorized[category] = []
        categorized[category].push(asset)
    }

    return categorized
}
