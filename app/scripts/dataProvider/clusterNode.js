'use strict';

angular.module('dataProvider')
  .factory('ClusterNode', ['ItemViewModel', '$log', 'itemsSelectionService', function (ItemViewModel, $log, itemsSelectionService) {

    function ClusterNodeViewModel(treeData, parent) {
      var self = this;
      self.id = treeData.id;
      var selected = false;

      self.nodeDepth = 0;
      self.parent = null;
      if (!_.isUndefined(parent)) {
        self.parent = parent;
        self.nodeDepth = parent.nodeDepth + 1;
      }

      self.items = [];
      //self.nodes = [];

      self.items = _.map(treeData.items, function (item) {
        return new ItemViewModel(item, self);
      });

      var nonEmptyChildren = _.filter(treeData.children, function (child) {
        return child.items !== 0 || child.children !== 0;
      });


      //i have to rename it from children because d3 changes 'children' property :-\
      self.nodes = _.map(nonEmptyChildren, function (child) {
        return new ClusterNodeViewModel(child, self);
      });

      //self.nodes = self.children;

      self.getAllItems = function () {
        return _.reduce(self.nodes, function (memo, child) {
          return _.union(memo, child.getAllItems());
        }, self.items);
      };

      self.isSelected = function () {
        return selected;
      };

      self.select = function (value) {

        if (selected !== value) {
          itemsSelectionService.raiseClusterSelectionChanged(self);
//          $log.info('Cluster ' + self.id + ' selection status change to: ' + value);
        }

        selected = value;

        _.each(self.nodes, function (child) {
          child.select(value);
        });
      };

      self.toggleSelect = function () {
        self.select(!selected);
      };


      var itemsCommonProperties = function (selector) {

        var allItemsProperties = _.map(self.getAllItems(), selector);
        if (allItemsProperties.length === 0) {
          return [];
        }

        var commonProperies = _.reduce(allItemsProperties, function (memo, itemProperties) {
          return _.intersection(memo, itemProperties);
        }, allItemsProperties[0]);

        return commonProperies;
      };

      self.getCommonNumericProperties = function () {
        return itemsCommonProperties(function (item) {
          return item.numericProperties;
        });
      };

      self.getCommonTextProperties = function () {
        return itemsCommonProperties(function (item) {
          return item.textProperties;
        });
      };
    }

    return ClusterNodeViewModel;
  }]);
