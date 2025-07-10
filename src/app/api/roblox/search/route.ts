import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const params = {
    keyword: searchParams.get('query') || '',
    category: searchParams.get('category') || 'All',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '0',
    maxPrice: searchParams.get('maxPrice') || '',
    cursor: searchParams.get('cursor') || '',
    limit: '30'
  }

  try {
    // Primeiro obtemos o token X-CSRF-TOKEN
    const csrfResponse = await fetch('https://catalog.roblox.com/v1/search/items?category=All&limit=1')
    const csrfToken = csrfResponse.headers.get('x-csrf-token')

    if (!csrfToken) {
      throw new Error('Failed to get CSRF token')
    }

    let url = `https://catalog.roblox.com/v1/search/items?keyword=${encodeURIComponent(params.keyword)}&category=${params.category}&limit=${params.limit}`

    if (params.subcategory) url += `&subcategory=${params.subcategory}`
    if (params.minPrice) url += `&minPrice=${params.minPrice}`
    if (params.maxPrice) url += `&maxPrice=${params.maxPrice}`
    if (params.cursor) url += `&cursor=${params.cursor}`

    const response = await fetch(url, {
      headers: {
        'X-CSRF-TOKEN': csrfToken
      }
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching Roblox catalog:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}