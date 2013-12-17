'use strict';

angular.module('covanceChallengeApp')
  .controller('NavigationCtrl', ['$scope', '$location', '$log', 'datasetList', function ($scope, $location, $log, datasetList) {

    $scope.datasets = [];

    $scope.dataset = $location.search().setName;
    $log.info('dataset ' + $scope.dataset);

    datasetList.then(function (datasets) {
      $scope.datasets = datasets.data;
      if (!$scope.dataset) {
        $scope.dataset = $scope.datasets[0];
        $location.search('setName', $scope.dataset);
      }
    });

  }]);
