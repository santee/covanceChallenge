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

      self.children = _.map(treeData.children, function (child) {
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
    }

    return ClusterNodeViewModel;
  }]);
