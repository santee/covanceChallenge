'use strict';

angular.module('items', ['dataProvider'])
  .controller('clustersListCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {

    $scope.allItems = [];
    $scope.cluster = {};
    $scope.commonTextProperties = [];
    $scope.commonNumericProperties = [];

    clusteredData.then( function(cluster){
        $scope.allItems = cluster.getAllItems();
        $scope.cluster = cluster;
        $scope.commonTextProperties = cluster.getCommonTextProperties();
        $scope.commonNumericProperties = cluster.getCommonNumericProperties();
      }
    );
  }]);
