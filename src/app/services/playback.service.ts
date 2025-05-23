// src/app/services/playback.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SpotifyPlayerService }        from './spotify-player.service';

export interface LibraryItem {
  id: string;
  type: 'local' | 'spotify';
  name: string;
  url?: string;       // for local/preview_url
  uri?: string;       // for spotify full track
  thumbnail?: string;
  artists?: string[];
}

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  private audio = new Audio();

  // current item, play state, position (ms), and duration (ms)
  private trackSub    = new BehaviorSubject<LibraryItem|null>(null);
  private playingSub  = new BehaviorSubject<boolean>(false);
  private posSub      = new BehaviorSubject<number>(0);
  private durSub      = new BehaviorSubject<number>(0);

  currentTrack$ : Observable<LibraryItem|null> = this.trackSub.asObservable();
  isPlaying$    : Observable<boolean>       = this.playingSub.asObservable();
  position$     : Observable<number>        = this.posSub.asObservable();
  duration$     : Observable<number>        = this.durSub.asObservable();

  constructor(private sdk: SpotifyPlayerService) {
    // wire up <audio> events
    this.audio.ontimeupdate = () => {
      this.posSub.next(this.audio.currentTime * 1000);
    };
    this.audio.onloadedmetadata = () => {
      this.durSub.next(this.audio.duration * 1000);
    };
    this.audio.onended = () => {
      this.stop();
    };

    // listen to SDK status (full tracks)
    this.sdk.isPlaying$.subscribe(p => this.playingSub.next(p));
    this.sdk.position$.subscribe(ms => this.posSub.next(ms));
    this.sdk.duration$.subscribe(ms => this.durSub.next(ms));
  }

  /** Play a LibraryItem (either local/preview or full Spotify URI) */
  async play(item: LibraryItem) {
    this.trackSub.next(item);
    if (item.type === 'spotify' && item.uri) {
      // full track via SDK
      await this.sdk.playUri(item.uri);
    } else if (item.url) {
      // preview clip or local file via <audio>
      this.sdk.pause();            // pause SDK if it was playing
      this.audio.src = item.url;
      this.audio.load();
      this.audio.play()
        .then(() => this.playingSub.next(true))
        .catch(() => this.playingSub.next(false));
    }
  }

  /** Toggle current playback */
  toggle() {
    const item = this.trackSub.value;
    if (!item) return;
    if (item.type === 'spotify') {
      this.sdk.isPlaying$
        ? this.sdk.pause()
        : this.sdk.resume();
    } else {
      if (this.audio.paused) {
        this.audio.play().then(() => this.playingSub.next(true));
      } else {
        this.audio.pause();
        this.playingSub.next(false);
      }
    }
  }

  /** Seek (ms) */
  seek(ms: number) {
    const item = this.trackSub.value;
    if (!item) return;
    if (item.type === 'spotify') {
      this.sdk.seek(ms);
    } else {
      this.audio.currentTime = ms / 1000;
    }
    this.posSub.next(ms);
  }

  /** Stop playback entirely */
  stop() {
    this.audio.pause();
    this.sdk.pause();
    this.trackSub.next(null);
    this.playingSub.next(false);
    this.posSub.next(0);
    this.durSub.next(0);
  }
}
