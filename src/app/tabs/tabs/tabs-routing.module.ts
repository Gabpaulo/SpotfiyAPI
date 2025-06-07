import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage }             from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'search',
        loadChildren: () =>
          import('../search/search.module').then(m => m.SearchPageModule)
      },
      {
        path: 'library',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../library/library.module').then(m => m.LibraryPageModule)
          },
          {
            path: 'folder/:id',
            loadChildren: () =>
              import('../../pages/folder-detail/folder-detail.module')
              .then(m => m.FolderDetailPageModule)
          }
        ]
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
  {
    path: 'local-music',
    loadChildren: () => import('../../pages/local-music/local-music.module').then( m => m.LocalMusicPageModule)
  },

      // default for tabs
      { path: '', redirectTo: 'search', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
