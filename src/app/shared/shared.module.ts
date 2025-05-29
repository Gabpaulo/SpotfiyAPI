// src/app/shared/shared.module.ts
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { IonicModule }    from '@ionic/angular';

// 👇 import the mini‐player (or any other shared components)
import { MiniPlayerComponent } from '../components/mini-player/mini-player.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [
    MiniPlayerComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MiniPlayerComponent
  ]
})
export class SharedModule {}
