"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InputSelection from './InputSelection'
import SearchSection from './SearchSection'

export default function AssetParser() {
    return (
        <Tabs defaultValue="ids" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto mb-8">
                <TabsTrigger value="ids">Por IDs</TabsTrigger>
                <TabsTrigger value="search">Busca Avançada</TabsTrigger>
            </TabsList>
            <TabsContent value="ids">
                <InputSelection />
            </TabsContent>
            <TabsContent value="search">
                <SearchSection />
            </TabsContent>
        </Tabs>
    )
}