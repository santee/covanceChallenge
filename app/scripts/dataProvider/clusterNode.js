'use strict';

angular.module('dataProvider')
  .factory('ClusterNode', ['ItemViewModel', function (ItemViewModel) {

    function ClusterNodeViewModel(treeData) {
      var self = this;
      self.id = treeData.id;
      var selected = false;

      self.items = _.map(treeData.items, function (item) {
        return new ItemViewModel(item, self);
      });

      var nonEmptyChildren = _.filter(treeData.children, function (child) {
        return child.items !== 0 || child.children !== 0;
      });

      self.children = _.map(nonEmptyChildren, function (child) {
        return new ClusterNodeViewModel(child);
      });

      self.getAllItems = function () {
        return _.reduce(self.children, function (memo, child) {
          return _.union(memo, child.getAllItems());
        }, self.items);
      };

      self.isSelected = function () {
        return selected;
      };

      self.select = function (value) {
        selected = value;

        _.each(self.children, function (child) {
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
