import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router }                        from '@angular/router';
import { Subscription }                  from 'rxjs';
import { SpotifyService }                from '../../services/spotify.service';
import { AudioService }                  from '../../services/audio.service';
import { SpotifyPlayerService }          from '../../services/spotify-player.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone:false
})
export class SearchPage implements OnInit, OnDestroy {
  @ViewChild('audioPlayer', { static: false }) audioPlayerRef!: ElementRef<HTMLAudioElement>;

  query = '';
  tracks: any[] = [];
  currentTrack: any = null;
  isPlaying = false;
  sdkReady = false;

  currentTime = 0; // seconds
  duration    = 0; // seconds

  private posSub!: Subscription;
  private durSub!: Subscription;

  constructor(
    private router: Router,
    private spotify: SpotifyService,
    private audioSvc: AudioService,
    private playerSDK: SpotifyPlayerService,
    private zone: NgZone
  ) {}

  async ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigateByUrl('/home');
      return;
    }

    // 1) Initialize the SDK
    await this.playerSDK.init();
    this.playerSDK.isReady$.subscribe(r => this.sdkReady = r);
    this.playerSDK.isPlaying$.subscribe(p => this.isPlaying = p);

    // 2) Subscribe to its position & duration
    this.posSub = this.playerSDK.position$.subscribe(ms =>
      this.zone.run(() => this.currentTime = ms / 1000)
    );
    this.durSub = this.playerSDK.duration$.subscribe(ms =>
      this.zone.run(() => this.duration = ms / 1000)
    );

    // 3) Default search
    this.spotify.searchTracks('a').subscribe(res => this.tracks = res.tracks.items);
  }

  ngOnDestroy() {
    this.posSub.unsubscribe();
    this.durSub.unsubscribe();
    this.audioSvc.stop();
  }

  onSearch() {
    const q = this.query.trim() || 'a';
    this.spotify.searchTracks(q).subscribe(res => this.tracks = res.tracks.items);
  }

  async playTrack(track: any) {
    this.currentTrack = track;
    this.zone.run(() => {
      this.currentTime = 0;
      this.duration    = 0;
    });

    if (this.sdkReady) {
      // Full track via SDK
      await this.playerSDK.playUri(track.uri);
    } else if (track.preview_url) {
      // 30 s preview fallback
      const audio: HTMLAudioElement = this.audioPlayerRef.nativeElement;
      audio.src = track.preview_url;
      audio.load();

      audio.onloadedmetadata = () =>
        this.zone.run(() => this.duration = audio.duration);

      audio.ontimeupdate = () =>
        this.zone.run(() => this.currentTime = audio.currentTime);

      audio.play().then(() =>
        this.zone.run(() => this.isPlaying = true)
      );
    } else {
      alert('No preview available and SDK not ready.');
    }
  }

  toggle() {
    if (this.sdkReady) {
      this.isPlaying ? this.playerSDK.pause() : this.playerSDK.resume();
    } else {
      this.audioSvc.toggle();
      this.zone.run(() => this.isPlaying = !this.isPlaying);
    }
  }

  onSeek(event: any) {
    const t = event.detail.value as number;
    if (this.sdkReady) {
      this.playerSDK.seek(t * 1000);
    } else {
      this.audioPlayerRef.nativeElement.currentTime = t;
    }
    this.zone.run(() => this.currentTime = t);
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
