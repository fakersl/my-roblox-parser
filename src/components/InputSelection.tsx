"use client"

import { useState, useEffect } from 'react'
import { Clipboard, ClipboardCheck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type Asset = {
    id: string
    name: string
    type: string
    typeId: number
    imageUrl: string
}

type AssetCategory = {
    name: string
    typeId: number
    items: Asset[]
    expanded: boolean
}

// Mapeamento de typeId para nomes de categoria mais amigáveis
const CATEGORY_NAMES: Record<number, string> = {
    1: 'Imagens',
    2: 'T-Shirts',
    3: 'Camisetas',
    4: 'Calças',
    5: 'Decalques',
    8: 'Acessórios',
    9: 'Roupas',
    10: 'Modelos',
    11: 'Plugins',
    12: 'Meshes',
    13: 'Pacotes',
    16: 'Cabeças',
    17: 'Faces',
    18: 'Equipamentos',
    19: 'Animações',
    24: 'Áudios',
    27: 'Adesivos',
    28: 'Emotes',
    29: 'Bundles',
    30: 'Experiências'
}

export default function InputSection() {
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<AssetCategory[]>([])
    const [copiedAll, setCopiedAll] = useState(false)

    const toggleCategory = (index: number) => {
        const newCategories = [...categories]
        newCategories[index].expanded = !newCategories[index].expanded
        setCategories(newCategories)
    }

    const fetchAssetDetails = async (ids: string[]): Promise<Asset[]> => {
        try {
            const response = await fetch('/api/roblox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });

            if (!response.ok) throw new Error('Failed to fetch assets');

            const { data } = await response.json();

            return data.map((asset: any) => ({
                ...asset,
                type: CATEGORY_NAMES[asset.type] || 'Desconhecido',
                typeId: asset.type
            }));
        } catch (error) {
            console.error('Error fetching assets:', error);
            toast.error('Erro ao buscar assets');
            return ids.map(id => ({
                id,
                name: `Asset ${id}`,
                type: 'Desconhecido',
                typeId: 0,
                imageUrl: ''
            }));
        }
    };

    const parseAssets = async () => {
        if (!input.trim()) {
            toast.warning('Por favor, insira algum ID para analisar');
            return;
        }

        setIsLoading(true);
        setCategories([]);
        toast.info('Iniciando análise dos assets...');

        const ids = [...new Set(
            input.split(/[\s,]+/).map(id => id.trim()).filter(id => /^\d+$/.test(id))
        )];

        if (ids.length === 0) {
            toast.error('Nenhum ID válido encontrado', {
                description: 'Por favor, insira IDs numéricos válidos do Roblox'
            });
            setIsLoading(false);
            return;
        }

        if (ids.length > 50) {
            toast.warning(`Muitos IDs (${ids.length})`, {
                description: 'A análise pode demorar devido à quantidade de assets'
            });
        }

        const batchSize = 20;
        const batches = [];
        for (let i = 0; i < ids.length; i += batchSize) {
            batches.push(ids.slice(i, i + batchSize));
        }

        let assets: Asset[] = [];
        for (const [index, batch] of batches.entries()) {
            toast.info(`Processando lote ${index + 1}/${batches.length}`);
            const batchAssets = await fetchAssetDetails(batch);
            assets = [...assets, ...batchAssets];
        }

        const copyAllIds = () => {
            const allIds = categories.flatMap(cat => cat.items.map(item => item.id)).join(', ')
            navigator.clipboard.writeText(allIds)
            setCopiedAll(true)
            toast.success('Todos os IDs copiados!', {
                description: `${categories.reduce((sum, cat) => sum + cat.items.length, 0)} IDs copiados para a área de transferência`
            })
            setTimeout(() => setCopiedAll(false), 2000)
        }

        const copySingleId = (id: string) => {
            navigator.clipboard.writeText(id)
            toast.success('ID copiado!', {
                description: `O ID ${id} foi copiado para a área de transferência`
            })
        }

        const copyCategoryIds = (category: AssetCategory) => {
            const ids = category.items.map(item => item.id).join(', ')
            navigator.clipboard.writeText(ids)
            toast.success('IDs da categoria copiados!', {
                description: `${category.items.length} IDs da categoria ${category.name} copiados`
            })
        }

        setIsLoading(false);

        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Cole os IDs aqui (separados por vírgulas ou espaços)"
                        className="flex-1 min-h-[100px]"
                        onPaste={(e) => {
                            setInput(e.clipboardData.getData('text'))
                            toast.info('IDs colados!', {
                                description: 'Clique em "Analisar Assets" para processar'
                            })
                        }}
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
                                        {category.items.map((asset, assetIndex) => (
                                            <div key={assetIndex} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="relative aspect-square bg-muted">
                                                    {asset.imageUrl ? (
                                                        <img
                                                            src={asset.imageUrl}
                                                            alt={asset.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    (e.target as HTMLImageElement).parentElement!.className = 'relative aspect-square bg-muted flex items-center justify-center'
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
};