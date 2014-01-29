'use strict';

angular.module('color', ['d3'])
  .service('clusterColor', ['d3', function(d3) {
    var scaleColor = d3.scale.category20b();
    this.getColor = function(clusterItem) {
      if (clusterItem.isSelected()) {
        return 'yellow';
      }

      var id = clusterItem.id;
      var node = clusterItem;
      while (node.parent !== null && node.parent.nodes[0].id === node.id) {
        id = node.parent.id;
        node = node.parent;
      }
      return scaleColor(id);
    };
  }]);