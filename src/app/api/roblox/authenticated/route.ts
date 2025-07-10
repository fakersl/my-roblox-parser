// app/api/roblox/authenticated/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const robloxCookie = process.env.ROBLOX_COOKIE; // Armazene seu cookie nas variáveis de ambiente
    const { assetId } = await request.json();

    // 1. Obter CSRF Token
    const csrfResponse = await fetch('https://auth.roblox.com/v2/logout', {
        method: 'POST',
        headers: {
            'Cookie': `.ROBLOSECURITY=${robloxCookie}`
        }
    });
    const csrfToken = csrfResponse.headers.get('x-csrf-token');

    // 2. Fazer requisição autenticada
    const response = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken!,
            'Cookie': `.ROBLOSECURITY=${robloxCookie}`
        },
        body: JSON.stringify({
            items: [{ itemType: 'Asset', id: assetId }]
        })
    });

    const data = await response.json();
    return NextResponse.json(data);
}