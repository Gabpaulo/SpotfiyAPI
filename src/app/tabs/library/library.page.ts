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

  /** Navigate into the Local Music “folder” */
  openLocalMusic() {
    this.router.navigate(['tabs','library','local']);
  }

  /** Navigate into a user‐created folder */
  openFolder(f: Folder) {
    this.router.navigate(['tabs','library','folder', f.id]);
  }

  async createFolder() {
    const alert = await this.alertCtrl.create({
      header: 'New Folder',
      inputs: [{ name:'name', placeholder:'Folder name' }],
      buttons: [
        { text:'Cancel', role:'cancel' },
        {
          text:'Create',
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

  async renameFolder(f: Folder) {
    const alert = await this.alertCtrl.create({
      header: 'Rename Folder',
      inputs: [{ name:'name', value:f.name }],
      buttons: [
        { text:'Cancel', role:'cancel' },
        {
          text:'Save',
          handler: async data => {
            const name = data.name?.trim();
            if (!name) return;
            await this.folderSvc.rename(f.id, name);
            await this.loadFolders();
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteFolder(f: Folder) {
    const confirm = await this.alertCtrl.create({
      header: 'Delete Folder',
      message: `Remove “${f.name}” and its contents?`,
      buttons: [
        { text:'Cancel', role:'cancel' },
        {
          text:'Delete',
          role:'destructive',
          handler: async () => {
            await this.folderSvc.delete(f.id);
            await this.loadFolders();
          }
        }
      ]
    });
    await confirm.present();
  }
}
