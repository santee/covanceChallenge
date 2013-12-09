'use strict';

angular
  .module('dataProvider', [])
  .factory('clusteredData', ['$q', '$log', '$http','ClusterNode', function($q, $log, $http, ClusterNode){
    var clusters = $http.get('/api/clusters');
    var d = $q.defer();

    var processData = function ( response ) {
      $log.info('Clusters loaded');

      var cluster = new ClusterNode(response.data);
      d.resolve(cluster);
    };

    var processError = function( error) {
      $log.error(error);
      d.reject(error);
    };

    clusters.then(processData, processError );

    return d.promise;
  }])
  .factory('ClusterNode', function() {

    function ClusterNodeViewModel(treeData) {
      var self = this;
      self.id = treeData.id;
      self.selected = false;

      self.items = treeData.items;
      self.children = _.map(treeData.children, function(child) {
        return new ClusterNodeViewModel(child);
      });

      self.getAllItems = function() {
        return _.reduce(self.children, function(memo, child) {
          return _.union(memo, child.getAllItems());
        }, self.items);
      };
    }

    return ClusterNodeViewModel;
  });
