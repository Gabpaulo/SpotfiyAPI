// src/app/tabs/library/library.module.ts

import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { LibraryPage }        from './library.page';
import { LibraryPageRoutingModule } from './library-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    LibraryPageRoutingModule,
    SharedModule
  ],
  declarations: [LibraryPage],
})
export class LibraryPageModule {}
