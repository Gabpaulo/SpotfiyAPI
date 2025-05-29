import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryPage }          from './library.page';

const routes: Routes = [
  {
    path: '',
    component: LibraryPage
  },
  {
    // clicking “Local Music” goes here
    path: 'local',
    loadChildren: () =>
      import('../../pages/local-music/local-music.module')
        .then(m => m.LocalMusicPageModule)
  },
  {
    // existing folder‐detail route
    path: 'folder/:id',
    loadChildren: () =>
      import('../../pages/folder-detail/folder-detail.module')
        .then(m => m.FolderDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryPageRoutingModule {}
