'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RobloxSearchItem {
    id: string
    name: string
    description?: string
    assetType: {
        id: number
        name: string
    }
    creator?: {
        id: number
        name: string
    }
    price?: number
    isLimited?: boolean
}

const CATEGORIES = [
    { id: 'All', name: 'Todos' },
    { id: 'Accessories', name: 'Acessórios' },
    { id: 'Clothing', name: 'Roupas' },
    { id: 'BodyParts', name: 'Partes do Corpo' },
    { id: 'Gear', name: 'Equipamentos' },
    { id: 'Animations', name: 'Animações' },
    { id: 'CommunityCreations', name: 'Criações da Comunidade' }
]

const SUBCATEGORIES: Record<string, { id: string, name: string }[]> = {
    'Clothing': [
        { id: 'Shirts', name: 'Camisas' },
        { id: 'TShirts', name: 'T-Shirts' },
        { id: 'Pants', name: 'Calças' }
    ],
    'Accessories': [
        { id: 'Hats', name: 'Chapéus' },
        { id: 'General', name: 'Acessórios Gerais' },
        { id: 'Head', name: 'Acessórios de Cabeça' }
    ]
}

export default function SearchSection() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<RobloxSearchItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        category: 'All',
        subcategory: '',
        minPrice: '',
        maxPrice: ''
    })

    const searchAssets = async (reset = true) => {
        if (!searchTerm.trim()) {
            toast.warning('Digite um termo para buscar')
            return
        }

        setIsLoading(true)
        if (reset) {
            setResults([])
            setCursor(null)
        }

        try {
            const params = new URLSearchParams({
                query: searchTerm,
                category: filters.category,
                ...(filters.subcategory && { subcategory: filters.subcategory }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(cursor && !reset && { cursor })
            })

            const res = await fetch(`/api/roblox/search?${params.toString()}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao buscar dados')
            }

            const newItems = data.data || data.items || []

            if (reset) {
                setResults(newItems)
            } else {
                setResults(prev => [...prev, ...newItems])
            }

            setCursor(data.nextPageCursor || data.nextCursor || null)
            toast.success(`${newItems.length} resultado(s) encontrados`)
        } catch (err) {
            console.error(err)
            toast.error(err instanceof Error ? err.message : 'Erro na busca')
        } finally {
            setIsLoading(false)
        }
    }

    const resetFilters = () => {
        setFilters({
            category: 'All',
            subcategory: '',
            minPrice: '',
            maxPrice: ''
        })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar assets no Roblox..."
                        className="pl-10 pr-4 py-6 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchAssets(true)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => searchAssets(true)}
                        className="py-6 px-6"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Buscando...' : 'Buscar'}
                    </Button>
                    <Button
                        variant="outline"
                        className="py-6 px-4"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                        {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle>Filtros de Busca</CardTitle>
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="mr-1 h-4 w-4" />
                                Limpar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Categoria</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={filters.category}
                                onChange={(e) =>
                                    setFilters({ ...filters, category: e.target.value, subcategory: '' })
                                }
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {SUBCATEGORIES[filters.category] && (
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subcategoria</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={filters.subcategory}
                                    onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                                >
                                    <option value="">Todas</option>
                                    {SUBCATEGORIES[filters.category].map((subcat) => (
                                        <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1 block">Preço Mínimo</label>
                            <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Preço Máximo</label>
                            <Input
                                type="number"
                                placeholder="Sem limite"
                                min="0"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-40 w-full rounded-t-lg" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-full mt-2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : results.length > 0 ? (
                <>
                    <ScrollArea className="h-[calc(100vh-300px)] rounded-md border p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {results.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                    <div className="relative aspect-square">
                                        <img
                                            src={`https://www.roblox.com/asset-thumbnail/image?assetId=${item.id}&width=420&height=420&format=png`}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-t-lg"
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.onerror = null
                                                target.src = ''
                                                target.parentElement!.className = 'relative aspect-square bg-muted flex items-center justify-center'
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium line-clamp-2 mb-1">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                            {item.description || 'Sem descrição'}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">
                                                {item.price === 0 ? 'Grátis' : `${item.price} R$`}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.id)
                                                    toast.success('ID copiado!', {
                                                        description: `ID: ${item.id}`
                                                    })
                                                }}
                                            >
                                                Copiar ID
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    {cursor && (
                        <div className="flex justify-center mt-6">
                            <Button
                                variant="outline"
                                onClick={() => searchAssets(false)}
                                disabled={isLoading}
                            >
                                Carregar mais
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                        {searchTerm ? 'Nenhum resultado encontrado' : 'Busque por itens do Roblox'}
                    </h3>
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? 'Tente ajustar seus filtros ou termos de busca'
                            : 'Digite um termo e clique em Buscar para encontrar assets'}
                    </p>
                </div>
            )}
        </div>
    )
}