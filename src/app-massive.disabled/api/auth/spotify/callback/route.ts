import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect('/greenhouse-designer?spotify_error=' + error);
  }

  if (!code) {
    return NextResponse.redirect('/greenhouse-designer?spotify_error=no_code');
  }

  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.NODE_ENV === 'production'
    ? 'https://vibelux.vercel.app/api/auth/spotify/callback'
    : 'http://localhost:3000/api/auth/spotify/callback';

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Spotify token error:', error);
      return NextResponse.redirect('/greenhouse-designer?spotify_error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in secure HTTP-only cookies
    const cookieStore = await cookies();
    
    cookieStore.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in // typically 3600 seconds (1 hour)
    });

    if (tokens.refresh_token) {
      cookieStore.set('spotify_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    // Get user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      cookieStore.set('spotify_user', JSON.stringify({
        id: profile.id,
        name: profile.display_name,
        email: profile.email,
        image: profile.images?.[0]?.url
      }), {
        httpOnly: false, // Allow client to read user info
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return NextResponse.redirect('/greenhouse-designer?spotify=connected');
  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect('/greenhouse-designer?spotify_error=callback_failed');
  }
}