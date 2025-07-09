import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || ''
    const limit = searchParams.get('limit') || '10'
    const cursor = searchParams.get('cursor') || ''

    if (!keyword.trim()) {
      return NextResponse.json({ success: false, error: 'Keyword is required' }, { status: 400 })
    }

    const params = new URLSearchParams({
      Keyword: keyword,
      Limit: limit,
    })
    if (cursor) params.append('Cursor', cursor)

    const apiUrl = `https://catalog.roblox.com/v1/search/items?${params.toString()}`

    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Roblox v1 API error')

    const data = await response.json()

    const itemsWithThumbnails = await Promise.all(
      data.data.map(async (item: any) => {
        const thumbRes = await fetch(
          `https://thumbnails.roblox.com/v1/assets?assetIds=${item.id}&size=420x420&format=Png&isCircular=false`
        )
        const thumbData = await thumbRes.json()

        return {
          ...item,
          imageUrl: thumbData.data?.[0]?.imageUrl || '',
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: itemsWithThumbnails,
      nextPageCursor: data.nextPageCursor || null,
      previousPageCursor: data.previousPageCursor || null,
    })
  } catch (error) {
    console.error('Search v1 error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch assets from Roblox v1' }, { status: 500 })
  }
}
