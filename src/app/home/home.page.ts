import { Component } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMap, GoogleMapOptions, GoogleMaps, Marker, Polyline, PolylineOptions, LatLngBounds, CameraPosition, LatLng, Poly, GoogleMapsEvent } from '@ionic-native/google-maps';
import { BackgroundTrackingService } from '../services/background-tracking/background-tracking.service';
import { LocationStateService } from '../state-management/location-state.service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { AuthService } from '../services/auth.service';
import { DirectionsService } from '../services/directions.service';
import { LoadingController } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

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

  // origin: string = '6.3367287999999995,-75.55958869999999';
  // destination: string = '6.437951699999999,-75.3318156';
  origin: string = '';
  destination: string = '';

  calculatingDistance: boolean = false;

  polylinePath: LatLng[] = [];
  routePolyline: Polyline;
  routePolylineBorder: Polyline;
  outOfPolylineCount: number = 0;

  // Variables para deslizamiento suave del marcador
  numDeltas: number = 20;
  delay: number = 10; //milliseconds
  i: number = 0;
  deltaLat: number = 0;
  deltaLng: number = 0;

  //Indica si el mapa esta inclinado
  inclined: boolean = false;

  loading: any;
  followMarker: boolean = false;

  defaultZoom: number = 17;
  dismissedApp: boolean = false;//Verifica si minimizamos la app

  //Para pruebas de origen y destino
  originMarker: Marker;
  destinationMarker: Marker;
  createOrigin: boolean = true;
  createDestination: boolean = false;
  constructor(
    private diagnostic: Diagnostic,
    private geolocation: Geolocation,
    private backgroundTrackingService: BackgroundTrackingService,
    private locationStateService: LocationStateService,
    private tts: TextToSpeech,
    private authService: AuthService,
    private directionsApiService: DirectionsService,
    private loadingController: LoadingController,
    private backgroundMode: BackgroundMode,
  ) {
  }

  ionViewDidEnter() {
    this.loadMap();
  }

  async loadMap() {
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: this.defaultZoom,
      },
      controls: {
        // compass: true,
        zoom: false,
        mapToolbar: false,

      },
      styles: []
    };

    this.map = GoogleMaps.create('tracking-map', mapOptions);
    this.getLocation();

    this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((res: LatLng[]) => {
      console.log(res)
      if (this.createOrigin) {
        this.origin = res[0].lat + ',' + res[0].lng
        console.log(this.origin)
        this.originMarker = this.map.addMarkerSync({
          position: {
            lat: res[0].lat,
            lng: res[0].lng
          },
          title: 'ORIGEN',
          draggable: true
        });
        this.createOrigin = false;
        this.createDestination = true;
        this.dragMarker(this.originMarker, 'origin');
      } else {
        if (this.createDestination) {
          this.destination = res[0].lat + ',' + res[0].lng
          console.log(this.destination)
          this.destinationMarker = this.map.addMarkerSync({
            position: {
              lat: res[0].lat,
              lng: res[0].lng
            },
            title: 'DESTINO',
            draggable: true
          });
          this.createOrigin = false;
          this.createDestination = false;
          this.dragMarker(this.destinationMarker, 'destination');
        }
      }
    });

  }

  dragMarker(marker: Marker, position: string) {
    marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(res => {
      if (position == 'origin') this.origin = res[0].lat + ',' + res[0].lng
      if (position == 'destination') this.destination = res[0].lat + ',' + res[0].lng
    });
  }

  async getLocation() {
    this.loading = await this.loadingController.create({
      message: 'Obteniendo tu ubicación'
    });
    this.loading.present();

    let p = this.diagnostic.isGpsLocationEnabled();
    p.then((available) => {
      if (available) {
        this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 }).then(async (resp) => {
          this.latitude = resp.coords.latitude;
          this.longitude = resp.coords.longitude;
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
          this.goToPosition();//TODO Descomentar si se muestra la ruta
          this.updateMarker();
          this.loading.dismiss();
          // this.initNavigation();
          // await this.getRouteInfo();//TODO Descomentar para iniciar mostrando la ruta
          this.backgroundTrackingService.StartBackgroundTracking();
        }).catch((error) => {
          console.log(error)
          this.loading.dismiss();
        }).finally(() => {
          this.loading.dismiss();
        });

      } else {
        alert("Activa tu GPS");
        this.loading.dismiss();
        // this._mensaje.showAlert('Mensaje', 'Active su GPS para obtener su ubicación').then(a => {
        // this.loading.dismiss();

        // });
      }
    }).catch(error => {
      this.loading.dismiss();
    });
  }

  //#region Ruta
  async getRouteInfo(fitBounds: boolean) {
    this.loading = await this.loadingController.create({
      message: 'Obteniendo datos de la ruta'
    });
    this.loading.present();
    let user = {
      username: 'vvsede1',
      password: '123'
    };
    let originArray: string[] = this.origin.split(',');
    let destinationArray: string[] = this.destination.split(',');
    this.authService.login(user).subscribe(result => {
      console.log(result);
      this.authService.saveToken(result);

      /**
       * Para generar la ruta se toma en cuenta lo siguiente
       * La posición actual como el origen de la ruta
       * EL origen del pedido como un Waypoint, el primero
       * El destino del pedido como el destino de la ruta
       */
      let wpt = [];
      wpt.push({ latitude: parseFloat(originArray[0]), longitude: parseFloat(originArray[1]) })
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
        // var path = response['overview_path'];
        this.polylinePath = response['overview_path'];
        let borderOptions: PolylineOptions = {
          points: this.polylinePath,
          color: '#1967d2',
          width: 8,
          geodesic: true,
          clickable: true
        };
        let options: PolylineOptions = {
          points: this.polylinePath,
          color: '#669df6',
          width: 5,
          geodesic: true,
          clickable: true
        };

        if (this.routePolyline) {
          this.routePolyline.remove();
        }
        if (this.routePolylineBorder) {
          this.routePolylineBorder.remove();
        }
        this.routePolyline = this.map.addPolylineSync(borderOptions);
        this.routePolylineBorder = this.map.addPolylineSync(options);

        if (fitBounds) {
          // let bounds = new LatLngBounds();
          // this.polylinePath.forEach(element => {
          //   bounds.extend(element);
          // });  
          this.map.animateCamera({
            target: this.polylinePath,
            tilt: 0,
            duration: 1000
          });
        }


        this.formatSteps(response);
        this.outOfPolylineCount = 0;
        this.loading.dismiss();
      }, error => {
        this.loading.dismiss();
        alert("No se ha encontrado información de la ruta");
      });
    }, error => {
      this.loading.dismiss();
      alert("Ha ocurrido un error en la autenticación");
    });
  }

  verifyPositionInRoute(latitude: number, longitude: number) {
    if (this.polylinePath.length > 2) {
      console.log("qwe")
      let intoPolyline = Poly.isLocationOnEdge({
        lat: latitude,
        lng: longitude
      }, this.polylinePath);
      console.log(intoPolyline)
      if (!intoPolyline) {
        this.outOfPolylineCount++;
        if (this.outOfPolylineCount == 10) {
          this.getRouteInfo(false)
        }
      }
    }
  }
  //#endregion

  //#region Navegación
  async initNavigation() {
    // await this.getRouteInfo();
    this.goToPosition();
    this.map.setCameraZoom(this.defaultZoom);
    // this.map.setCameraTilt(70);
    this.navigationInitialized = true;

  }

  stopNavigation() {
    this.navigationInitialized = false;
    this.map.setCameraBearing(0);
    this.map.setPadding(this.navigationInitialized ? 0 : 0, 0, 0, 0)
    // this.routePolyline.remove();
    // this.positionMarker.setRotation(this.magneticHeading);

    //#region Restaurar estado inicial del mapa
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

  //#region Zoom
  /**
   * Acercamiento
   */
  zoomIn() {
    this.map.animateCameraZoomIn();
  }

  /**
   * Alejamiento
   */
  zoomOut() {
    this.map.animateCameraZoomOut();
  }
  //#endregion

  //#region Utilidades


  formatSteps(route) {
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
          text = text.split('Cra.').join('Carretera ');
          text = text.split('Calz ').join('Calzada ');
          text = text.split('Calz.').join('Calzada ');
          text = text.split('Cl.').join('Calle ');
          text = text.split('Av.').join('Avenida ');
          text = text.split('Nrte.').join('Norte ');
          text = text.split('Nte.').join('Norte ');
          text = text.split('Nrte ').join('Norte ');
          text = text.split('Nte ').join('Norte ');

          step.textInstructions = text;
          console.log(step.position + ' - ' + text)
          this.steps.push(step)
          // this.map.addMarkerSync({
          //   position: {
          //     lat: step.startLocation.lat,
          //     lng: step.startLocation.lng
          //   },
          //   title: step.textInstructions
          // });
          position++;
        });
      });
    });
    console.log(this.steps)
    // this.map.setPadding(300, 0, 0, 0);
  }

  goToPosition() {
    this.map.animateCamera({
      duration: 500,
      target: {
        lat: this.latitude,
        lng: this.longitude
      }
    });
  }
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

  initFollowMarker() {
    this.followMarker = !this.followMarker;
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

  updateMarker() {
    this.locationStateService.execChange.subscribe(data => {
      // console.log(data)
      if (this.map != null) {
        if (this.backgroundMode.isActive()) {
          console.log("Corriendo en segundo plano")
          this.dismissedApp = true;
        }
        if (!this.dismissedApp) {
          data['latitude'];
          data['longitude'];
          this.magneticHeading = data['bearing'];
          if (this.navigationInitialized) {
            this.magneticHeading = 0;
            // this.map.setCameraBearing(data['bearing']-this.magneticHeading);

            let a: CameraPosition<any> = {
              bearing: data['bearing'] - this.magneticHeading,
              target: {
                lat: this.latitude,
                lng: this.longitude
              },
              duration: 400
            };
            this.map.animateCamera(a);
            this.verifyPositionInRoute(data['latitude'], data['longitude']);
          }

          this.transition(data['latitude'], data['longitude']);
          this.checkStep(data['latitude'], data['longitude']);
        } else {
          console.log("Volvio a la app")
          this.latitude = data['latitude'];
          this.longitude = data['longitude'];
          this.magneticHeading = data['bearing'];
          if (!this.backgroundMode.isActive()) {
            this.positionMarker.setPosition({ lat: this.latitude, lng: this.longitude });
            this.updateCameraPosition(this.latitude, this.longitude)
            this.dismissedApp = false;
          }

        }
      }

    });
  }

  /**
   * Verifica la instrucción a leer
   * @param latitude Latitud
   * @param longitude Longitude
   */
  checkStep(latitude: number, longitude: number) {
    if (!this.calculatingDistance && this.navigationInitialized) {
      this.calculatingDistance = true;
      let filteredSteps = this.steps.filter(x => !x.selected);
      let step: StepItem = filteredSteps.find(x => (parseFloat(this.coordinatesDistance(x.startLocation.lat, x.startLocation.lng, latitude, longitude)) * 1000) <= 100);
      if (step != null && step !== undefined) {
        this.selectedStep = step;
        if (!this.textReaded) {
          this.steps[this.selectedStep.position].selected = true;
          this.speakText(this.selectedStep.textInstructions);
        }
        console.log("Step position: " + step.position);
      } else {
        this.textReaded = false
      }
      this.calculatingDistance = false;
    }
  }

  updateCameraPosition(latitude: number, longitude: number) {
    this.map.moveCamera({
      target: { lat: latitude, lng: longitude },
    });
  }

  /**
   * Solución obtenida en https://programacion.net/articulo/como_mover_de_manera_sutil_y_suave_un_marcador_en_google_maps_utilizando_javascript_1891
   * @param new_latitude Nueva latitud
   * @param new_longitude Nuevla longitud
   */
  async transition(new_latitude: number, new_longitude: number) {
    this.i = 0;
    this.deltaLat = (new_latitude - this.latitude) / this.numDeltas;
    this.deltaLng = (new_longitude - this.longitude) / this.numDeltas;
    // this.map.animateCamera({
    //   duration: 0,
    //   target: { lat: this.latitude, lng: this.longitude }
    // });

    this.moveMarker()
    // if(this.inclined)this.updateCameraPosition(new_latitude, new_longitude);
    // this.updateCameraPosition(new_latitude, new_longitude);
    // await Promise.all([this.updateCameraPosition(new_latitude, new_longitude), this.moveMarker()]);   

  }

  moveMarker() {
    this.latitude += this.deltaLat;
    this.longitude += this.deltaLng;
    this.positionMarker.setRotation(this.magneticHeading);
    this.positionMarker.setPosition({ lat: this.latitude, lng: this.longitude });
    // if(!this.inclined)this.updateCameraPosition(this.latitude, this.longitude);
    if (this.navigationInitialized || this.followMarker) this.updateCameraPosition(this.latitude, this.longitude);

    if (this.i != this.numDeltas) {
      this.i++;
      setTimeout(() => {
        this.moveMarker();
      }, this.delay);
    }
  }
  //#endregion

  //Prueba
  inclinar() {

    if (!this.inclined) {
      this.inclined = true;
      this.map.setPadding(290, 0, 0, 0)
      this.map.setCameraZoom(17);
      // this.map.setCameraBearing(90);
      this.map.setCameraTilt(90);
      this.positionMarker.setFlat(true);
      this.map.setCameraTarget({ lat: this.latitude, lng: this.longitude });
    } else {
      this.inclined = false;
      this.map.setPadding(0, 0, 0, 0);
      this.map.setCameraZoom(17);
      this.map.setCameraBearing(0);
      this.map.setCameraTilt(30);
      this.positionMarker.setFlat(false);
      this.map.setCameraTarget({ lat: this.latitude, lng: this.longitude });
    }


  }

  ionViewDidLeave() {
    alert("leave")
  }
  ionViewWillLeave() {
    alert("will")
  }
}
