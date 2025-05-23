// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Browser } from '@capacitor/browser';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientId    = 'ec26eb02a88c4e6d9c7cdab2af32f256';
  private redirectUri = 'musicplayer://callback';
  private authUrl     = 'https://accounts.spotify.com/authorize';
  private tokenUrl    = 'https://accounts.spotify.com/api/token';

  // ⚠️ Added 'streaming' here
  private scopes = [
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' ');

  constructor(private http: HttpClient, private router: Router) {}

  /** Step 1: Open Spotify’s auth in a Chrome Custom Tab */
  async login() {
    const verifier  = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      client_id:             this.clientId,
      response_type:         'code',
      redirect_uri:          this.redirectUri,
      scope:                 this.scopes,             // ← use the new scopes string
      code_challenge_method: 'S256',
      code_challenge:        challenge
    });

    // e.g. https://accounts.spotify.com/authorize?client_id=…&scope=streaming%20…
    const url = `${this.authUrl}?${params.toString()}`;

    await Browser.open({ url });
  }

  /** Step 2: Exchange code for tokens and navigate on success */
  async exchangeCode(code: string) {
    const verifier = localStorage.getItem('pkce_verifier')!;
    const body = new HttpParams()
      .set('grant_type',    'authorization_code')
      .set('code',          code)
      .set('redirect_uri',  this.redirectUri)
      .set('client_id',     this.clientId)
      .set('code_verifier', verifier);

    const res: any = await this.http.post(
      this.tokenUrl,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).toPromise();

    localStorage.setItem('access_token',  res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);

    // now your token has the 'streaming' scope
    this.router.navigateByUrl('/tabs');
  }
}
