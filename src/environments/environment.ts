// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  APP_ID: 'fe340011-d818-4750-b84d-f5456674a714',
  APP_ID_QLIK: '"y6b2per1608308687294"',
  QLIK_CONFIG: {
    host: "clouddashboards-stg.calix.com",
    isSecure: true,
    port: 443,
    prefix: "/ticket/"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
