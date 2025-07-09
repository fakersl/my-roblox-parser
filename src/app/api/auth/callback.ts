import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for better type safety
type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
};

type ErrorResponse = {
    error: string;
    error_description?: string;
};

export async function GET(request: Request) {
    // Generate a unique request ID for tracing
    const requestId = uuidv4();

    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Validate environment variables early
        const requiredEnvVars = [
            'ROBLOX_CLIENT_ID',
            'ROBLOX_CLIENT_SECRET',
            'ROBLOX_REDIRECT_URI'
        ];

        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingEnvVars.length > 0) {
            console.error(`[${requestId}] Missing required environment variables: ${missingEnvVars.join(', ')}`);
            return NextResponse.json(
                { success: false, error: 'Server configuration error', requestId },
                { status: 500 }
            );
        }

        // Handle OAuth errors from provider
        if (error) {
            console.warn(`[${requestId}] OAuth error: ${error} - ${errorDescription}`);
            return NextResponse.json(
                {
                    success: false,
                    error: errorDescription || 'Authorization failed',
                    error_code: error,
                    requestId
                },
                { status: 400 }
            );
        }

        // Validate required parameters
        if (!code) {
            console.warn(`[${requestId}] Missing authorization code`);
            return NextResponse.json(
                { success: false, error: 'Missing authorization code', requestId },
                { status: 400 }
            );
        }

        // Optionally validate state parameter if you're using it for CSRF protection
        if (process.env.ROBLOX_USE_STATE_VERIFICATION === 'true' && !state) {
            console.warn(`[${requestId}] Missing state parameter`);
            return NextResponse.json(
                { success: false, error: 'Missing state parameter', requestId },
                { status: 400 }
            );
        }

        const tokenUrl = 'https://apis.roblox.com/oauth/v1/token';

        // Prepare token request
        const params = new URLSearchParams({
            client_id: process.env.ROBLOX_CLIENT_ID!,
            client_secret: process.env.ROBLOX_CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.ROBLOX_REDIRECT_URI!,
        });

        console.log(`[${requestId}] Requesting token from Roblox OAuth endpoint`);
        const tokenRes = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: params.toString(),
        });

        if (!tokenRes.ok) {
            let errorText: string | ErrorResponse = await tokenRes.text();
            try {
                errorText = JSON.parse(errorText) as ErrorResponse;
            } catch (e) {
                // Not JSON, keep as text
            }

            console.error(`[${requestId}] Token request failed with status ${tokenRes.status}:`, errorText);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to exchange authorization code for token',
                    details: typeof errorText === 'string' ? errorText : errorText.error_description,
                    requestId
                },
                { status: tokenRes.status }
            );
        }

        const tokenData: TokenResponse = await tokenRes.json();
        console.log(`[${requestId}] Successfully obtained OAuth tokens`);

        // Set secure HTTP-only cookies with the tokens
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            maxAge: tokenData.expires_in,
        };

        (await cookies()).set('roblox_access_token', tokenData.access_token, cookieOptions);

        if (tokenData.refresh_token) {
            (await cookies()).set('roblox_refresh_token', tokenData.refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
            });
        }

        // Optionally fetch user info here if needed
        // const userInfo = await fetchUserInfo(tokenData.access_token);

        // Return minimal token data (avoid exposing sensitive info)
        return NextResponse.json({
            success: true,
            token_type: tokenData.token_type,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
            requestId
        }, {
            headers: {
                'Set-Cookie': cookies().toString(),
            }
        });

    } catch (err) {
        const error = err as Error;
        console.error(`[${requestId}] Unexpected error:`, error.stack || error.message);

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
                message: error.message,
                requestId
            },
            { status: 500 }
        );
    }
}