import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'mapbox-gl',
    pathMatch: 'full'
  },
  {
    path: 'mapbox-gl',
    loadChildren: () => import('./mapbox-gl/mapbox-gl.module').then( m => m.MapboxGlPageModule)
  },
  {
    path: 'mapbox-gl-offline',
    loadChildren: () => import('./mapbox-gl-offline/mapbox-gl-offline.module').then( m => m.MapboxGlOfflinePageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
