/**
 * VibeLux Spotify Integration Extension
 * Background music and ambiance for greenhouse design sessions
 */

interface SpotifyState {
  isConnected: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  playlists: SpotifyPlaylist[];
  device: SpotifyDevice | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  progress_ms: number;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

class SpotifyExtension extends Autodesk.Viewing.Extension {
  private panel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private miniPlayer: HTMLElement | null = null;
  private state: SpotifyState = {
    isConnected: false,
    isPlaying: false,
    currentTrack: null,
    playlists: [],
    device: null
  };
  private updateInterval: number | null = null;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any) {
    super(viewer, options);
  }

  load() {
    console.log('VibeLux Spotify Extension loaded');
    this.checkSpotifyConnection();
    this.createMiniPlayer();
    return true;
  }

  unload() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.miniPlayer) {
      this.miniPlayer.remove();
    }
    if (this.panel) {
      this.panel.setVisible(false);
      this.panel.uninitialize();
    }
    console.log('VibeLux Spotify Extension unloaded');
    return true;
  }

  private async checkSpotifyConnection() {
    // Check if we have Spotify cookies
    const cookies = document.cookie.split(';');
    const hasSpotifyUser = cookies.some(c => c.trim().startsWith('spotify_user='));
    
    if (hasSpotifyUser) {
      this.state.isConnected = true;
      await this.updatePlaybackState();
      this.startPolling();
    }
  }

  private createMiniPlayer() {
    this.miniPlayer = document.createElement('div');
    this.miniPlayer.className = 'vibelux-spotify-mini';
    this.miniPlayer.innerHTML = `
      <div class="spotify-mini-content">
        <div class="spotify-now-playing">
          <img class="spotify-album-art" src="" alt="" style="display: none;">
          <div class="spotify-track-info">
            <div class="spotify-track-name">Not Playing</div>
            <div class="spotify-track-artist"></div>
          </div>
        </div>
        <div class="spotify-controls">
          <button class="spotify-btn spotify-prev" title="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="spotify-btn spotify-play-pause" title="Play/Pause">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="spotify-btn spotify-next" title="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="spotify-btn spotify-expand" title="Open Spotify Panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="spotify-progress">
        <div class="spotify-progress-bar"></div>
      </div>
    `;

    // Position in bottom left corner
    this.miniPlayer.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 20px;
      background: var(--vb-surface);
      border: 1px solid var(--vb-border);
      border-radius: 8px;
      padding: 12px;
      min-width: 300px;
      box-shadow: var(--vb-shadow-lg);
      z-index: 100;
    `;

    document.body.appendChild(this.miniPlayer);
    this.setupMiniPlayerEvents();
    this.addStyles();

    if (!this.state.isConnected) {
      this.showConnectPrompt();
    }
  }

  private showConnectPrompt() {
    const trackInfo = this.miniPlayer!.querySelector('.spotify-track-info')!;
    trackInfo.innerHTML = `
      <div class="spotify-track-name">Connect Spotify</div>
      <div class="spotify-track-artist">
        <a href="/api/auth/spotify/login" class="spotify-connect-link">Click to connect</a>
      </div>
    `;
  }

  private setupMiniPlayerEvents() {
    const prevBtn = this.miniPlayer!.querySelector('.spotify-prev');
    const playPauseBtn = this.miniPlayer!.querySelector('.spotify-play-pause');
    const nextBtn = this.miniPlayer!.querySelector('.spotify-next');
    const expandBtn = this.miniPlayer!.querySelector('.spotify-expand');

    prevBtn?.addEventListener('click', () => this.controlPlayback('previous'));
    playPauseBtn?.addEventListener('click', () => this.togglePlayback());
    nextBtn?.addEventListener('click', () => this.controlPlayback('next'));
    expandBtn?.addEventListener('click', () => this.togglePanel());
  }

  private async updatePlaybackState() {
    try {
      const response = await fetch('/api/spotify/player');
      
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to get playback state');
      }

      const data = await response.json();

      if (data.playing === false) {
        this.state.isPlaying = false;
        this.updateMiniPlayer();
        return;
      }

      this.state.isPlaying = data.is_playing;
      this.state.currentTrack = data.item;
      this.state.device = data.device;

      this.updateMiniPlayer();
      this.updateProgress(data.progress_ms, data.item?.duration_ms);
    } catch (error) {
      console.error('Failed to update playback state:', error);
    }
  }

  private updateMiniPlayer() {
    if (!this.miniPlayer) return;

    const albumArt = this.miniPlayer.querySelector('.spotify-album-art') as HTMLImageElement;
    const trackName = this.miniPlayer.querySelector('.spotify-track-name')!;
    const trackArtist = this.miniPlayer.querySelector('.spotify-track-artist')!;
    const playPauseBtn = this.miniPlayer.querySelector('.spotify-play-pause')!;

    if (this.state.currentTrack) {
      const smallImage = this.state.currentTrack.album.images[2] || this.state.currentTrack.album.images[0];
      if (smallImage) {
        albumArt.src = smallImage.url;
        albumArt.style.display = 'block';
      }
      trackName.textContent = this.state.currentTrack.name;
      trackArtist.textContent = this.state.currentTrack.artists.map(a => a.name).join(', ');
    } else {
      albumArt.style.display = 'none';
      trackName.textContent = 'Not Playing';
      trackArtist.textContent = '';
    }

    // Update play/pause icon
    playPauseBtn.innerHTML = this.state.isPlaying ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    ` : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  }

  private updateProgress(progress: number, duration: number) {
    if (!this.miniPlayer || !duration) return;

    const progressBar = this.miniPlayer.querySelector('.spotify-progress-bar') as HTMLElement;
    const percentage = (progress / duration) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  private async togglePlayback() {
    const action = this.state.isPlaying ? 'pause' : 'play';
    await this.controlPlayback(action);
  }

  private async controlPlayback(action: string) {
    try {
      const response = await fetch('/api/spotify/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to control playback');
      }

      // Update state immediately for responsiveness
      if (action === 'play') {
        this.state.isPlaying = true;
      } else if (action === 'pause') {
        this.state.isPlaying = false;
      }

      this.updateMiniPlayer();

      // Fetch actual state after a short delay
      setTimeout(() => this.updatePlaybackState(), 500);
    } catch (error) {
      console.error('Failed to control playback:', error);
    }
  }

  private async refreshToken() {
    try {
      const response = await fetch('/api/spotify/player', {
        method: 'POST'
      });

      if (response.ok) {
        // Retry the original request
        await this.updatePlaybackState();
      } else {
        // Re-authenticate
        this.state.isConnected = false;
        this.showConnectPrompt();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  private startPolling() {
    // Update every 5 seconds
    this.updateInterval = window.setInterval(() => {
      this.updatePlaybackState();
    }, 5000);
  }

  private togglePanel() {
    if (!this.panel) {
      this.createPanel();
    }
    
    this.panel!.setVisible(!this.panel!.isVisible());
    
    if (this.panel!.isVisible()) {
      this.loadPlaylists();
    }
  }

  private createPanel() {
    const panelDiv = document.createElement('div');
    panelDiv.innerHTML = `
      <div class="spotify-panel">
        <div class="panel-header">
          <h3>Spotify Music</h3>
          <p>Set the mood for your greenhouse design</p>
        </div>

        <div class="current-playing">
          <img class="album-art-large" src="" alt="">
          <div class="track-details">
            <h4 class="track-title">Not Playing</h4>
            <p class="track-artist"></p>
            <p class="track-album"></p>
          </div>
        </div>

        <div class="playback-controls">
          <button class="spotify-btn-large" id="shuffle-btn" title="Shuffle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>
          <button class="spotify-btn-large" id="prev-btn" title="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="spotify-btn-large spotify-primary" id="play-pause-btn" title="Play/Pause">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="spotify-btn-large" id="next-btn" title="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="spotify-btn-large" id="repeat-btn" title="Repeat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        <div class="volume-control">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input type="range" id="volume-slider" min="0" max="100" value="50">
          <span id="volume-value">50%</span>
        </div>

        <div class="playlists-section">
          <h4>Mood Playlists</h4>
          <div class="playlist-grid" id="playlist-grid">
            <!-- Playlists will be loaded here -->
          </div>
        </div>

        <div class="search-section">
          <input type="text" id="spotify-search" placeholder="Search for songs, artists, or playlists...">
          <div id="search-results"></div>
        </div>
      </div>
    `;

    this.panel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'spotify-panel',
      'Spotify Music',
      { addFooter: false }
    );

    this.panel.container.style.width = '400px';
    this.panel.container.style.height = '600px';
    this.panel.container.style.right = '420px';
    this.panel.container.style.top = '50px';

    this.panel.container.appendChild(panelDiv);
    this.setupPanelEvents();
  }

  private setupPanelEvents() {
    // Playback controls
    this.panel!.container.querySelector('#prev-btn')?.addEventListener('click', () => this.controlPlayback('previous'));
    this.panel!.container.querySelector('#play-pause-btn')?.addEventListener('click', () => this.togglePlayback());
    this.panel!.container.querySelector('#next-btn')?.addEventListener('click', () => this.controlPlayback('next'));

    // Volume control
    const volumeSlider = this.panel!.container.querySelector('#volume-slider') as HTMLInputElement;
    volumeSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      this.panel!.container.querySelector('#volume-value')!.textContent = value + '%';
      // Note: Web API doesn't support volume control, would need Spotify SDK
    });

    // Search
    const searchInput = this.panel!.container.querySelector('#spotify-search') as HTMLInputElement;
    let searchTimeout: number;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        this.search((e.target as HTMLInputElement).value);
      }, 300);
    });
  }

  private async loadPlaylists() {
    // Load some curated playlists for greenhouse design
    const curatedPlaylists = [
      { id: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', mood: 'Focus' },
      { id: 'spotify:playlist:37i9dQZF1DX3Ogo9pFvBkY', name: 'Lofi Beats', mood: 'Relaxed' },
      { id: 'spotify:playlist:37i9dQZF1DX6ziVCJnEm59', name: 'Deep Focus', mood: 'Productive' },
      { id: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ', name: 'Nature Sounds', mood: 'Ambient' }
    ];

    const playlistGrid = this.panel!.container.querySelector('#playlist-grid')!;
    playlistGrid.innerHTML = curatedPlaylists.map(playlist => `
      <div class="playlist-card" data-uri="${playlist.id}">
        <div class="playlist-mood">${playlist.mood}</div>
        <div class="playlist-name">${playlist.name}</div>
      </div>
    `).join('');

    // Add click handlers
    playlistGrid.querySelectorAll('.playlist-card').forEach(card => {
      card.addEventListener('click', () => {
        const uri = card.getAttribute('data-uri');
        if (uri) this.playContext(uri);
      });
    });
  }

  private async playContext(contextUri: string) {
    try {
      await fetch('/api/spotify/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'play',
          context_uri: contextUri
        })
      });

      setTimeout(() => this.updatePlaybackState(), 1000);
    } catch (error) {
      console.error('Failed to play context:', error);
    }
  }

  private async search(query: string) {
    if (!query) return;

    // Would implement Spotify search API
    console.log('Searching for:', query);
  }

  private addStyles() {
    const styles = `
      .vibelux-spotify-mini {
        font-family: var(--vb-font-family);
        color: var(--vb-text-primary);
      }

      .spotify-mini-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .spotify-now-playing {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

      .spotify-album-art {
        width: 48px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
      }

      .spotify-track-info {
        flex: 1;
        min-width: 0;
      }

      .spotify-track-name {
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .spotify-track-artist {
        font-size: 11px;
        color: var(--vb-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .spotify-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .spotify-btn {
        background: transparent;
        border: none;
        color: var(--vb-text-primary);
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spotify-btn:hover {
        background: var(--vb-surface-hover);
        color: #1db954;
      }

      .spotify-progress {
        height: 3px;
        background: var(--vb-border);
        border-radius: 1.5px;
        margin-top: 8px;
        overflow: hidden;
      }

      .spotify-progress-bar {
        height: 100%;
        background: #1db954;
        border-radius: 1.5px;
        transition: width 0.1s;
      }

      .spotify-connect-link {
        color: #1db954;
        text-decoration: none;
      }

      .spotify-connect-link:hover {
        text-decoration: underline;
      }

      /* Panel Styles */
      .spotify-panel {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .current-playing {
        display: flex;
        gap: 16px;
        margin: 20px 0;
        padding: 16px;
        background: var(--vb-surface-light);
        border-radius: 8px;
      }

      .album-art-large {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        object-fit: cover;
      }

      .track-details {
        flex: 1;
      }

      .track-title {
        margin: 0 0 4px 0;
        font-size: 16px;
      }

      .track-artist, .track-album {
        margin: 2px 0;
        font-size: 13px;
        color: var(--vb-text-secondary);
      }

      .playback-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin: 20px 0;
      }

      .spotify-btn-large {
        background: transparent;
        border: none;
        color: var(--vb-text-primary);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s;
      }

      .spotify-btn-large:hover {
        background: var(--vb-surface-hover);
      }

      .spotify-btn-large.spotify-primary {
        background: #1db954;
        color: white;
        padding: 12px;
      }

      .spotify-btn-large.spotify-primary:hover {
        background: #1ed760;
        transform: scale(1.05);
      }

      .volume-control {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px 0;
        padding: 12px;
        background: var(--vb-surface-light);
        border-radius: 6px;
      }

      #volume-slider {
        flex: 1;
      }

      .playlists-section {
        flex: 1;
        overflow-y: auto;
      }

      .playlist-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 12px;
      }

      .playlist-card {
        background: var(--vb-surface-light);
        border: 1px solid var(--vb-border);
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .playlist-card:hover {
        background: var(--vb-surface-hover);
        border-color: #1db954;
        transform: translateY(-2px);
      }

      .playlist-mood {
        font-size: 11px;
        color: #1db954;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .playlist-name {
        font-size: 14px;
        font-weight: 500;
      }

      .search-section {
        margin-top: 20px;
      }

      #spotify-search {
        width: 100%;
        padding: 10px;
        background: var(--vb-surface-light);
        border: 1px solid var(--vb-border);
        border-radius: 20px;
        color: var(--vb-text-primary);
        font-size: 13px;
      }

      #spotify-search:focus {
        outline: none;
        border-color: #1db954;
      }

      #search-results {
        margin-top: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// Register the extension
Autodesk.Viewing.theExtensionManager.registerExtension('VibeLux.Spotify', SpotifyExtension);

export default SpotifyExtension;