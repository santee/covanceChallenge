'use strict';

angular.module('dataProvider')
  .service('itemsSelectionService', ['$rootScope', '$document', function($rootScope) {

    var scope = {};

    scope.selectedItems = [];
    scope.selectedCluster = null;
    scope.Selectors = {
      CLUSTER: 0,
      ITEMS: 1
    };

    scope.currentSelector = scope.Selectors.CLUSTER;


    //see http://www.kaizou.org/2010/03/generating-custom-javascript-events/ for more info
    var clusterSelectedEvent = document.createEvent('Event');
    clusterSelectedEvent.initEvent('clusterSelectionChanged', true, true);

    scope.onClusterSelectionChanged = function(callback) {
      document.addEventListener('clusterSelectionChanged', callback, false);
    };

    scope.raiseClusterSelectionChanged = function(cluster) {
      clusterSelectedEvent.cluster = cluster;
      document.dispatchEvent(clusterSelectedEvent);
    };


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
        scope.selectedItems = cluster.getAllItems();
      }

      scope.currentSelector = scope.Selectors.CLUSTER;
    };

    return scope;
  }]);