import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.ROBLOX_CLIENT_ID;
    const redirectUri = process.env.ROBLOX_REDIRECT_URI;

    const state = crypto.randomUUID(); // opcional, para segurança (guardar no cookie/sessão)

    const authUrl = new URL('https://apis.roblox.com/oauth/v1/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri!);
    authUrl.searchParams.set('scope', 'openid'); // pode ajustar o scope conforme precisar
    authUrl.searchParams.set('state', state);

    // Redireciona usuário para a URL do OAuth Roblox
    return NextResponse.redirect(authUrl);
}
