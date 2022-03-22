import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapboxGlOfflinePageRoutingModule } from './mapbox-gl-offline-routing.module';

import { MapboxGlOfflinePage } from './mapbox-gl-offline.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapboxGlOfflinePageRoutingModule
  ],
  declarations: [MapboxGlOfflinePage]
})
export class MapboxGlOfflinePageModule {}
