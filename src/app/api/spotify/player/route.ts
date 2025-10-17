import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic'

// GET current playback state
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      return NextResponse.json({ playing: false });
    }

    if (!response.ok) {
      throw new Error('Failed to get playback state');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get playback state' }, { status: 500 });
  }
}

// PUT play/pause
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { action, device_id, uris, context_uri } = await request.json();

  try {
    let endpoint = 'https://api.spotify.com/v1/me/player/';
    let method = 'PUT';
    let body: string | undefined = undefined;

    switch (action) {
      case 'play':
        endpoint += 'play';
        if (device_id) endpoint += `?device_id=${device_id}`;
        if (uris || context_uri) {
          body = JSON.stringify({
            ...(uris && { uris }),
            ...(context_uri && { context_uri })
          });
        }
        break;
      case 'pause':
        endpoint += 'pause';
        break;
      case 'next':
        endpoint += 'next';
        method = 'POST';
        break;
      case 'previous':
        endpoint += 'previous';
        method = 'POST';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      ...(body && { body })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to control playback' }, { status: 500 });
  }
}

// POST to refresh token
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    // Update access token
    (await cookies()).set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}