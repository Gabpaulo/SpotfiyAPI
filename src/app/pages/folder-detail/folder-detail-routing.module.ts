import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolderDetailPage } from './folder-detail.page';

const routes: Routes = [
  {
    path: '',
    component: FolderDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FolderDetailPageRoutingModule {}
