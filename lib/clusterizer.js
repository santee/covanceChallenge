'use strict';

var _ = require('underscore');

function findCentroid(clusterElems, centroidFinder) {
  return centroidFinder(clusterElems);
}

var kMeans = function (data, distanceMetric, centroidFinder, k) {

  if (k <= 0) {
    throw 'k must be positive (k-means)';
  }

  var clusters;
  var assignmentsMade = false;

  function recalculateCentroids() {
    _.each(clusters, function (cluster) {
      cluster.centroid = findCentroid(cluster.elems, centroidFinder);
    });
  }

  function randomizeClusters() {
    clusters = _.chain(k).range().map(function () {
      return { elems: [], centroid: null };
    }).toArray().value();

    _.each(data, function (elem, i) {
      var index = i % k;
      clusters[index].elems.push(elem);
    });

    recalculateCentroids();
  }

  function findClosestClusterIndex(item) {
    var closestIndex = null;
    var closestDistance = null;
    _.each(clusters, function (cluster, i) {
      var distance = distanceMetric(item, cluster.centroid);
      if (closestDistance === null || distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  randomizeClusters();

  function reassign() {
    assignmentsMade = false;

    var newClusters = [];

    _.each(clusters, function (cluster, clusterIndex) {

      var elemsToRemove = [];

      _.each(cluster.elems, function (item) {
        var closestClusterIndex = findClosestClusterIndex(item);
        if (closestClusterIndex !== clusterIndex) {
          assignmentsMade = true;
          clusters[closestClusterIndex].elems.push(item);
          elemsToRemove.push(item);
        }
      });

      var newCluster = { elems: _.difference(cluster.elems, elemsToRemove) };
      newCluster.centroid = findCentroid(newCluster.elems, centroidFinder);

      newClusters.push(newCluster);
    });

    clusters = newClusters;
  }

  do {
    reassign();
  } while (assignmentsMade);

  return _.map(clusters, function (cluster) {
    return cluster.elems;
  });
};


function ClusterNode(data) {
  this.items = [];
  this.children = [];

  if (_.isArray(data)) {
    this.items.concat(data);
  }

  if (!_.isUndefined(data)) {
    this.items.push(data);
  }
}

var hieararhicalKMeans = function (data, distanceMetric, centroidFinder) {

  var k = 2;

  var findSubClusters = function (items) {
    if (items.length === k) {
      return _.map(items, function (item) {
        return ClusterNode(item);
      });
    }

    var subClusters = kMeans(data, distanceMetric, 2);

    _.each(subClusters, function (node) {
      node.children.concat(findSubClusters(node, distanceMetric));
    });

    return subClusters;
  };


  var head = new Cluster();
  head.children.concat(findSubClusters(data, distanceMetric, centroidFinder));

  return head;
};

exports.kMeans = kMeans;
exports.hieararhicalKMeans = hieararhicalKMeans;