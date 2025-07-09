'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandGroup,
} from '@/components/ui/command'

type Asset = {
    id: string
    name: string
    type: 'Clothing' | 'Accessory' | 'Animation' | 'Other'
    thumbnail?: string
}

export function InventoryDropdown() {
    const [inventory, setInventory] = useState<Asset[]>([])
    const [selectedType, setSelectedType] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Simulação de fetch do inventário
    useEffect(() => {
        // Dentro do InventoryDropdown.tsx
        const fetchInventory = async (accessToken: string) => {
            // 1. Obter user ID
            const userResponse = await fetch('https://users.roblox.com/v1/users/authenticated', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const userData = await userResponse.json();

            // 2. Obter inventário
            const inventoryResponse = await fetch(
                `https://inventory.roblox.com/v2/users/${userData.id}/items?assetTypes=Clothing,Accessory,Animation`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            return inventoryResponse.json();
        }
    }, [])

    // Filtra os itens por tipo e busca
    const filteredItems = inventory.filter(item => {
        const matchesType = selectedType === 'All' || item.type === selectedType
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const assetTypes = ['All', 'Clothing', 'Accessory', 'Animation', 'Other']

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <span>Meu Inventário</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <Command shouldFilter={false}>
                    <div className="p-2">
                        <CommandInput
                            placeholder="Buscar itens..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2">Categorias</DropdownMenuLabel>
                        <div className="flex flex-wrap gap-1 px-2 pb-2">
                            {assetTypes.map(type => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedType(type)}
                                    className="text-xs h-8"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandGroup heading="Itens">
                            {isLoading ? (
                                <CommandItem className="text-center py-4">
                                    Carregando...
                                </CommandItem>
                            ) : filteredItems.length === 0 ? (
                                <CommandItem className="text-center py-4">
                                    Nenhum item encontrado
                                </CommandItem>
                            ) : (
                                filteredItems.map(item => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.name}
                                        className="cursor-pointer"
                                        onSelect={() => console.log('Item selecionado:', item)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.thumbnail && (
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.name}
                                                    className="w-8 h-8 rounded"
                                                />
                                            )}
                                            <span>{item.name}</span>
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {item.type}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}