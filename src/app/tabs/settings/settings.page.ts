// src/app/tabs/settings/settings.page.ts
import { PlaybackService }    from '../../services/playback.service';
import { Component } from '@angular/core';
import { Router }    from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone:false
})
export class SettingsPage {

  constructor(
    private router: Router,
     public playback: PlaybackService
  ) {}

  reset() {
    localStorage.removeItem('pkce_verifier');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
     this.playback.toggle(); 
    this.router.navigateByUrl('/home');

  }
}
