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
    // ✅ Accessories
    8: "HatAccessory",
    41: "HairAccessory",
    42: "FaceAccessory",
    43: "NeckAccessory",
    44: "ShoulderAccessory",
    45: "FrontAccessory",
    46: "BackAccessory",
    47: "WaistAccessory",

    // ✅ Clothing
    11: "Shirt",
    12: "Pants",
    2: "GraphicTShirt", // Classic T-Shirt

    // ✅ Body parts
    17: "Head",
    18: "Face",
    27: "Torso",
    28: "RightArm",
    29: "LeftArm",
    30: "LeftLeg",
    31: "RightLeg",

    // ✅ Animations
    48: "ClimbAnimation",
    49: "DeathAnimation",
    50: "FallAnimation",
    51: "IdleAnimation",
    52: "JumpAnimation",
    53: "RunAnimation",
    54: "SwimAnimation",
    55: "WalkAnimation",
    56: "PoseAnimation",
    61: "EmoteAnimation",
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
