import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;

  /** Play or toggle a 30 s clip URL */
  playPreview(url: string) {
    if (!this.audio) {
      this.audio = new Audio();
    }
    // same URL → toggle
    if (this.currentUrl === url) {
      return this.toggle();
    }
    // otherwise load new clip
    this.currentUrl = url;
    this.audio.src = url;
    this.audio.load();
    this.audio.play().catch(console.error);
  }

  /** Pause/resume */
  toggle() {
    if (!this.audio) { return; }
    this.audio.paused ? this.audio.play().catch(console.error) : this.audio.pause();
  }

  /** Stop & clear */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.currentUrl = null;
    }
  }
}
