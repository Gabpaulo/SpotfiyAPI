import { Component, OnInit }        from '@angular/core';
import { Router }                   from '@angular/router';
import { SpotifyService }           from '../../services/spotify.service';
import { PlaybackService }          from '../../services/playback.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone:false
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
    this.playback.play({
      id:        track.id,
      type:      'spotify',
      uri:       track.uri,
      name:      track.name,
      artists:   track.artists.map((a: any) => a.name),
      thumbnail: track.album.images[0]?.url
    });
  }
}
