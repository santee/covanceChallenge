'use strict';

angular.module('dataProvider')
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
  });