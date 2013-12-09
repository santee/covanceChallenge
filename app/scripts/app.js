'use strict';

angular.module('covanceChallengeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'dataProvider'
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
