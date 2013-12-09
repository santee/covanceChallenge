'use strict';

var _ = require('underscore');

function Cluster() {
  this.items = [];
  this.children = [];
}

function findCentroid(clusterElems, centroidFinder) {
  return centroidFinder(clusterElems);
}

var kMeans = function (data, distanceMetric, centroidFinder,  k) {

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

  function generateRandomClusters (data, k) {
    var clusters = _.range(k).map(function () {
      return { elems: [], centroid: null };
    }).toArray();

    _.each(data, function (elem, i) {
      var index = i % k;
      clusters[index].elems.push(elem);
    });

    recalculateCentroids();
  }

  function findClosestClusterIndex(item) {
    var closestIndex = null;
    var closestDistance = null;
    _.each(clusters, function(cluster, i) {
      var distance = distanceMetric(item, cluster.centroid);
      if ( closestDistance === null || distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  clusters = generateRandomClusters(data, k);

  function reassign() {

    var newClusters = [];

    _.each( clusters, function(cluster, clusterIndex) {

      var elemsToRemove = [];

      _.each(cluster.elems, function(item){
        var closestClusterIndex = findClosestClusterIndex(item);
        if (closestClusterIndex !== clusterIndex) {
          assignmentsMade = true;
          clusters[closestClusterIndex].elems.push(item);
          elemsToRemove.push(item);
        }
      });

      var newCluster = { elems: _.difference(cluster.elems, elemsToRemove) };
      newCluster.centroid = findCentroid(newCluster.elems);

      newClusters.push(newCluster);
    });

    clusters = newClusters;
  }

  do {
    reassign();
  } while (assignmentsMade);

  return _.map( clusters, function(cluster) {
    return cluster.elems;
  } );
};

var findSubClusters = function (data, distanceMetric) {
  if (data.length === 1) {
    return data;
  }

  var subClusters = kMeans(data, distanceMetric, 2);

  _.each(subClusters, function (node) {
    node.children.concat(findSubClusters(node, distanceMetric));
  });

  return subClusters;
};

var hieararhicalKMeans = function (data, distanceMetric) {
  var head = new Cluster();
  head.children.concat(findSubClusters(data, distanceMetric));

  return head;
};

exports.kMeans = kMeans;
exports.hieararhicalKMeans = hieararhicalKMeans;