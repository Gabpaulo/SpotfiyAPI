// src/app/pages/folder-detail/folder-detail.page.ts

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription }   from 'rxjs';

import { FolderService }        from '../../services/folder.service';
import { LibraryService }       from '../../services/library.service';
import { SpotifyService }       from '../../services/spotify.service';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { AudioService }         from '../../services/audio.service';

import { Folder }      from '../../models/folder';
import { LibraryItem } from '../../models/library-item';

@Component({
  selector: 'app-folder-detail',
  templateUrl: './folder-detail.page.html',
  styleUrls: ['./folder-detail.page.scss'],
  standalone:false
})
export class FolderDetailPage implements OnInit, OnDestroy {
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('audioPlayer', { static: false })
  audioPlayerRef!: ElementRef<HTMLAudioElement>;

  folder!: Folder;
  items: LibraryItem[] = [];

  searchQuery = '';
  searchResults: any[] = [];

  currentTrack: LibraryItem | null = null;
  isPlaying = false;
  sdkReady = false;
  currentTime = 0;
  duration    = 0;

  private posSub!: Subscription;
  private durSub!: Subscription;
  private playSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private folderSvc: FolderService,
    private libSvc: LibraryService,
    private spotify: SpotifyService,
    private playerSDK: SpotifyPlayerService,
    private audio: AudioService,
    private zone: NgZone
  ) {}

  async ngOnInit() {
    const folderId = this.route.snapshot.paramMap.get('id')!;
    const allFolders = await this.folderSvc.getAll();
    this.folder = allFolders.find(f => f.id === folderId)!;
    await this.loadItems();

    await this.playerSDK.init();
    this.playerSDK.isReady$.subscribe(r => this.sdkReady = r);
    this.playSub = this.playerSDK.isPlaying$.subscribe(p =>
      this.zone.run(() => (this.isPlaying = p))
    );
    this.posSub = this.playerSDK.position$.subscribe(ms =>
      this.zone.run(() => (this.currentTime = ms / 1000))
    );
    this.durSub = this.playerSDK.duration$.subscribe(ms =>
      this.zone.run(() => (this.duration = ms / 1000))
    );
  }

  ngOnDestroy() {
    this.posSub.unsubscribe();
    this.durSub.unsubscribe();
    this.playSub.unsubscribe();
    this.audio.stop();
  }

  private async loadItems() {
    const all = await this.libSvc.getAll();
    this.items = all.filter(i => this.folder.itemIds.includes(i.id));
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => {
      const item: LibraryItem = {
        id:      file.name + file.size,
        type:    'local',
        name:    file.name,
        url:     URL.createObjectURL(file)
      };
      this.libSvc.add(item)
        .then(() => this.folderSvc.addItem(this.folder.id, item.id))
        .then(() => this.loadItems());
    });
    this.fileInput.nativeElement.value = '';
  }

  async searchMusic() {
    const q = this.searchQuery.trim();
    if (!q) { this.searchResults = []; return; }
    const res: any = await this.spotify.searchTracks(q).toPromise();
    this.searchResults = res.tracks.items;
  }

  async addTrack(track: any) {
    const item: LibraryItem = {
      id:        track.id,
      type:      'spotify',
      name:      track.name,
      artists:   track.artists.map((a: any) => a.name),
      uri:       track.uri,
      thumbnail: track.album.images[0]?.url
    };
    await this.libSvc.add(item);
    await this.folderSvc.addItem(this.folder.id, item.id);
    await this.loadItems();
  }

  play(item: LibraryItem) {
    this.currentTrack = item;
    this.zone.run(() => {
      this.currentTime = 0;
      this.duration    = 0;
    });
    if (this.sdkReady && item.type === 'spotify') {
      this.playerSDK.playUri(item.uri!);
    } else if (item.url) {
      const audio = this.audioPlayerRef.nativeElement;
      audio.src = item.url;
      audio.load();
      audio.onloadedmetadata = () =>
        this.zone.run(() => (this.duration = audio.duration));
      audio.ontimeupdate = () =>
        this.zone.run(() => (this.currentTime = audio.currentTime));
      audio.play().then(() =>
        this.zone.run(() => (this.isPlaying = true))
      );
    }
  }

  togglePlayback() {
    if (this.sdkReady && this.currentTrack?.type === 'spotify') {
      this.isPlaying ? this.playerSDK.pause() : this.playerSDK.resume();
    } else {
      const audio = this.audioPlayerRef.nativeElement;
      if (audio.paused) {
        audio.play().then(() => this.zone.run(() => (this.isPlaying = true)));
      } else {
        audio.pause();
        this.zone.run(() => (this.isPlaying = false));
      }
    }
  }

  onSeek(event: any) {
    const t = event.detail.value as number;
    if (this.sdkReady && this.currentTrack?.type === 'spotify') {
      this.playerSDK.seek(t * 1000);
    } else {
      this.audioPlayerRef.nativeElement.currentTime = t;
    }
    this.zone.run(() => (this.currentTime = t));
  }

  onEnded() {
    this.zone.run(() => (this.isPlaying = false));
  }

  // ← Newly added remove()
  async remove(item: LibraryItem) {
    await this.folderSvc.removeItem(this.folder.id, item.id);
    await this.loadItems();
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
