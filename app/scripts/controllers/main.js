'use strict';

angular.module('covanceChallengeApp')
  .controller('MainCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {
    clusteredData.then( function(clusters) {
      $scope.clusters = clusters;
    });
  }]);
