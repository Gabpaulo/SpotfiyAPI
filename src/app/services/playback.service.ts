// src/app/services/playback.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject }    from 'rxjs';
import { SpotifyPlayerService } from './spotify-player.service';
import { LibraryItem }        from '../models/library-item';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  currentTrack$ = new BehaviorSubject<LibraryItem | null>(null);
  isPlaying$    = new BehaviorSubject<boolean>(false);
  position$     = new BehaviorSubject<number>(0);
  duration$     = new BehaviorSubject<number>(0);

  private audio = new Audio();
  private queue: LibraryItem[] = [];
  private index = -1;

  constructor(
    private zone: NgZone,
    private spotifySDK: SpotifyPlayerService
  ) {
    // ── Initialize & transfer playback to the Web SDK device once ──
    this.spotifySDK.init().catch(err =>
      console.error('Failed to init Spotify SDK:', err)
    );

    // ── Local HTML5 audio events (for fallback or local files) ──
    this.audio.addEventListener('timeupdate', () =>
      this.zone.run(() => this.position$.next(this.audio.currentTime))
    );
    this.audio.addEventListener('loadedmetadata', () =>
      this.zone.run(() => this.duration$.next(this.audio.duration))
    );
    this.audio.addEventListener('ended', () => {
      this.zone.run(() => this.isPlaying$.next(false));
      this.next();
    });

    // ── Spotify SDK events ──
    this.spotifySDK.position$.subscribe(ms =>
      this.zone.run(() => this.position$.next(ms / 1000))
    );
    this.spotifySDK.duration$.subscribe(ms =>
      this.zone.run(() => this.duration$.next(ms / 1000))
    );
    this.spotifySDK.isPlaying$.subscribe(p =>
      this.zone.run(() => this.isPlaying$.next(p))
    );
  }

  /** Replace the queue and start playback at startIndex */
  setQueue(items: LibraryItem[], startIndex = 0) {
    this.queue = items;
    this.index = Math.max(0, Math.min(startIndex, items.length - 1));
    this.play(this.queue[this.index]);
  }

  /** Play the given item on the already‐transferred SDK device */
  async play(item: LibraryItem) {
    const idx = this.queue.findIndex(x => x.id === item.id);
    this.index = idx >= 0 ? idx : 0;
    this.currentTrack$.next(item);

    if (item.type === 'spotify' && item.uri) {
      // ← No more init() here, just play on the same device
      await this.spotifySDK.playUri(item.uri);
      this.zone.run(() => this.isPlaying$.next(true));
    } else if (item.url) {
      // fallback for preview/local URLs (if you still need it)
      this.audio.src = item.url;
      this.audio.load();
      await this.audio.play();
      this.zone.run(() => this.isPlaying$.next(true));
    }
  }

  pause() {
    if (this.currentTrack$.value?.type === 'spotify') {
      this.spotifySDK.pause();
    } else {
      this.audio.pause();
    }
    this.zone.run(() => this.isPlaying$.next(false));
  }

  resume() {
    if (this.currentTrack$.value?.type === 'spotify') {
      this.spotifySDK.resume();
    } else {
      this.audio.play();
    }
    this.zone.run(() => this.isPlaying$.next(true));
  }

  toggle() {
    this.isPlaying$.value ? this.pause() : this.resume();
  }

  seek(sec: number) {
    if (this.currentTrack$.value?.type === 'spotify') {
      this.spotifySDK.seek(sec * 1000);
    } else {
      this.audio.currentTime = sec;
    }
    this.zone.run(() => this.position$.next(sec));
  }

  next() {
    const len = this.queue.length;
    if (len > 1) {
      let rand = Math.floor(Math.random() * len);
      while (rand === this.index) {
        rand = Math.floor(Math.random() * len);
      }
      this.index = rand;
      this.play(this.queue[this.index]);
    }
  }

  previous() {
    if (this.index > 0) {
      this.index--;
      this.play(this.queue[this.index]);
    }
  }
}
