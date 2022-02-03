// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  config:{
    host:'https://backend-dev.mivolco.com/',
    // host:'http://192.168.1.9:8080/',
    token_name:'token'
  },
  mapbox: {
		accessToken: 'pk.eyJ1IjoiemVpdHpuMiIsImEiOiJja3RsdnlqbW8xenBrMnFubWp2azhmeGVhIn0.6SLmgUbqiGEN6NOPK04JHQ'
	}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
