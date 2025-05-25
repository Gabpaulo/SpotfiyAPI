// src/app/pages/folder-detail/folder-detail.page.ts

import { Component, OnInit }          from '@angular/core';
import { ActivatedRoute }              from '@angular/router';
import { FolderService }               from '../../services/folder.service';
import { LibraryService }              from '../../services/library.service';
import { PlaybackService }             from '../../services/playback.service';
import { SpotifyService }              from '../../services/spotify.service';
import { Folder }                      from '../../models/folder';
import { LibraryItem }                 from '../../models/library-item';

@Component({
  selector: 'app-folder-detail',
  templateUrl: './folder-detail.page.html',
  styleUrls: ['./folder-detail.page.scss'],
  standalone:false
})
export class FolderDetailPage implements OnInit {
  folder!: Folder;
  items: LibraryItem[] = [];
  searchQuery = '';
  searchResults: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private folderSvc: FolderService,
    private libSvc: LibraryService,
    private playback: PlaybackService,
    private spotify: SpotifyService
  ) {}

  async ngOnInit() {
    const folderId = this.route.snapshot.paramMap.get('id')!;
    const allFolders = await this.folderSvc.getAll();
    this.folder = allFolders.find(f => f.id === folderId)!;
    await this.loadItems();
  }

  private async loadItems() {
    const all = await this.libSvc.getAll();
    this.items = all.filter(i => this.folder.itemIds.includes(i.id));
  }

  /** Handle user picking local files and add them to this folder */
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach(file => {
      const item: LibraryItem = {
        id:        file.name + file.size,
        type:      'local',
        name:      file.name,
        url:       URL.createObjectURL(file)
      };
      this.libSvc.add(item)
        .then(() => this.folderSvc.addItem(this.folder.id, item.id))
        .then(() => this.loadItems());
    });

    // Clear to allow re-selecting same file later
    input.value = '';
  }

  /** Search Spotify for adding tracks */
  async searchMusic() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.searchResults = [];
      return;
    }
    const res: any = await this.spotify.searchTracks(q).toPromise();
    this.searchResults = res.tracks.items;
  }

  /** Add selected Spotify track into this folder */
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

  /** Play any LibraryItem (local or Spotify) */
  play(item: LibraryItem) {
    this.playback.play(item);
  }

  /** Remove item from this folder */
  async remove(item: LibraryItem) {
    await this.folderSvc.removeItem(this.folder.id, item.id);
    await this.loadItems();
  }

  /** Helper to format seconds as M:SS */
  formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2,'0');
    return `${m}:${s}`;
  }
}
