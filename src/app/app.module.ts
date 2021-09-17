import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DeviceOrientation } from '@ionic-native/device-orientation/ngx';
import { DeviceMotion } from '@ionic-native/device-motion/ngx';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DeviceOrientation,
    Diagnostic,
    Geolocation,
    DeviceMotion,
    BackgroundGeolocation,
    BackgroundMode,
    TextToSpeech
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
