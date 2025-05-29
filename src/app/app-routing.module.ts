import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // 1) Default → Home (login)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // 2) Login screen
  { path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  // 3) Tabs container
  { path: 'tabs',
    loadChildren: () => import('./tabs/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  // 4) Settings (if it’s top-level)
  { path: 'settings',
    loadChildren: () => import('./tabs/settings/settings.module').then(m => m.SettingsPageModule)
  },
  // 5) Folders list (if you want it top-level)
  { path: 'folders',
    loadChildren: () => import('./pages/folders/folders.module').then(m => m.FoldersPageModule)
  },
  // 6) **Parameterized** folder-detail route
  { path: 'folder-detail/:id',
    loadChildren: () => import('./pages/folder-detail/folder-detail.module').then(m => m.FolderDetailPageModule)
  },
  // 7) Now the wildcard — **last** in the list
  { path: '**', redirectTo: 'home' },  {
    path: 'local-music',
    loadChildren: () => import('./pages/local-music/local-music.module').then( m => m.LocalMusicPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
