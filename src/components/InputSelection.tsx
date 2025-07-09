'use client'

import { useState } from 'react'
import { Clipboard, ClipboardCheck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface RobloxAsset {
    id: string
    name: string
    type: string
    typeId: number
    category: string
    imageUrl: string
    creator?: string
    price?: number
    isLimited?: boolean
}

interface AssetCategory {
    name: string
    typeId: number
    items: RobloxAsset[]
    expanded: boolean
}

const ASSET_TYPE_MAPPING: Record<number, { name: string; category: string }> = {
    // Acessórios
    8: { name: 'Acessório', category: 'Accessory' },
    41: { name: 'Cabelo', category: 'HairAccessory' },
    42: { name: 'Chapéu', category: 'HatAccessory' },
    43: { name: 'Rosto', category: 'FaceAccessory' },
    44: { name: 'Pescoço', category: 'NeckAccessory' },
    45: { name: 'Ombro', category: 'ShouldersAccessory' },
    46: { name: 'Frente', category: 'FrontAccessory' },
    47: { name: 'Costas', category: 'BackAccessory' },
    48: { name: 'Cintura', category: 'WaistAccessory' },

    // Animações
    19: { name: 'Animação', category: 'Animation' },
    32: { name: 'Animação de Idle', category: 'IdleAnimation' },
    33: { name: 'Animação de Corrida', category: 'RunAnimation' },
    34: { name: 'Animação de Caminhada', category: 'WalkAnimation' },
    35: { name: 'Animação de Natação', category: 'SwimAnimation' },
    36: { name: 'Animação de Pulo', category: 'JumpAnimation' },
    37: { name: 'Animação de Queda', category: 'FallAnimation' },
    38: { name: 'Animação de Escalada', category: 'ClimbAnimation' },
    39: { name: 'Animação de Humor', category: 'MoodAnimation' },

    // Partes do Corpo
    16: { name: 'Cabeça', category: 'Head' },
    17: { name: 'Rosto', category: 'Face' },
    18: { name: 'Torso', category: 'Torso' },
    27: { name: 'Braço Esquerdo', category: 'LeftArm' },
    28: { name: 'Braço Direito', category: 'RightArm' },
    29: { name: 'Perna Esquerda', category: 'LeftLeg' },
    30: { name: 'Perna Direita', category: 'RightLeg' },

    // Roupas
    2: { name: 'T-Shirt', category: 'GraphicTShirt' },
    3: { name: 'Camisa', category: 'Shirt' },
    4: { name: 'Calça', category: 'Pants' },

    // Outros
    1: { name: 'Imagem', category: 'Image' },
    5: { name: 'Decalque', category: 'Decal' },
    10: { name: 'Modelo', category: 'Model' },
    11: { name: 'Plugin', category: 'Plugin' },
    12: { name: 'Mesh', category: 'Mesh' },
    13: { name: 'Pacote', category: 'Package' },
    24: { name: 'Áudio', category: 'Audio' }
}

export default function InputSelection() {
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<AssetCategory[]>([])
    const [copiedAll, setCopiedAll] = useState(false)

    const toggleCategory = (index: number) => {
        const newCategories = [...categories]
        newCategories[index].expanded = !newCategories[index].expanded
        setCategories(newCategories)
    }

    const fetchAssetDetails = async (id: string): Promise<RobloxAsset> => {
        try {
            const response = await fetch(`/api/roblox/catalog?assetId=${id}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch asset ${id}`)
            }

            const data = await response.json()
            const typeInfo = ASSET_TYPE_MAPPING[data.assetType?.id || data.assetTypeId] || {
                name: 'Desconhecido',
                category: 'Other'
            }

            return {
                id,
                name: data.name || `Item ${id}`,
                type: typeInfo.name,
                typeId: data.assetType?.id || data.assetTypeId,
                category: typeInfo.category,
                imageUrl: `https://www.roblox.com/asset-thumbnail/image?assetId=${id}&width=420&height=420&format=png`,
                creator: data.creator?.name || data.creatorName,
                price: data.price || 0,
                isLimited: data.isLimited || false
            }
        } catch (error) {
            console.error(`Error fetching asset ${id}:`, error)
            return {
                id,
                name: `Item ${id}`,
                type: 'Erro ao carregar',
                typeId: 0,
                category: 'Error',
                imageUrl: '',
                creator: '',
                price: 0,
                isLimited: false
            }
        }
    }

    const parseAssets = async () => {
        if (!input.trim()) {
            toast.warning('Por favor, insira algum ID para analisar')
            return
        }

        setIsLoading(true)
        setCategories([])
        toast.info('Iniciando análise dos assets...')

        // Processa os IDs de entrada
        const ids = [...new Set(
            input.split(/[\s,]+/).map(id => id.trim()).filter(id => /^\d+$/.test(id))
        )]

        if (ids.length === 0) {
            toast.error('Nenhum ID válido encontrado', {
                description: 'Por favor, insira IDs numéricos válidos do Roblox'
            })
            setIsLoading(false)
            return
        }

        if (ids.length > 50) {
            toast.warning(`Muitos IDs (${ids.length})`, {
                description: 'A análise pode demorar devido à quantidade de assets'
            })
        }

        // Processa em lotes para melhor performance
        const batchSize = 10
        const allAssets: RobloxAsset[] = []

        for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize)
            toast.info(`Processando itens ${i + 1}-${Math.min(i + batchSize, ids.length)} de ${ids.length}`)

            const batchResults = await Promise.all(batch.map(id => fetchAssetDetails(id)))
            allAssets.push(...batchResults.filter(asset => asset.typeId !== 0)) // Filtra erros
        }

        // Agrupa por tipo
        const grouped = allAssets.reduce((acc, asset) => {
            const existingCategory = acc.find(cat => cat.typeId === asset.typeId)

            if (existingCategory) {
                existingCategory.items.push(asset)
            } else {
                acc.push({
                    name: asset.type,
                    typeId: asset.typeId,
                    items: [asset],
                    expanded: true
                })
            }

            return acc
        }, [] as AssetCategory[])

        // Ordena categorias
        grouped.sort((a, b) => {
            if (b.items.length !== a.items.length) return b.items.length - a.items.length
            return a.typeId - b.typeId
        })

        setCategories(grouped)
        setIsLoading(false)

        toast.success('Análise concluída!', {
            description: `${allAssets.length} assets organizados em ${grouped.length} categorias`
        })
    }

    const copyAllIds = () => {
        const allIds = categories.flatMap(cat => cat.items.map(item => item.id)).join(', ')
        navigator.clipboard.writeText(allIds)
        setCopiedAll(true)
        toast.success('Todos os IDs copiados!', {
            description: `${categories.reduce((sum, cat) => sum + cat.items.length, 0)} IDs copiados`
        })
        setTimeout(() => setCopiedAll(false), 2000)
    }

    const copySingleId = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success('ID copiado!', {
            description: `ID ${id} copiado para a área de transferência`
        })
    }

    const copyCategoryIds = (category: AssetCategory) => {
        const ids = category.items.map(item => item.id).join(', ')
        navigator.clipboard.writeText(ids)
        toast.success('IDs da categoria copiados!', {
            description: `${category.items.length} IDs copiados`
        })
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Cole os IDs aqui (separados por vírgulas ou espaços)"
                    className="flex-1 min-h-[100px]"
                    onPaste={() => toast.info('IDs colados! Clique em "Analisar Assets" para processar')}
                />
                <Button
                    onClick={parseAssets}
                    disabled={isLoading}
                    className="min-h-[100px] md:min-h-0"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        'Analisar Assets'
                    )}
                </Button>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/4" />
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="flex flex-col gap-2">
                                        <Skeleton className="h-40 w-full rounded-lg" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-10 w-full rounded-md" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && categories.length > 0 && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            Resultados: {categories.reduce((sum, cat) => sum + cat.items.length, 0)} assets
                        </h2>
                        <Button variant="outline" onClick={copyAllIds} className="gap-2">
                            {copiedAll ? (
                                <>
                                    <ClipboardCheck className="h-4 w-4" />
                                    Copiados!
                                </>
                            ) : (
                                <>
                                    <Clipboard className="h-4 w-4" />
                                    Copiar todos os IDs
                                </>
                            )}
                        </Button>
                    </div>

                    {categories.map((category, catIndex) => (
                        <Card key={catIndex} className="overflow-hidden">
                            <CardHeader
                                className="cursor-pointer flex flex-row items-center justify-between bg-secondary/50 hover:bg-secondary/70 transition-colors"
                                onClick={() => toggleCategory(catIndex)}
                            >
                                <div className="flex items-center gap-4">
                                    <CardTitle className="text-lg">
                                        {category.name} ({category.items.length})
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            copyCategoryIds(category)
                                        }}
                                    >
                                        <Clipboard className="mr-1 h-3 w-3" />
                                        Copiar IDs
                                    </Button>
                                </div>
                                {category.expanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </CardHeader>

                            {category.expanded && (
                                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {category.items.map((asset) => (
                                        <div key={asset.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="relative aspect-square bg-muted">
                                                {asset.imageUrl ? (
                                                    <img
                                                        src={asset.imageUrl}
                                                        alt={asset.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = ''
                                                            target.parentElement!.className = 'relative aspect-square bg-muted flex items-center justify-center'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        Sem imagem
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium line-clamp-2 mb-2" title={asset.name}>
                                                    {asset.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground font-mono">ID: {asset.id}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copySingleId(asset.id)}
                                                        className="h-8"
                                                    >
                                                        <Clipboard className="mr-1 h-3 w-3" />
                                                        Copiar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}