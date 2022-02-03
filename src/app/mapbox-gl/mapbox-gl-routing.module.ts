import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapboxGlPage } from './mapbox-gl.page';

const routes: Routes = [
  {
    path: '',
    component: MapboxGlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapboxGlPageRoutingModule {}
