// ✅ AccordionSection.tsx - cada categoria em dropdown com toggle
'use client'

import { Asset } from '@/lib/fetchRobloxData'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import AssetCard from './AssetCard'

export default function AccordionSection({
    categorized,
}: {
    categorized: Record<string, Asset[]>
}) {
    return (
        <Accordion type="multiple" className="w-full">
            {Object.entries(categorized).map(([category, assets]) => (
                <AccordionItem key={category} value={category}>
                    <AccordionTrigger>{category}</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assets.map((asset) => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}