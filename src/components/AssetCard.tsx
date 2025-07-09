'use client'

import { Asset } from '@/lib/fetchRobloxData'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export default function AssetCard({ asset }: { asset: Asset }) {
    const copyId = () => {
        navigator.clipboard.writeText(String(asset.id))
    }

    return (
        <div className="p-4 border rounded-xl flex flex-col items-center text-center space-y-2 bg-muted">
            <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-20 h-20 rounded-full object-cover"
            />
            <div className="text-sm font-medium">{asset.name}</div>
            <div className="text-xs text-gray-500">{asset.id}</div>
            <Button variant="outline" size="sm" onClick={copyId}>
                <Copy className="w-4 h-4 mr-1" /> Copiar ID
            </Button>
        </div>
    )
}
