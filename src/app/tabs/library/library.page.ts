// src/app/tabs/library/library.page.ts

import { Component, OnInit }    from '@angular/core';
import { Router }               from '@angular/router';
import { AlertController }      from '@ionic/angular';
import { FolderService }        from '../../services/folder.service';
import { Folder }               from '../../models/folder';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
  standalone:false
})
export class LibraryPage implements OnInit {
  folders: Folder[] = [];

  constructor(
    private folderSvc: FolderService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadFolders();
  }

  private async loadFolders() {
    this.folders = await this.folderSvc.getAll();
  }

  /** Create a new folder via Alert prompt */
  async createFolder() {
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
            await this.loadFolders();
          }
        }
      ]
    });
    await alert.present();
  }

  /** Rename an existing folder */
  async renameFolder(folder: Folder) {
    const alert = await this.alertCtrl.create({
      header: 'Rename Folder',
      inputs: [{ name: 'name', value: folder.name }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async data => {
            const name = data.name?.trim();
            if (!name) return;
            await this.folderSvc.rename(folder.id, name);
            await this.loadFolders();
          }
        }
      ]
    });
    await alert.present();
  }

  /** Confirm & delete */
  async deleteFolder(folder: Folder) {
    const confirm = await this.alertCtrl.create({
      header: 'Delete Folder',
      message: `Are you sure you want to remove “${folder.name}”?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.folderSvc.delete(folder.id);
            await this.loadFolders();
          }
        }
      ]
    });
    await confirm.present();
  }

  /** Navigate into Folder Detail under the Tabs route */
  openFolder(folder: Folder) {
    // Note: this must match your nested route in library-routing.module.ts
    this.router.navigate(['tabs', 'library', 'folder', folder.id]);
  }
}
