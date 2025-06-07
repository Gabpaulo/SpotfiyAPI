import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpotifyPlayerService } from './spotify-player.service';
import { LibraryItem } from '../models/library-item';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  currentTrack$ = new BehaviorSubject<LibraryItem | null>(null);
  isPlaying$    = new BehaviorSubject<boolean>(false);
  position$     = new BehaviorSubject<number>(0);
  duration$     = new BehaviorSubject<number>(0);

  private queue: LibraryItem[] = [];
  private index = -1;

  constructor(
    private zone: NgZone,
    private spotifySDK: SpotifyPlayerService
  ) {
    // Initialize Spotify Web Playback SDK
    this.spotifySDK.init().catch(err =>
      console.error('Failed to init Spotify SDK:', err)
    );

    // Subscribe to Spotify playback state
    this.spotifySDK.position$.subscribe(ms =>
      this.zone.run(() => this.position$.next(ms / 1000))
    );
    this.spotifySDK.duration$.subscribe(ms =>
      this.zone.run(() => this.duration$.next(ms / 1000))
    );
    this.spotifySDK.isPlaying$.subscribe(playing =>
      this.zone.run(() => this.isPlaying$.next(playing))
    );
  }

  /** Replace the queue and start playback at startIndex */
  setQueue(items: LibraryItem[], startIndex = 0) {
    this.queue = items;
    this.index = Math.max(0, Math.min(startIndex, items.length - 1));
    this.play(this.queue[this.index]);
  }

  /** Play the given Spotify item */
  async play(item: LibraryItem) {
    const idx = this.queue.findIndex(x => x.id === item.id);
    this.index = idx >= 0 ? idx : 0;
    this.currentTrack$.next(item);

    if (item.type === 'spotify' && item.uri) {
      await this.spotifySDK.playUri(item.uri);
      this.zone.run(() => this.isPlaying$.next(true));
    } else {
      console.warn('Unsupported item type for playback:', item);
    }
  }

  pause() {
    this.spotifySDK.pause();
    this.zone.run(() => this.isPlaying$.next(false));
  }

  resume() {
    this.spotifySDK.resume();
    this.zone.run(() => this.isPlaying$.next(true));
  }

  toggle() {
    this.isPlaying$.value ? this.pause() : this.resume();
  }

  seek(sec: number) {
    this.spotifySDK.seek(sec * 1000);
    this.zone.run(() => this.position$.next(sec));
  }

  /** Play a random next track in the queue */
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

  /** Play the previous track in the queue */
  previous() {
    if (this.index > 0) {
      this.index--;
      this.play(this.queue[this.index]);
    }
  }
}
