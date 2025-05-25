import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject }    from 'rxjs';
import { SpotifyPlayerService } from './spotify-player.service';
import { LibraryItem }        from '../models/library-item';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  currentTrack$ = new BehaviorSubject<LibraryItem | null>(null);
  isPlaying$    = new BehaviorSubject<boolean>(false);
  position$     = new BehaviorSubject<number>(0); // seconds
  duration$     = new BehaviorSubject<number>(0); // seconds

  private audio = new Audio();

  constructor(
    private zone: NgZone,
    private spotifySDK: SpotifyPlayerService
  ) {
    // wire up local audio events
    this.audio.addEventListener('timeupdate', () => 
      this.zone.run(() => this.position$.next(this.audio.currentTime))
    );
    this.audio.addEventListener('loadedmetadata', () =>
      this.zone.run(() => this.duration$.next(this.audio.duration))
    );
    this.audio.addEventListener('ended', () =>
      this.zone.run(() => this.isPlaying$.next(false))
    );

    // wire up Spotify SDK events
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

  async play(item: LibraryItem) {
    this.currentTrack$.next(item);
    // if it’s a Spotify URI...
    if (item.type === 'spotify' && item.uri) {
      await this.spotifySDK.init();
      await this.spotifySDK.playUri(item.uri);
    }
    // otherwise local/preview clip
    else if (item.url) {
      this.audio.src = item.url;
      this.audio.load();
      await this.audio.play();
      this.zone.run(() => this.isPlaying$.next(true));
    }
  }

  pause() {
    if (this.currentTrack$.value?.type === 'spotify') this.spotifySDK.pause();
    else this.audio.pause();
    this.zone.run(() => this.isPlaying$.next(false));
  }

  resume() {
    if (this.currentTrack$.value?.type === 'spotify') this.spotifySDK.resume();
    else this.audio.play();
    this.zone.run(() => this.isPlaying$.next(true));
  }

  toggle() {
    this.isPlaying$.value ? this.pause() : this.resume();
  }

  seek(toSec: number) {
    if (this.currentTrack$.value?.type === 'spotify') this.spotifySDK.seek(toSec * 1000);
    else this.audio.currentTime = toSec;
    this.zone.run(() => this.position$.next(toSec));
  }
}

