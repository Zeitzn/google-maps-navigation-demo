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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { AuthInterceptorService } from './services/auth-interceptor.service';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [HttpClientModule,BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DeviceOrientation,
    Diagnostic,
    Geolocation,
    DeviceMotion,
    BackgroundGeolocation,
    BackgroundMode,
    TextToSpeech,
    Insomnia
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
