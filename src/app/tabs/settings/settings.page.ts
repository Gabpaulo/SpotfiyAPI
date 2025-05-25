// src/app/tabs/settings/settings.page.ts

import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { AudioService } from '../../services/audio.service';  // ← import

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone:false
})
export class SettingsPage {

  constructor(
    private router: Router,
    private audio: AudioService           // ← inject
  ) {}

  reset() {
    // stop any in-progress preview
    this.audio.stop();

    // clear your PKCE and tokens
    localStorage.removeItem('pkce_verifier');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // send user back to login
    this.router.navigateByUrl('/home');
  }
}
