// src/app/pages/local-music/local-music-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalMusicPage }       from './local-music.page';

const routes: Routes = [
  { path: '', component: LocalMusicPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocalMusicPageRoutingModule {}
