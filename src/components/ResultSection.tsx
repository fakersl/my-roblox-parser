// ✅ ResultSection.tsx - mostra resultados com Accordion e botão
import { CategorizedAssets } from '@/lib/fetchRobloxData'
import AccordionSection from './AccordionSection'
import CopyAllButton from './CopyAllButton'

export default function ResultSection({ categorized }: { categorized: CategorizedAssets }) {
    return (
        <div className="space-y-4">
            <CopyAllButton categorized={categorized} />
            <AccordionSection categorized={categorized} />
        </div>
    )
}