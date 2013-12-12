'use strict';

angular.module('dataProvider')
  .service('itemsSelectionService', ['$rootScope', function($rootScope) {

    var scope = {};

    scope.selectedItems = [];
    scope.selectedCluster = null;
    scope.Selectors = {
      CLUSTER: 0,
      ITEMS: 1
    };

    scope.currentSelector = scope.Selectors.CLUSTER;

    $rootScope.$watch(
      function() {
        return scope.currentSelector;
      },
      function(newSelector) {
        if (newSelector !== scope.Selectors.CLUSTER && scope.selectedCluster !== null) {
          scope.selectedCluster.select(false);
        }
      }
    );

    scope.deselectAll = function() {
      _.each(scope.selectedItems, function(item){
        item.select(false);
      });

      scope.selectedItems = [];

      if (scope.selectedCluster !== null) {
        scope.selectedCluster.select(false);
      }

      scope.selectedCluster = null;
    };

    scope.toggleClusterSelection = function(cluster) {
      var newSelectionStatus = !cluster.isSelected();

      if (cluster.isSelected() && cluster !== scope.selectedCluster) {
        newSelectionStatus = true;
      }

      scope.deselectAll();

      if (cluster !== scope.selectedCluster) {
        cluster.select(newSelectionStatus);
      }

      if (cluster.isSelected()){
        scope.selectedCluster = cluster;
      }

      scope.currentSelector = scope.Selectors.CLUSTER;
    };

    return scope;
  }]);