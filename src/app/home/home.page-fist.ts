import { Component } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMap, GoogleMapOptions, GoogleMaps, Marker, Polyline, PolylineOptions } from '@ionic-native/google-maps';
import { BackgroundTrackingService } from '../services/background-tracking/background-tracking.service';
import { LocationStateService } from '../state-management/location-state.service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { AuthService } from '../services/auth.service';
import { DirectionsService } from '../services/directions.service';

// declare var plugin;
export class StepItem {
  position: number;
  selected: boolean;
  endLocation: any;
  htmlInstructions: string;
  textInstructions: string;
  startLocation: any;
  instructions: string;
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
  selectedStep: StepItem;
  textReaded: boolean = false;

  origin: string = '6.3367287999999995,-75.55958869999999';
  destination: string = '6.437951699999999,-75.3318156';

  calculatingDistance: boolean = false;

  routePolyline:Polyline;

  // Variables para deslizamiento suave del marcador
  numDeltas: number = 100;
  delay: number = 10; //milliseconds
  i: number = 0;
  deltaLat: number = 0;
  deltaLng: number = 0;
  constructor(
    private diagnostic: Diagnostic,
    private geolocation: Geolocation,
    private backgroundTrackingService: BackgroundTrackingService,
    private locationStateService: LocationStateService,
    private tts: TextToSpeech,
    private authService: AuthService,
    private directionsApiService: DirectionsService
  ) {


  }

  ionViewDidEnter() {
    this.loadMap();
  }

  // getRouteInfo() {
  //   this.backgroundTrackingService.StopBackgroundGeolocation();
  //   let user = {
  //     username: 'vvsede1',
  //     password: '123'
  //   };
  //   let originArray: string[] = this.origin.split(',');
  //   let destinationArray: string[] = this.destination.split(',');

  //   this.latitude = parseFloat(originArray[0]),
  //     this.longitude = parseFloat(originArray[1])

  //   this.authService.login(user).subscribe(result => {
  //     console.log(result);
  //     this.authService.saveToken(result);
  //     let wpt = [];
  //     let coord = {
  //       origin: {
  //         latitude: this.latitude,
  //         longitude: this.longitude
  //       },
  //       destination: {
  //         latitude: parseFloat(destinationArray[0]),
  //         longitude: parseFloat(destinationArray[1])
  //       },
  //       waypoints: wpt
  //     }
  //     this.directionsApiService.getDirections(coord).subscribe((response: any) => {
  //       console.log(response)
  //       //Renderizamos la ruta
  //       let options: PolylineOptions = {
  //         points: response['overview_path'],
  //         color: '#232C49',
  //         width: 8,
  //         geodesic: true,
  //         clickable: true,
  //       };
  //       this.positionMarker.setPosition({ lat: this.latitude, lng: this.longitude });
  //       this.map.animateCamera({
  //         duration: 2000,
  //         target: {
  //           lat: this.latitude,
  //           lng: this.longitude
  //         },
  //       });
  //       this.map.addPolylineSync(options);
  //       this.getSteps(response);
  //       this.updateMarker();
  //       this.backgroundTrackingService.StartBackgroundTracking();
  //     });
  //   });
  // }

  getSteps(route) {
    let position = 0;
    this.steps = [];
    route.directions.routes.forEach(element => {
      element.legs.forEach(leg => {
        leg.steps.forEach((step: StepItem) => {
          step.position = position;
          step.selected = false;

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
          console.log(step.position + ' - ' + text)
          this.steps.push(step)
          this.map.addMarkerSync({
            position: {
              lat: step.startLocation.lat,
              lng: step.startLocation.lng
            },
            title: step.position.toString()
          });
          position++;
        });
      });
    });
    console.log(this.steps)
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
      styles: []

    };

    this.map = GoogleMaps.create('tracking-map', mapOptions);


    this.positionMarker = this.map.addMarkerSync({
      position: {
        lat: this.latitude,
        lng: this.longitude
      },
      icon: {
        url: "./assets/icons/maps/navigation-48.png"
      },
      rotation: this.magneticHeading,
    });

