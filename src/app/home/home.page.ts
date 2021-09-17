import { Component } from '@angular/core';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, LatLng, Marker, PolylineOptions } from '@ionic-native/google-maps';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { BackgroundTrackingService } from '../services/background-tracking/background-tracking.service';
import { LocationStateService } from '../state-management/location-state.service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { AuthService } from '../services/auth.service';
import { DirectionsService } from '../services/directions.service';

// declare var plugin;
export class StepItem {
  position:number;
  selected:boolean;
  endLocation: any;
  htmlInstructions: string;
  textInstructions:string;
  startLocation: any;
  instructions:string;
}
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


  steps: StepItem[] = [];
  // selectedStep
  lastDistanceKm:number=0;
  selectedStep:StepItem;
  textReaded:boolean=false;
  constructor(
    private deviceOrientation: DeviceOrientation,
    private platform: Platform,
    private diagnostic: Diagnostic,
    private geolocation: Geolocation,
    // private deviceMotion: DeviceMotion,
    private backgroundTrackingService: BackgroundTrackingService,
    private locationStateService: LocationStateService,
    private tts: TextToSpeech,
    private authService: AuthService,
    private directionsApiService: DirectionsService
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
    // // Get the device current acceleration
    // this.deviceMotion.getCurrentAcceleration().then(
    //   (acceleration: DeviceMotionAccelerationData) => {
    //     console.log(acceleration)
    //   },
    //   (error: any) => {
    //     console.log(error)
    //   }
    // );

    // // Watch device acceleration
    // var subscription = this.deviceMotion.watchAcceleration().subscribe((acceleration: DeviceMotionAccelerationData) => {
    //   console.log(acceleration);
    // });
    //#endregion

  }

  ionViewDidEnter() {
    // this.loadRequeriments();
    // this.backgroundTrackingService.StartBackgroundTracking();
    this.getLocation();
  }

  getRouteInfo() {
    let user = {
      username: 'vvsede1',
      password: '123'
    };
    this.authService.login(user).subscribe(result => {
      console.log(result);
      this.authService.saveToken(result);
      let wpt = [];
      let coord = {
        origin: {
          latitude: 6.144651001885719,
          longitude: -75.63717842102051
        },
        destination: {
          latitude: 6.440097016172582,
          longitude: -75.32970070838928
        },
        waypoints: wpt
      }
      this.directionsApiService.getDirections(coord).subscribe((response: any) => {
        console.log(response)
        //Renderizamos la ruta
        let options: PolylineOptions = {
          points: response['overview_path'],
          color: '#232C49',
          width: 8,
          geodesic: true,
          clickable: true,
        };

        this.map.addPolylineSync(options);
        this.getSteps(response);
        this.backgroundTrackingService.StartBackgroundTracking();
      });
    });
  }


  getSteps(route) {
    let position=0;
    this.steps = [];
    route.directions.routes.forEach(element => {
      element.legs.forEach(leg => {
        leg.steps.forEach((step:StepItem) => {
          step.position=position;
          step.selected=false;

          // let clear1 = step.htmlInstructions.replace('<b>','.');
          // let clear2 = clear1.replace('</b>','.');
          // console.log(step.instructions)
          // let clear1 = step.htmlInstructions.split('<b>').join('.');
          // let clear2 = clear1.split('</b>').join('.');

          let div = document.createElement("div");
          div.innerHTML = step.htmlInstructions;
          let text = div.textContent || div.innerText || "";
          
          text = text.split('/').join('.')
          text = text.split('Cra.').join('Carretera')
          text = text.split('Calz ').join('Calzada')
          text = text.split('Calz.').join('Calzada')
          text = text.split('Cl.').join('Calle')
          text = text.split('Av.').join('Avenida')
          
          step.textInstructions = text;
          console.log(step.position+' - '+text)
          this.steps.push(step)
          this.map.addMarkerSync({
            position: {
              lat: step.startLocation.lat,
              lng: step.startLocation.lng
            },
            title:step.position.toString()
          });
          position++;
        });
      });
    });
    // this.steps[0].selected=true;
    console.log(this.steps)
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
    this.map.setPadding(this.navigationInitialized?320:0,0,0,0)
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
      },
      styles:[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ffeb3b"
      },
      {
        "weight": 1.5
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]
      // styles: [
      //   { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      //   { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      //   { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      //   {
      //     featureType: "administrative.locality",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#d59563" }],
      //   },
      //   {
      //     featureType: "poi",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#d59563" }],
      //   },
      //   {
      //     featureType: "poi.park",
      //     elementType: "geometry",
      //     stylers: [{ color: "#263c3f" }],
      //   },
      //   {
      //     featureType: "poi.park",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#6b9a76" }],
      //   },
      //   {
      //     featureType: "road",
      //     elementType: "geometry",
      //     stylers: [{ color: "#38414e" }],
      //   },
      //   {
      //     featureType: "road",
      //     elementType: "geometry.stroke",
      //     stylers: [{ color: "#212a37" }],
      //   },
      //   {
      //     featureType: "road",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#9ca5b3" }],
      //   },
      //   {
      //     featureType: "road.highway",
      //     elementType: "geometry",
      //     stylers: [{ color: "#746855" }],
      //   },
      //   {
      //     featureType: "road.highway",
      //     elementType: "geometry.stroke",
      //     stylers: [{ color: "#1f2835" }],
      //   },
      //   {
      //     featureType: "road.highway",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#f3d19c" }],
      //   },
      //   {
      //     featureType: "transit",
      //     elementType: "geometry",
      //     stylers: [{ color: "#2f3948" }],
      //   },
      //   {
      //     featureType: "transit.station",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#d59563" }],
      //   },
      //   {
      //     featureType: "water",
      //     elementType: "geometry",
      //     stylers: [{ color: "#17263c" }],
      //   },
      //   {
      //     featureType: "water",
      //     elementType: "labels.text.fill",
      //     stylers: [{ color: "#515c6d" }],
      //   },
      //   {
      //     featureType: "water",
      //     elementType: "labels.text.stroke",
      //     stylers: [{ color: "#17263c" }],
      //   },
      // ],
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

        let watch = this.geolocation.watchPosition();
        watch.subscribe((data) => {

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

  speakText(text: string) {
    this.tts.speak({
      text,
      locale: 'es-ES'
    })
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
  }

  calculandoDistance:boolean=false;
  updateMarker() {
    this.locationStateService.execChange.subscribe(data => {
      
      
      if(this.calculandoDistance==false){
        this.calculandoDistance=true;
        let filteredSteps = this.steps.filter(x=>!x.selected);
        console.log("Valida distancia en: ", filteredSteps.length+' steps')
        let step:StepItem = filteredSteps.find(x=>(parseFloat(this.coordinatesDistance(x.startLocation.lat,x.startLocation.lng,data['latitude'],data['longitude']))*1000)<=100);
        console.log(step)
        if(step){
          this.selectedStep = step;
          if(!this.textReaded){
            this.steps[this.selectedStep.position].selected=true;
            // this.steps.splice(this.selectedStep.position,1);            
            this.textReaded=true;
            this.speakText(this.selectedStep.textInstructions);
            // this.textReaded=false;
          }
        console.log("Step position: "+step.position)
        }else{
          this.textReaded = false
        }
      //   let position=step.position;
      //   let kmDistanceText = this.coordinatesDistance(step.startLocation.lat,step.startLocation.lng,data['latitude'],data['longitude']);
      //   let kmDistance = parseFloat(kmDistanceText)
      //   console.log(kmDistance)
      //   console.log("Last distance: "+this.lastDistanceKm)
      //   if(this.lastDistanceKm!=0){
      //     if(this.lastDistanceKm<kmDistance){
      //       // this.lastDistanceKm = kmDistance;
      //       this.steps[position].selected=false;
      //       console.log(position<this.steps.length-1)
      //       if(position<this.steps.length-1){
      //         this.steps[position+1].selected=true;
      //       }
      //     }else{
      //       if(kmDistance<1){
      //         console.log("Mostrar instruccion")
      //         if(kmDistance<0.1){
      //           console.log("Esconder instruccion en "+ (kmDistance*1000) +'metros')
      //         }
      //       }
      //     }
      //      this.lastDistanceKm = kmDistance;          
      //   }else{
      //     this.lastDistanceKm = kmDistance;
      //   }
        this.calculandoDistance = false;
      }


      // console.log(data)
      // if (this.positionMarker != null) {
      //   this.positionMarker.remove();
      // }
      this.latitude = data['latitude'];
      this.longitude = data['longitude'];
      this.magneticHeading = data['bearing'];
      this.positionMarker.setPosition({lat:this.latitude,lng:this.longitude});
      this.positionMarker.setRotation(this.navigationInitialized ? 0 : this.magneticHeading)
      // this.positionMarker = this.map.addMarkerSync({
      //   position: {
      //     lat: this.latitude,
      //     lng: this.longitude
      //   },
      //   icon: {
      //     url: "./assets/icons/maps/vehicle.png",
      //     anchor: {
      //       x: 32.5,
      //       y: 32.5
      //     },
      //   },
      //   draggable: true,
      //   rotation: this.navigationInitialized ? 0 : this.magneticHeading,
      // });

      // let pm = this.map.addMarkerSync({
      //   position: {
      //     lat: this.latitude,
      //     lng: this.longitude
      //   },
      // });

      if (this.navigationInitialized) {
        this.rotateMap();
      }

      this.map.animateCamera({
        duration: 500,
        target: { lat: this.latitude, lng: this.longitude }
      });

      if(this.navigationInitialized){
        this.map.setPadding(this.navigationInitialized?320:0,0,0,0)
      }

      //Prueba de centrado inferior
      // let offset = 0.002;
      // let camera = new LatLng(this.latitude+offset , this.longitude);
      // this.map.animateCamera({
      //   duration: 500,
      //   target: camera
      // });
      //---------------------------------------------

    });
  }

  //#region Utilidades
  rad(x) {
    return x * Math.PI / 180;
  }

  /**
   * \fn coordinatesDistance().
   *
   * \Description: Devuelve la distancia en kilometros entre dos puntos dados por su latitud y longitud
   *
   * \param (integer) lat1 : Latitud del punto 1
   * \param (integer) long1 : Longitud del punto 1
   * \param (integer) lat2 : Latitud del punto 2
   * \param (integer) long2 : Longitud del punto 2
   *
   * \return (integer) Distancia en kilometros
   *
  */
  coordinatesDistance(lat1, lon1, lat2, lon2) {
    var R = 6378.137; //Radio de la tierra en km
    var dLat = this.rad(lat2 - lat1);
    var dLong = this.rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(lat1)) * Math.cos(this.rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(3); //Retorna tres decimales
  }
  //#endregion
}
