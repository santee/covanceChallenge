'use strict';

angular
  .module('dataProvider', [])
  .factory('clusteredData', ['$q', '$log', '$http','ClusterNode', function($q, $log, $http, ClusterNode){
    var clusters = $http.get('/api/clusters');
    var d = $q.defer();

    var processData = function ( response ) {
      $log.info('Clusters loaded, generating view model...');
      var cluster = new ClusterNode(response.data);
      $log.info('View model generated');
      d.resolve(cluster);
    };

    var processError = function( error) {
      $log.error(error);
      d.reject(error);
    };

    clusters.then(processData, processError );

    return d.promise;
  }])

  .factory('ItemViewModel', function() {
    function ItemViewModel(item, cluster) {
      var self = this;

      self.cluster = cluster;

      self.isSelected = function() {
        return self.cluster.isSelected();
      };

      self.select = function(value) {
        self.cluster.select(value);
      };

      self.toggleSelect = function() {
        self.select(!self.isSelected());
      };

      var itemProperties = Object.getOwnPropertyNames(item);

      self.numericProperties = _.filter(itemProperties, function(property) {
        var value = item[property];
        return _.isNumber(value) && !_.isNaN(value);
      });

      self.textProperties = _.filter(itemProperties, function(property) {
        var value = item[property];
        return _.isString(value);
      });

      self.allProperties = _.union(self.numericProperties, self.textProperties);
      _.each(self.allProperties, function(property){
        self[property] = item[property];
      });
    }

    return ItemViewModel;
  })
  .factory('ClusterNode', ['ItemViewModel', function(ItemViewModel) {

    function ClusterNodeViewModel(treeData) {
      var self = this;
      self.id = treeData.id;
      var selected = false;

      self.items = _.map(treeData.items, function(item) {
        return new ItemViewModel(item, self);
      });

      self.children = _.map(treeData.children, function(child) {
        return new ClusterNodeViewModel(child);
      });

      self.getAllItems = function() {
        return _.reduce(self.children, function(memo, child) {
          return _.union(memo, child.getAllItems());
        }, self.items);
      };

      self.isSelected = function() {
        return selected;
      };

      self.select = function(value) {
        selected = value;

        _.each(self.children, function(child) {
          child.select(value);
        });
      };

      self.toggleSelect = function() {
        self.select(!selected);
      };
    }

    return ClusterNodeViewModel;
  }]);
