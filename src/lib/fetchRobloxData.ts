export async function fetchAssetDetails(assetId: string) {
    const res = await fetch(`/api/roblox?assetId=${assetId}`)
    if (!res.ok) throw new Error('Failed to fetch asset')
    return await res.json()
}

export async function searchAssets(query: string, cursor?: string) {
    const url = `/api/roblox?query=${encodeURIComponent(query)}${cursor ? `&cursor=${cursor}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to search assets')
    return await res.json()
}