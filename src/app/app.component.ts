import { Component } from '@angular/core';
import { 
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationEvents,
  BackgroundGeolocationLocationProvider,
  BackgroundGeolocationResponse  
} from '@ionic-native/background-geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';
import { LocationStateService } from './state-management/location-state.service';
declare var window;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private backgroundGeolocation: BackgroundGeolocation,
    private backgroundMode: BackgroundMode,
    private locationStateService:LocationStateService
  ) {
    this.initializeApp();
  }

  initializeApp(){
    this.platform.ready().then(()=>{
      this.backgroundMode.enable();
      /**
       * Referencia: https://como-programar.net/ionic/background-geolocation/
       */
      const config: BackgroundGeolocationConfig = {
        // desiredAccuracy: 10,
        desiredAccuracy: 0,
        // desiredAccuracy: BackgroundGeolocationAccuracy,
        // stationaryRadius: 20,
        stationaryRadius: 2,
        // distanceFilter: 30,
        distanceFilter: 1,
        debug: false, //  Esto hace que el dispositivo emita sonidos cuando lanza un evento de localización
        stopOnTerminate: true, // Si pones este en verdadero, la aplicación dejará de trackear la localización cuando la app se haya cerrado.

        //Estas solo están disponibles para Android
        // locationProvider: 1, //Será el proveedor de localización. Gps, Wifi, Gms, etc...
        locationProvider:BackgroundGeolocationLocationProvider.ACTIVITY_PROVIDER,
        startForeground: true,
        interval: 50, //El intervalo en el que se comprueba la localización.
        fastestInterval: 50, //Este para cuando está en movimiento.
        //  activitiesInterval: 10000, //Este es para cuando está realizando alguna actividad con el dispositivo.
      };

      this.backgroundGeolocation.configure(config).then(()=>{
        this.backgroundGeolocation.on
        (BackgroundGeolocationEvents.location).subscribe(
          (location:BackgroundGeolocationResponse)=>{
            // console.log(location)
            // localStorage.setItem("location",JSON.stringify(location));

            // this.event.dispatchEvent('backgroundLocation');
            this.locationStateService.change(location);
            // console.log(location)
          }
        );
      });
      window.app=this;
    });
  }
}
