import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {
  private apiUrl: string = `${environment.config.host}directionsApi`;
  constructor(private http: HttpClient) {}

   /*
  * Método para obtener la ruta en formato json a partir de la api directions de google maps
  * Author Isac Huamán Pineda
  * version 1.0
  */
   getDirections(coordinates:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/route`,coordinates);
  }
}
