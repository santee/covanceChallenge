'use strict';

angular.module('covanceChallengeApp')
  .controller('MainCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {

    $scope.displayDepth = 0;
    $scope.maxDepth = 0;
    $scope.isBusy = true;

    clusteredData.then(function (clusters) {
      $scope.clusters = clusters;
      $scope.maxDepth = clusters.findMaxDepth();
      $scope.displayDepth = Math.min(5, $scope.maxDepth);
      $scope.isBusy = false;
    });

    $scope.$watch(function () {
      return $scope.displayDepth;
    }, function (newValue) {
      $scope.displayDepth = parseInt(newValue);
      console.log($scope.displayDepth);
    });
  }]);
