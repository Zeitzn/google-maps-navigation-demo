import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, concatMap, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private _serviceAuth: AuthService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = localStorage.getItem(environment.config.token_name);
    let request = req;

    if (token != null) {
      let tok = JSON.parse(token)

      if (!request.url.includes('oauth/token')) {
        request = req.clone({
          setHeaders: {
            authorization: `Bearer ${tok['access_token']}`
          }
        });
      }

    }

    return next.handle(request).pipe(
      timeout(request.url.includes('cloudinary.com') ? 60000 : 60000),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          alert("No autorizado")
          // if (!request.url.includes('oauth/token')) {
          //   return this._serviceAuth.refreshToken().pipe(concatMap((resp: any) => {
          //     let _token = this._serviceAuth.token;
          //     _token['refresh_token'] = resp['refresh_token']
          //     _token['access_token'] = resp['access_token']
          //     this._serviceAuth.saveToken(_token);
          //     request = req.clone({
          //       setHeaders: {
          //         authorization: `Bearer ${resp['access_token']}`
          //       }
          //     });
          //     return next.handle(request);
          //   }));
          // } else {
          //   this._mensaje.showAlert('Alerta', 'El usuario o clave son incorrectas');
          // }
        } else {
          alert("Error desconocido")
          // if (request.url.includes('getWeather')) {
          //   console.log(err)
          //   if (err.name.includes("TimeoutError")) {
          //     this._mensaje.showAlert('Alerta', "El servidor ha tardado demasiado en responder, inténtalo nuevamente")
          //   }
          // }
          // console.log(request.url)
        }
        return throwError(err);

      })
    );
  }

}
