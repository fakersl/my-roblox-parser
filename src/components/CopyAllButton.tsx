// ✅ CopyAllButton.tsx - botão para copiar todos os IDs já categorizados
'use client'

import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Asset } from '@/lib/fetchRobloxData'

export default function CopyAllButton({
    categorized,
}: {
    categorized: Record<string, Asset[]>
}) {
    const handleCopy = () => {
        const lines = Object.entries(categorized).flatMap(([category, assets]) =>
            assets.map((asset) => `${category}: ${asset.id}`)
        )
        navigator.clipboard.writeText(lines.join('\n'))
    }

    return (
        <Button onClick={handleCopy} variant="default" className="mb-6">
            <Copy className="w-4 h-4 mr-2" /> Copiar todos IDs formatados
        </Button>
    )
}
