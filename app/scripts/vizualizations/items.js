'use strict';

angular.module('items', ['dataProvider'])
  .controller('clustersListCtrl', ['$scope', 'clusteredData', 'itemsSelectionService', function ($scope, clusteredData, itemsSelectionService) {

    $scope.allItems = [];
    $scope.cluster = {};
    $scope.commonTextProperties = [];
    $scope.commonNumericProperties = [];
    $scope.itemClick = function (item) {
      itemsSelectionService.currentSelector = itemsSelectionService.Selectors.ITEMS;
      item.toggleSelect();
    };

    clusteredData.then(function(cluster) {
        $scope.allItems = cluster.getAllItems();
        $scope.cluster = cluster;
        $scope.commonTextProperties = cluster.getCommonTextProperties();
        $scope.commonNumericProperties = cluster.getCommonNumericProperties();
      }
    );
  }]);
