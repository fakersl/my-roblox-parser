"use client"

import { useState } from 'react'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

const CATEGORIES = [
    { id: 1, name: 'Todos' },
    { id: 3, name: 'Roupas' },
    { id: 4, name: 'Partes do Corpo' },
    { id: 5, name: 'Equipamentos' },
    { id: 11, name: 'Acessórios' },
    { id: 12, name: 'Animações' },
    { id: 13, name: 'Criações da Comunidade' }
]

const SUBCATEGORIES = {
    3: [ // Roupas
        { id: 12, name: 'Camisas' },
        { id: 13, name: 'T-Shirts' },
        { id: 14, name: 'Calças' }
    ],
    11: [ // Acessórios
        { id: 9, name: 'Chapéus' },
        { id: 19, name: 'Acessórios Gerais' },
        { id: 54, name: 'Acessórios de Cabeça' }
    ]
}

export default function SearchSection() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [filters, setFilters] = useState({
        category: '1',
        subcategory: '',
        minPrice: '',
        maxPrice: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    const searchAssets = async () => {
        if (!searchTerm.trim()) {
            toast.warning('Por favor, digite um termo para buscar')
            return
        }

        setIsLoading(true)
        setResults([])

        try {
            const params = new URLSearchParams({
                keyword: searchTerm,
                category: filters.category,
                ...(filters.subcategory && { subcategory: filters.subcategory }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice })
            })

            const response = await fetch(`/api/roblox/search?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                setResults(data.data)
                toast.success(`Encontrados ${data.data.length} resultados`)
            } else {
                toast.error('Erro na busca')
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error('Falha ao buscar assets')
        } finally {
            setIsLoading(false)
        }
    }

    const resetFilters = () => {
        setFilters({
            category: '1',
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
                        onKeyDown={(e) => e.key === 'Enter' && searchAssets()}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={searchAssets}
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
                        {showFilters ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle>Filtros de Busca</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                            >
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
                                onChange={(e) => {
                                    setFilters({ ...filters, category: e.target.value, subcategory: '' })
                                }}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {SUBCATEGORIES[filters.category as unknown as keyof typeof SUBCATEGORIES] && (
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subcategoria</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={filters.subcategory}
                                    onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                                >
                                    <option value="">Todas</option>
                                    {SUBCATEGORIES[filters.category as unknown as keyof typeof SUBCATEGORIES].map((subcat) => (
                                        <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1 block">Preço Mínimo (R$)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Preço Máximo (R$)</label>
                            <Input
                                type="number"
                                placeholder="Sem limite"
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
                <ScrollArea className="h-[calc(100vh-300px)] rounded-md border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.map((item) => (
                            <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                <div className="relative aspect-square">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-t-lg"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                            Sem imagem
                                        </div>
                                    )}
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
                                        <Button size="sm" onClick={() => {
                                            navigator.clipboard.writeText(item.id.toString())
                                            toast.success('ID copiado!', {
                                                description: `ID: ${item.id}`
                                            })
                                        }}>
                                            Copiar ID
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? `Tente ajustar seus filtros ou termos de busca`
                            : 'Digite um termo e clique em Buscar para encontrar assets'}
                    </p>
                </div>
            )}
        </div>
    )
}