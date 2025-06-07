import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Filesystem, Directory, FileInfo }        from '@capacitor/filesystem';

interface Track {
  name: string;
  uri:  string;
}

@Component({
  selector: 'app-local-music',
  templateUrl: './local-music.page.html',
  styleUrls: ['./local-music.page.scss'],
  standalone:false
})
export class LocalMusicPage implements OnInit {
  @ViewChild('audioPlayer', { static: true })
  audioPlayerRef!: ElementRef<HTMLAudioElement>;

  tracks: Track[]         = [];
  currentTrack: Track | null = null;

  ngOnInit() {
    this.scanMusicFolder();
  }

  /** On Android must request READ permission for ExternalStorage */
  private async ensureFsPermissions(): Promise<void> {
    const perms = await Filesystem.requestPermissions();
    if (perms.publicStorage === 'denied') {
      throw new Error('Storage permission is required to list music files');
    }
  }

  /** List everything in /storage/emulated/0/Music */
  async scanMusicFolder(): Promise<void> {
    try {
      await this.ensureFsPermissions();

      // readdir now returns FileInfo[]
      const dir = await Filesystem.readdir({
        path: 'Music',
        directory: Directory.ExternalStorage
      });

      this.tracks = (dir.files as FileInfo[]).map(file => ({
        name: file.name,
        uri:  file.uri
      }));
    } catch (e) {
      console.error('Could not scan Music folder', e);
      this.tracks = [];
    }
  }

  /** Play a track */
  playTrack(track: Track): void {
    this.currentTrack = track;
    const player = this.audioPlayerRef.nativeElement;
    player.src  = track.uri;
    player.load();
    player.play();
  }

  /** Pause playback */
  pauseAudio(): void {
    this.audioPlayerRef.nativeElement.pause();
  }
}
