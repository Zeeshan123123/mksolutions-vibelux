import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

export async function GET() {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirect_uri = process.env.NODE_ENV === 'production' 
    ? 'https://vibelux-k4nq0jn4b-think-sprout.vercel.app/api/auth/spotify/callback'
    : 'http://localhost:3001/api/auth/spotify/callback';
  
  const scope = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'streaming',
    'user-read-email',
    'user-read-private'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id!,
    scope,
    redirect_uri,
    show_dialog: 'true'
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
}