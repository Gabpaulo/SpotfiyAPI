// src/app/pages/local-music/local-music.module.ts

import { NgModule }               from '@angular/core';
import { IonicModule }            from '@ionic/angular';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';

import { LocalMusicPageRoutingModule } from './local-music-routing.module';
import { LocalMusicPage }           from './local-music.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    LocalMusicPageRoutingModule
  ],
  declarations: [LocalMusicPage]
})
export class LocalMusicPageModule {}
