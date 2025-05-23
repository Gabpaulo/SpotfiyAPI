// src/app/tabs/library/library-routing.module.ts

import { NgModule }       from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryPage }    from './library.page';

const routes: Routes = [
  {
    path: '',
    component: LibraryPage
  },
  {
    // nested under /tabs/library/folder/:id
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
