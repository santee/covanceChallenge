'use strict';

angular.module('covanceChallengeApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/clusters').success(function(clusters) {
      $scope.clusters = clusters;
    });
  });
