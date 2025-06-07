import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
  private API = 'https://api.spotify.com/v1';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No Spotify access token found.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

 
  searchTracks(query: string): Observable<any> {
    return this.http.get(`${this.API}/search`, {
      headers: this.headers,
      params: new HttpParams().set('q', query).set('type', 'track').set('limit', '20')
    });
  }

  /** Start playback on active device */
  play(uri: string): Observable<any> {
    return this.http.put(
      `${this.API}/me/player/play`,
      { uris: [uri] },
      { headers: this.headers }
    );
  }

  /** Fetch a “random” set of tracks via Recommendations */
  getRandomTracks(limit = 20): Observable<any> {
    // pick two random seed genres
    const genres = ['pop','rock','hip-hop','jazz','classical','electronic','country'];
    const seed: string[] = [];
    while (seed.length < 2) {
      const g = genres[Math.floor(Math.random() * genres.length)];
      if (!seed.includes(g)) {
        seed.push(g);
      }
    }

    const params = new HttpParams()
      .set('seed_genres', seed.join(','))
      .set('limit', limit.toString());

    return this.http.get(`${this.API}/recommendations`, {
      headers: this.headers,
      params
    });
  }

 
getTrack(id: string): Observable<any> {
  return this.http.get(`${this.API}/tracks/${id}`, { headers: this.headers });
}

}
