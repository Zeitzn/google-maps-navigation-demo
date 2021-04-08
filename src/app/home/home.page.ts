import { Component } from '@angular/core';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, Marker } from '@ionic-native/google-maps';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { BackgroundTrackingService } from '../services/background-tracking/background-tracking.service';
import { LocationStateService } from '../state-management/location-state.service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

declare var plugin;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  magneticHeading: number = 0;
  navigationInitialized: boolean = false;

  latitude: number = 6.25184;
  longitude: number = -75.56359;

  map: GoogleMap;
  positionMarker: Marker;



  constructor(
    private deviceOrientation: DeviceOrientation,
    private platform: Platform,
    private diagnostic: Diagnostic,
    private geolocation: Geolocation,
    private deviceMotion: DeviceMotion,
    private backgroundTrackingService: BackgroundTrackingService,
    private locationStateService: LocationStateService,
    private tts: TextToSpeech
  ) {


    

    //#region Orientación
    // this.magneticHeading = 0;
    // this.platform.ready().then(() => {
    //   this.deviceOrientation.getCurrentHeading().then(
    //     (data1: DeviceOrientationCompassHeading) => {
    //       this.magneticHeading = data1.magneticHeading
    //       if (this.positionMarker != null) {
    //         this.positionMarker.setRotation(this.magneticHeading);
    //       }
    //     },
    //     (error: any) => console.log(error + " #Error in getCurrentHeading")
    //   );

    //   const options = { frequency: 100 };
    //   const subscription = this.deviceOrientation.watchHeading(options).subscribe(
    //     (data3: DeviceOrientationCompassHeading) => {
    //       this.magneticHeading = data3.magneticHeading;

    //       if (this.positionMarker != null) {
    //         this.positionMarker.setRotation(this.magneticHeading);
    //       }
    //     },
    //     (error: any) => console.log(error + " #Error in watchHeading subscription")
    //   );
    // });
    //#endregion

    //#region Acelerómetro
    // Get the device current acceleration
    this.deviceMotion.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) => {
        console.log(acceleration)
      },
      (error: any) => {
        console.log(error)
      }
    );

    // Watch device acceleration
    var subscription = this.deviceMotion.watchAcceleration().subscribe((acceleration: DeviceMotionAccelerationData) => {
      console.log(acceleration);
    });
    //#endregion

  }

  ionViewDidEnter() {
    // this.loadRequeriments();
    this.backgroundTrackingService.StartBackgroundTracking();
    this.getLocation();
  }

  async loadRequeriments() {
    await this.loadMap();
  }

  stopNavigation() {
    this.navigationInitialized = false;
    this.positionMarker.setRotation(this.magneticHeading);
    this.map.setOptions(
      {
        camera: {
          duration: 2000,
          target: {
            lat: this.latitude,
            lng: this.longitude
          },
          // zoom: 30,
          zoom: 17,
          // tilt: 90,//Ángulo horizontal, setear al iniciar navegacion

        },
        controls: {
          compass: true,
          // myLocationButton: true,
          // myLocation: true,
          zoom: true,
          mapToolbar: true
        }
      })
  }

  initNavigation() {
    this.navigationInitialized = true;
    this.map.setCameraTilt(90);
    this.map.setCameraZoom(30);
    this.map.setOptions({ controls: { zoom: false } })
    this.map.animateCamera({
      duration: 2000,
      target: {
        lat: this.latitude,
        lng: this.longitude
      },
    });


  }

  rotateMap() {
    this.map.setCameraBearing(this.magneticHeading)
  }

  async loadMap() {


    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 17,
      },
      controls: {
        compass: true,
        zoom: true,
        mapToolbar: false
      }
    };

    this.map = GoogleMaps.create('tracking-map', mapOptions);


    this.positionMarker = this.map.addMarkerSync({
      position: {
        lat: this.latitude,
        lng: this.longitude
      },
      icon: {
        url: "./assets/icons/maps/vehicle.png"
      },
      rotation: this.magneticHeading,
    });

    this.positionMarker.setIconAnchor(32.5, 32.5);

    this.updateMarker();

  }

  async getLocation() {
    // const loader = await this.serviceProvider.loading('Obteniendo tu ubicación..');
    // loader.present();
    let p = this.diagnostic.isGpsLocationEnabled();
    p.then((available) => {
      if (available) {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = resp.coords.latitude;
          this.longitude = resp.coords.longitude;
          console.log(resp)
          // this.positionToOriginPolyline.remove();
          // this.updatePosition(resp.coords.latitude, resp.coords.longitude);
          // this.showRoutePositionToOrigin();
          // loader.dismiss();
          this.loadRequeriments();
        }).catch((error) => {
          // loader.dismiss();
        }).finally(() => {
          // loader.dismiss();
        });

      } else {
        alert("Activa tu GPS");
        // loader.dismiss();
        // this._mensaje.showAlert('Mensaje', 'Active su GPS para obtener su ubicación').then(a => {
        // loader.dismiss();

        // });
      }
    }).catch(error => {
      // loader.dismiss();
    });
  }

  speakText(text:string){
    this.tts.speak({
      text,
      locale:'es-ES'
    })
  .then(() => console.log('Success'))
  .catch((reason: any) => console.log(reason));
  }

  updateMarker(){
    this.locationStateService.execChange.subscribe(data => {
      if (this.positionMarker != null) {
        this.positionMarker.remove();
      }
      this.latitude = data['latitude'];
      this.longitude = data['longitude'];
      this.magneticHeading = data['bearing'];
      this.positionMarker = this.map.addMarkerSync({
        position: {
          lat: this.latitude,
          lng: this.longitude
        },
        icon: {
          url: "./assets/icons/maps/vehicle.png",
          anchor: {
            x: 32.5,
            y: 32.5
          },
        },
        draggable: true,
        rotation: this.navigationInitialized ? 0 : this.magneticHeading,
      });

      let pm = this.map.addMarkerSync({
        position: {
          lat: this.latitude,
          lng: this.longitude
        },
      });

      if (this.navigationInitialized) {
        this.rotateMap();
      }

      this.map.animateCamera({
        duration: 500,
        target: { lat: this.latitude, lng: this.longitude }
      })
    });
  }
}
