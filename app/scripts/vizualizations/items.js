'use strict';

angular.module('items', ['dataProvider'])
  .controller('clustersListCtrl', ['$scope', 'clusteredData', function ($scope, clusteredData) {

    $scope.allItems = [];
    $scope.cluster = {};

    clusteredData.then( function(cluster){
        $scope.allItems = cluster.getAllItems();
        $scope.cluster = cluster;
      }
    );
  }]);