    this.positionMarker.setIconAnchor(24, 24);
    this.updateMarker();
    this.backgroundTrackingService.StartBackgroundTracking();

  }

  async getLocation() {
    console.log("GET LOCATION")
    // const loader = await this.serviceProvider.loading('Obteniendo tu ubicación..');
    // loader.present();
    let p = this.diagnostic.isGpsLocationEnabled();
    p.then((available) => {
      if (available) {
        console.log(available)
        this.geolocation.getCurrentPosition().then((resp) => {
          console.log(resp)
          this.latitude = resp.coords.latitude;
          this.longitude = resp.coords.longitude;
          console.log(resp)
          // this.loadRequeriments();
        }).catch((error) => {
          console.log(error)
          // loader.dismiss();
        }).finally(() => {
          // loader.dismiss();
        });

        // let watch = this.geolocation.watchPosition();
        // watch.subscribe((data) => {

        // });

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

  updateMarker() {
    this.locationStateService.execChange.subscribe(data => {
      if (this.map != null) {
        data['latitude'];
        data['longitude'];
        this.magneticHeading = data['bearing'];
        this.transition(data['latitude'], data['longitude']);
        // this.positionMarker.setRotation(this.navigationInitialized ? 0 : this.magneticHeading);

        // if (this.navigationInitialized) {
        //   this.map.setPadding(this.navigationInitialized ? 320 : 0, 0, 0, 0)
        //   this.rotateMap();
        // }

        if (!this.calculatingDistance && this.navigationInitialized) {
          this.calculatingDistance = true;
          let filteredSteps = this.steps.filter(x => !x.selected);
          let step: StepItem = filteredSteps.find(x => (parseFloat(this.coordinatesDistance(x.startLocation.lat, x.startLocation.lng, data['latitude'], data['longitude'])) * 1000) <= 100);          
          if (step != null && step !== undefined) {
            this.selectedStep = step;
            if (!this.textReaded) {
              this.steps[this.selectedStep.position].selected = true;
              // this.steps.splice(this.selectedStep.position,1);            
              // this.textReaded=true;
              this.speakText(this.selectedStep.textInstructions);
            }
            console.log("Step position: " + step.position)
          } else {
            this.textReaded = false
          }
          this.calculatingDistance = false;
        }
      }




    });
  }

  //#region Navegación
  initNavigation() {
    // this.navigationInitialized = true;
    // this.map.setPadding(this.navigationInitialized ? 320 : 0, 0, 0, 0)
    let user = {
      username: 'vvsede1',
      password: '123'
    };
    let originArray: string[] = this.origin.split(',');
    let destinationArray: string[] = this.destination.split(',');

    // this.latitude = parseFloat(originArray[0]),
    // this.longitude = parseFloat(originArray[1])

    this.authService.login(user).subscribe(result => {
      console.log(result);
      this.authService.saveToken(result);

      /**
       * Para generar la ruta se toma en cuenta lo siguente
       * La posición actual como el origen de la ruta
       * EL origen del pedido como una Waypoint, el primero
       * El destino del pedido como el destino de la ruta
       */
      let wpt = [];
      wpt.push({latitude: parseFloat(originArray[0]),longitude: parseFloat(originArray[1])})
      let coord = {
        // origin: {
        //   latitude: parseFloat(originArray[0]),
        //   longitude: parseFloat(originArray[1])
        // },
        origin: {
          latitude: this.latitude,
          longitude: this.longitude
        },
        destination: {
          latitude: parseFloat(destinationArray[0]),
          longitude: parseFloat(destinationArray[1])
        },
        waypoints: wpt
      }
      this.directionsApiService.getDirections(coord).subscribe((response: any) => {
        console.log(response)
        //Renderizamos la ruta
        var path = response['overview_path'];
        let options: PolylineOptions = {
          points: path,
          color: '#232C49',
          width: 8,
          geodesic: true,
          clickable: true,
        };

        this.routePolyline = this.map.addPolylineSync(options);
        // this.positionMarker.setPosition({ lat: this.latitude, lng: this.longitude });
        // this.map.animateCamera({
        //   duration: 2000,
        //   target: {
        //     lat: this.latitude,
        //     lng: this.longitude
        //   },
        // });
        this.getSteps(response);
        // this.updateMarker();
        this.navigationInitialized = true;
        // this.backgroundTrackingService.StartBackgroundTracking();
      });
    },error=>{
      alert("Ha ocurrido un error en la autenticación")
    });
    //#region Inclinación del mapa
    /*    
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
    */
    //#endregion

  }

  stopNavigation() {
    this.routePolyline.remove();
    this.navigationInitialized = false;
    this.map.setPadding(this.navigationInitialized ? 0 : 0, 0, 0, 0)
    this.positionMarker.setRotation(this.magneticHeading);

    //#region Restaurar estado del mapa inicial
    /*
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
      });
      */
    //#endregion
  }
  //#endregion

  //#region Utilidades
  /**
   * Lee el texto ingresado
   * @param text Texo a leer
   */
  speakText(text: string) {
    this.tts.speak({
      text,
      locale: 'es-ES'
    })
      .then(() => this.textReaded = true)
      .catch((reason: any) => this.textReaded = true);
  }

  /**
   * Calcúla la distancia entre 2 coordenadas geográficas
   * @param lat1 
   * @param lon1 
   * @param lat2 
   * @param lon2 
   * @returns 
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

  rad(x) {
    return x * Math.PI / 180;
  }
  //#endregion

  //#region Deslizamiento suave de marcador 

  /**
   * Solución obtenida en https://programacion.net/articulo/como_mover_de_manera_sutil_y_suave_un_marcador_en_google_maps_utilizando_javascript_1891
   * @param new_latitude Nueva latitud
   * @param new_longitude Nuevla longitud
   */
  transition(new_latitude: number, new_longitude: number) {
    this.i = 0;
    this.deltaLat = (new_latitude - this.latitude) / this.numDeltas;
    this.deltaLng = (new_longitude - this.longitude) / this.numDeltas;
    this.map.animateCamera({
      duration: 0,
      target: { lat: this.latitude, lng: this.longitude }
    });
    this.moveMarker();

  }

  moveMarker() {
    this.latitude += this.deltaLat;
    this.longitude += this.deltaLng;
    this.positionMarker.setPosition({ lat: this.latitude, lng: this.longitude });
    // this.positionMarker.setRotation(this.navigationInitialized ? 0 : this.magneticHeading);
    this.positionMarker.setRotation(this.magneticHeading);
    if (this.i != this.numDeltas) {
      this.i++;
      setTimeout(() => {
        this.moveMarker();
      }, this.delay);
    }
  }
  //#endregion
}
