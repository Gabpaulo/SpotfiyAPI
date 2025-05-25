import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AlertController }   from '@ionic/angular';

import { FolderService } from '../../services/folder.service';
import { PlaybackService } from '../../services/playback.service';
import { Folder } from '../../models/folder';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
  standalone:false
})
export class FoldersPage implements OnInit {
  folders: Folder[] = [];

  constructor(
    private folderSvc: FolderService,
    private alertCtrl: AlertController,
    private router: Router,
    private playback: PlaybackService
  ) {}

  async ngOnInit() {
    this.folders = await this.folderSvc.getAll();
  }

  async create() { /* unchanged */ }
  async rename(f: Folder) { /* unchanged */ }
  async delete(f: Folder) { /* unchanged */ }

  openFolder(f: Folder) {
    this.router.navigate(['tabs', 'library', 'folder', f.id]);
  }

  // If you ever need to kick off playback from here:
  play(item: any) {
    this.playback.play(item);
  }
}
