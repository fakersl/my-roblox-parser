// app/api/roblox/route.ts
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Configuração do Redis com fallback para erro explícito
const getRedisClient = () => {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        throw new Error('Variáveis de ambiente do Redis não configuradas')
    }
    return new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    })
}

const redis = getRedisClient()
const CACHE_TTL = 30 * 24 * 60 * 60 // 30 dias em segundos

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId || !/^\d+$/.test(assetId)) {
        return NextResponse.json(
            { error: 'ID de asset inválido ou não fornecido' },
            { status: 400 }
        )
    }

    const cacheKey = `roblox:asset:${assetId}`

    try {
        // 1. Tentar obter do cache
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            return NextResponse.json({
                ...cachedData,
                source: 'cache',
                ttl: await redis.ttl(cacheKey)
            })
        }

        // 2. Buscar da API Roblox
        const apiStart = Date.now()
        const response = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`, {
            next: { revalidate: 3600 } // Cache de 1 hora no edge
        })

        const rateLimit = {
            limit: response.headers.get('x-ratelimit-limit'),
            remaining: response.headers.get('x-ratelimit-remaining'),
            reset: response.headers.get('x-ratelimit-reset')
        }

        if (!response.ok) {
            if (response.status === 429) {
                return NextResponse.json(
                    {
                        error: 'Rate limit excedido',
                        ...rateLimit,
                        suggestion: 'Tente novamente mais tarde ou use cache existente'
                    },
                    { status: 429 }
                )
            }
            throw new Error(`API retornou status ${response.status}`)
        }

        const data = await response.json()
        const apiDuration = Date.now() - apiStart

        // 3. Processar resposta
        const result = {
            id: assetId,
            name: data.Name,
            type: data.AssetType,
            typeId: data.AssetTypeId,
            category: mapToYourCategory(data.AssetType),
            imageUrl: `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`,
            creator: data.Creator ? {
                id: data.Creator.Id,
                name: data.Creator.Name,
                type: data.Creator.CreatorType
            } : { name: 'Roblox' },
            price: data.PriceInRobux || 0,
            isLimited: data.IsLimited || false,
            isLimitedUnique: data.IsLimitedUnique || false,
            sales: data.Sales || 0,
            created: data.Created || null,
            updated: data.Updated || null,
            metrics: {
                apiDurationMs: apiDuration,
                rateLimit
            },
            cachedAt: new Date().toISOString()
        }

        // 4. Armazenar no Redis
        await redis.setex(cacheKey, CACHE_TTL, result)

        return NextResponse.json({
            ...result,
            source: 'api',
            cacheStatus: 'miss'
        })

    } catch (error) {
        console.error(`Erro ao processar asset ${assetId}:`, error)

        // Tentar retornar dados incompletos do cache em caso de erro
        try {
            const staleData = await redis.get(cacheKey)
            if (staleData) {
                return NextResponse.json({
                    ...staleData,
                    source: 'stale-cache',
                    error: error instanceof Error ? error.message : 'Erro na API, retornando dados cacheados'
                }, { status: 200 })
            }
        } catch (cacheError) {
            console.error('Erro ao acessar cache:', cacheError)
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                assetId,
                suggestion: 'Verifique o ID ou tente novamente mais tarde'
            },
            { status: 500 }
        )
    }
}

// Rota para gerenciamento avançado do cache
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const clearAll = searchParams.get('clearAll') === 'true'

    try {
        if (clearAll) {
            // Limpar todos os assets do cache
            const keys = await redis.keys('roblox:asset:*')
            if (keys.length > 0) {
                await redis.del(...keys)
            }
            return NextResponse.json({
                success: true,
                message: `Cache limpo (${keys.length} itens removidos)`
            })
        }

        if (!assetId) {
            return NextResponse.json(
                { error: 'assetId é necessário ou use clearAll=true' },
                { status: 400 }
            )
        }

        // Limpar asset específico
        const deleted = await redis.del(`roblox:asset:${assetId}`)
        return NextResponse.json({
            success: deleted > 0,
            message: deleted > 0
                ? `Cache para ${assetId} removido`
                : `Asset ${assetId} não encontrado no cache`
        })

    } catch (error) {
        console.error('Erro ao limpar cache:', error)
        return NextResponse.json(
            {
                error: 'Falha ao limpar cache',
                details: error instanceof Error ? error.message : null
            },
            { status: 500 }
        )
    }
}

// Mapeamento completo de categorias
function mapToYourCategory(assetType: string): string {
    const categoryMap: Record<string, string> = {
        // Acessórios
        'Hat': 'HatAccessory',
        'HairAccessory': 'HairAccessory',
        'FaceAccessory': 'FaceAccessory',
        'NeckAccessory': 'NeckAccessory',
        'ShoulderAccessory': 'ShoulderAccessory',
        'FrontAccessory': 'FrontAccessory',
        'BackAccessory': 'BackAccessory',
        'WaistAccessory': 'WaistAccessory',
        'EarAccessory': 'EarAccessory',
        'EyeAccessory': 'EyeAccessory',

        // Roupas
        'TShirt': 'GraphicTShirt', // Changed from duplicate 'TShirt' to 'GraphicTShirt'
        'Shirt': 'Shirt',
        'Pants': 'Pants',
        'Jacket': 'Jacket',
        'Sweater': 'Sweater',
        'Shorts': 'Shorts',
        'LeftShoe': 'LeftShoe',
        'RightShoe': 'RightShoe',
        'DressSkirt': 'DressSkirt',

        // Avatar
        'Head': 'Head',
        'Face': 'Face',
        'Torso': 'Torso',
        'LeftArm': 'LeftArm',
        'RightArm': 'RightArm',
        'LeftLeg': 'LeftLeg',
        'RightLeg': 'RightLeg',

        // Conteúdo
        'Image': 'Image',
        'Audio': 'Audio',
        'Mesh': 'Mesh',
        'Lua': 'Lua',
        'Model': 'Model',
        'Decal': 'Decal',
        'Video': 'Video',
        'Plugin': 'Plugin',
        'Package': 'Package',
        'GamePass': 'GamePass',
        'Badge': 'Badge',
        'Place': 'Place',
        'MeshPart': 'MeshPart',

        // Animações
        'Animation': 'Animation',
        'EmoteAnimation': 'EmoteAnimation',
        'ClimbAnimation': 'ClimbAnimation',
        'DeathAnimation': 'DeathAnimation',
        'FallAnimation': 'FallAnimation',
        'IdleAnimation': 'IdleAnimation',
        'JumpAnimation': 'JumpAnimation',
        'RunAnimation': 'RunAnimation',
        'SwimAnimation': 'SwimAnimation',
        'WalkAnimation': 'WalkAnimation',
        'PoseAnimation': 'PoseAnimation'
    }

    return categoryMap[assetType] || assetType
}

// Rota adicional para pré-carregar múltiplos assets
export async function POST(request: Request) {
    try {
        const { assetIds } = await request.json()

        if (!Array.isArray(assetIds)) {
            return NextResponse.json(
                { error: 'assetIds deve ser um array de IDs' },
                { status: 400 }
            )
        }

        const results = await Promise.all(
            assetIds.map(async (id) => {
                try {
                    const res = await fetch(`http://${request.headers.get('host')}/api/roblox?assetId=${id}`)
                    return await res.json()
                } catch (error) {
                    return {
                        id,
                        error: error instanceof Error ? error.message : 'Failed to fetch'
                    }
                }
            })
        )

        return NextResponse.json(results)
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request format' },
            { status: 400 }
        )
    }
}