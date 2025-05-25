import { Component }      from '@angular/core';
import { PlaybackService } from '../../services/playback.service';
import { Observable }     from 'rxjs';
import { LibraryItem }    from '../../models/library-item';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone:false
})
export class MiniPlayerComponent {
  track$:    Observable<LibraryItem | null> = this.playback.currentTrack$;
  playing$:  Observable<boolean>            = this.playback.isPlaying$;
  position$: Observable<number>             = this.playback.position$;
  duration$: Observable<number>             = this.playback.duration$;

  constructor(public playback: PlaybackService) {}

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /** handle both number or {lower,upper} */
  onSeek(ev: CustomEvent) {
    const v = ev.detail.value;
    const sec = typeof v === 'number' ? v : (v as any).lower;
    this.playback.seek(sec);
  }
}
