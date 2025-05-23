import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription }    from 'rxjs';

import { FolderService }   from '../../services/folder.service';
import { Folder }          from '../../models/folder';

import { PlaybackService } from '../../services/playback.service';
import { LibraryItem }     from '../../models/library-item';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
  standalone: false
})
export class FoldersPage implements OnInit, OnDestroy {
  @ViewChild('audioPlayer', { static: false })
  audioPlayerRef!: ElementRef<HTMLAudioElement>;

  folders: Folder[] = [];

  // inline mini-player state
  currentTrack: LibraryItem | null = null;
  isPlaying = false;
  currentTime = 0; // in seconds
  duration    = 0; // in seconds

  private trackSub!: Subscription;
  private playingSub!: Subscription;
  private posSub!: Subscription;
  private durSub!: Subscription;

  constructor(
    private folderSvc: FolderService,
    private alertCtrl: AlertController,
    private router: Router,
    private playback: PlaybackService,
    private zone: NgZone
  ) {}

  async ngOnInit() {
    // load all folders
    this.folders = await this.folderSvc.getAll();

    // subscribe to playback state
    this.trackSub   = this.playback.currentTrack$.subscribe(t => this.currentTrack = t);
    this.playingSub = this.playback.isPlaying$.subscribe(p => this.isPlaying = p);
    this.posSub     = this.playback.position$.subscribe(ms =>
      this.zone.run(() => this.currentTime = ms / 1000)
    );
    this.durSub     = this.playback.duration$.subscribe(ms =>
      this.zone.run(() => this.duration = ms / 1000)
    );
  }

  ngOnDestroy() {
    this.trackSub.unsubscribe();
    this.playingSub.unsubscribe();
    this.posSub.unsubscribe();
    this.durSub.unsubscribe();
    this.playback.stop();
  }

  // Folder CRUD

  async create() {
    const alert = await this.alertCtrl.create({
      header: 'New Folder',
      inputs: [{ name: 'name', placeholder: 'Folder name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async data => {
            const name = data.name?.trim();
            if (!name) return;
            await this.folderSvc.create(name);
            this.folders = await this.folderSvc.getAll();
          }
        }
      ]
    });
    await alert.present();
  }

  async rename(f: Folder) {
    const alert = await this.alertCtrl.create({
      header: 'Rename Folder',
      inputs: [{ name: 'name', value: f.name }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async data => {
            const name = data.name?.trim();
            if (!name) return;
            await this.folderSvc.rename(f.id, name);
            this.folders = await this.folderSvc.getAll();
          }
        }
      ]
    });
    await alert.present();
  }

  async delete(f: Folder) {
    await this.folderSvc.delete(f.id);
    this.folders = await this.folderSvc.getAll();
  }

  openFolder(f: Folder) {
    this.router.navigate(['tabs', 'library', 'folder', f.id]);
  }

  // Mini-player controls

  toggle() {
    this.playback.toggle();
  }

  onSeek(event: any) {
    const t = event.detail.value as number;
    this.playback.seek(t * 1000);
  }

  onEnded() {
    this.playback.stop();
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
