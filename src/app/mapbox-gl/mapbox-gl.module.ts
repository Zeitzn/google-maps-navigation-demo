import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapboxGlPageRoutingModule } from './mapbox-gl-routing.module';

import { MapboxGlPage } from './mapbox-gl.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapboxGlPageRoutingModule
  ],
  declarations: [MapboxGlPage]
})
export class MapboxGlPageModule {}
