// src/app/services/spotify-player.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

@Injectable({ providedIn: 'root' })
export class SpotifyPlayerService {
  private player!: any;
  private deviceId: string | null = null;

  isReady$   = new BehaviorSubject<boolean>(false);
  isPlaying$ = new BehaviorSubject<boolean>(false);
  position$  = new BehaviorSubject<number>(0); // ms
  duration$  = new BehaviorSubject<number>(0); // ms

  async init() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No Spotify access token found.');

    // 1) Wait for the SDK to load
    await new Promise<void>(resolve => {
      if (window.Spotify) return resolve();
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
    });

    // 2) Instantiate the player
    this.player = new window.Spotify.Player({
      name: 'Ionic Web Playback SDK',
      getOAuthToken: (cb: (t: string) => void): void => cb(token),
      volume: 0.8
    });

    // 3) Attach error handlers
    this.player.addListener('authentication_error', ({ message }: any) => console.error('Auth Error:', message));
    this.player.addListener('account_error',        ({ message }: any) => console.error('Account Error:', message));
    this.player.addListener('playback_error',       ({ message }: any) => console.error('Playback Error:', message));

    // 4) Track state changes
    this.player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      this.isPlaying$.next(!state.paused);
      this.position$.next(state.position);
      this.duration$.next(state.duration);
    });

    // 5) On ready, capture device_id and transfer playback
    this.player.addListener('ready', async ({ device_id }: any) => {
      console.log('SDK Ready – device ID:', device_id);
      this.deviceId = device_id;
      this.isReady$.next(true);

      // --- NEW: transfer playback to this SDK device ---
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false
          })
        });
        console.log('Playback transferred to Web SDK device');
      } catch (err) {
        console.error('Error transferring playback', err);
      }
    });

    // 6) Connect!
    await this.player.connect();
  }

  /** Play a full track URI via the SDK */
  async playUri(uri: string) {
    if (!this.deviceId) throw new Error('Player not ready');
    const token = localStorage.getItem('access_token');
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uris: [uri] })
      }
    );
  }

  pause()  { this.player.pause(); }
  resume() { this.player.resume(); }
  /** Seek to a position (ms) */
  seek(positionMs: number) { this.player.seek(positionMs); }
}
