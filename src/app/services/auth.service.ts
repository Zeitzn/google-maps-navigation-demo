import { Injectable } from '@angular/core';
import {
  HttpHeaders,
  HttpClient
} from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string = `${environment.config.host}oauth/token`;
  private _token: string;
  constructor(private http: HttpClient) {

  }

  public get token(): string {
    this._token = localStorage.getItem(environment.config.token_name);
    if(this._token !=null){
      return JSON.parse(this._token);
    }
    return null;
  }

  isAuthenticated(): boolean {
    var _token = localStorage.getItem(environment.config.token_name);
    if (_token != null) {
      return true;
    }
    return false;
  }

  login(usuario: any): Observable<any> {
    const credenciales = btoa('mivolcoapp' + ':' + '789Administrador');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });
    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    params.set('app', 'customer');
    return this.http.post<any>(this.apiUrl, params.toString(), { headers: httpHeaders });
  }

  refreshToken(): Observable<any> {
    let token = this.token;
    const credenciales = btoa('mivolcoapp' + ':' + '789Administrador');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });

    let params = new URLSearchParams();
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', token['refresh_token']);
    return this.http.post<any>(this.apiUrl, params.toString(), { headers: httpHeaders });
  }


  saveToken(accessToken: any):void{
    this._token = JSON.stringify(accessToken);
    localStorage.setItem(environment.config.token_name,this._token);
  }

}
