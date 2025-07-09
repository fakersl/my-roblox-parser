// src/components/AssetCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Clipboard } from 'lucide-react'
import { toast } from 'sonner'

export default function AssetCard({ item }: { item: any }) {
    const copyId = () => {
        navigator.clipboard.writeText(item.id)
        toast.success('ID copiado!', {
            description: `ID: ${item.id}`
        })
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">
                    {item.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    {item.type}
                </p>
            </CardHeader>
            <CardContent>
                <div className="aspect-square bg-muted rounded mb-3 overflow-hidden">
                    <img
                        src={`https://www.roblox.com/asset-thumbnail/image?assetId=${item.id}&width=420&height=420`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={copyId}
                >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copiar ID: {item.id}
                </Button>
            </CardContent>
        </Card>
    )
}