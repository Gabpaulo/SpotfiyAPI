// src/app/app.component.ts

import { Component } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone:false
})
export class AppComponent {
  constructor(private auth: AuthService) {
    this.initializeDeepLinkListener();
  }

  private initializeDeepLinkListener() {
    CapacitorApp.addListener('appUrlOpen', (event: { url: string }) => {
      // e.g. event.url = "musicplayer://callback?code=AQBy…"
      if (!event.url.startsWith(this.auth['redirectUri'])) {
        return;
      }
      const url = new URL(event.url);
      const code = url.searchParams.get('code');
      if (code) {
        this.auth.exchangeCode(code);
      }
    });
  }
}
