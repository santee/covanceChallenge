'use strict';

var _ = require('underscore');

function Cluster() {
  this.items = [];
  this.children = [];
}

var kMeans = function(data, distanceMetric, k ){
  return [ ];
};

var findSubClusters = function(data, distanceMetric) {
  if (data.length === 1) {
    return data;
  }

  var subClusters = kMeans(data, distanceMetric, 2);

  _.each(subClusters, function(node) {
    node.children.concat(  findSubClusters(node, distanceMetric) );
  });

  return subClusters;
};

var hieararhicalKMeans = function(data, distanceMetric) {
  var head = new Cluster();
  head.children.concat( findSubClusters(data, distanceMetric) );

  return head;
};

exports.kMeans = kMeans;
exports.hieararhicalKMeans = hieararhicalKMeans;