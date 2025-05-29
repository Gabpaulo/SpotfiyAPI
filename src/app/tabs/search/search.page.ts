
import { Component, OnInit }        from '@angular/core';
import { Router }                   from '@angular/router';
import { SpotifyService }           from '../../services/spotify.service';
import { PlaybackService }          from '../../services/playback.service';
import { LibraryItem }              from '../../models/library-item';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false
})
export class SearchPage implements OnInit {
  query = '';
  tracks: any[] = [];

  constructor(
    private router: Router,
    private spotify: SpotifyService,
    private playback: PlaybackService
  ) {}

  ngOnInit() {
    if (!localStorage.getItem('access_token')) {
      this.router.navigateByUrl('/home');
      return;
    }
    this.onSearch();
  }

  onSearch() {
    const q = this.query.trim() || 'a';
    this.spotify.searchTracks(q)
      .subscribe(res => this.tracks = res.tracks.items);
  }

  playTrack(track: any) {
    const queue: LibraryItem[] = this.tracks.map(t => ({
      id:        t.id,
      type:      t.preview_url ? 'preview' : 'spotify',
      url:       t.preview_url,
      uri:       t.uri,
      name:      t.name,
      artists:   t.artists.map((a: any) => a.name),
      thumbnail: t.album.images[0]?.url
    }));

    const startIndex = queue.findIndex(item => item.id === track.id);
    this.playback.setQueue(queue, startIndex);
  }
}