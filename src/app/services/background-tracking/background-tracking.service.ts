import { Injectable } from '@angular/core';
declare var window;

@Injectable({
  providedIn: 'root'
})
export class BackgroundTrackingService {
  private locations:any;
  constructor(
  ) { }


  StartBackgroundTracking(){
    // alert("Inicia tracking")
    window.app.backgroundGeolocation.start();
  }
  
  StopBackgroundGeolocation(){
    window.app.backgroundGeolocation.stop();
    this.locations=[];
  }


}
