'use strict';

angular.module('covanceChallengeApp')
  .controller('MainCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {

    $scope.maxDepth = 5;

    clusteredData.then( function(clusters) {
      $scope.clusters = clusters;
    });
  }]);
