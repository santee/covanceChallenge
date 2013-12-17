'use strict';

angular.module('covanceChallengeApp')
  .controller('MainCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {

    $scope.displayDepth = 5;
    $scope.maxDepth = $scope.displayDepth;

    clusteredData.then(function (clusters) {
      $scope.clusters = clusters;
      $scope.maxDepth = clusters.findMaxDepth();
    });

    $scope.$watch('displayDepth', function (newValue) {
      $scope.displayDepth = parseInt(newValue);
    });
  }]);
