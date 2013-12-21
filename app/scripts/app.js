'use strict';

angular.module('covanceChallengeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'dataProvider',
  'radial',
  'polygonRadial',
  'trellis',
  'items'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
