import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderDetailPageRoutingModule } from './folder-detail-routing.module';

import { FolderDetailPage } from './folder-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderDetailPageRoutingModule
  ],
  declarations: [FolderDetailPage]
})
export class FolderDetailPageModule {}
