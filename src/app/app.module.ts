// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule }    from '@angular/common/http';
import { IonicStorageModule }  from '@ionic/storage-angular';
import { MiniPlayerComponent } from './components/mini-player/mini-player.component';

import { AppComponent }        from './app.component';
import { AppRoutingModule }    from './app-routing.module';

// ← import your mini-player and pipe


@NgModule({
  declarations: [
    AppComponent

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
