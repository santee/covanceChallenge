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
      if (cluster.elems.length === 0) {
        return;
      }

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

    var newClusters = _.map(clusters, function (c) {
      return _.clone(c);
    });

    _.each(clusters, function (cluster, clusterIndex) {

      var elemsToRemove = [];

      _.each(cluster.elems, function (item) {
        var closestClusterIndex = findClosestClusterIndex(item);
        if (closestClusterIndex !== clusterIndex) {
          assignmentsMade = true;
          newClusters[closestClusterIndex].elems.push(item);
          elemsToRemove.push(item);
        }
      });

      var newCluster = newClusters[clusterIndex];
      newCluster.elems = _.difference(cluster.elems, elemsToRemove);
      newCluster.centroid = findCentroid(newCluster.elems, centroidFinder);
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


function ClusterNode(id, data) {
  this.id = id;
  this.items = [];
  this.children = [];
  var self = this;

  if (_.isArray(data)) {
    this.items.concat(data);
  }

  if (!_.isUndefined(data)) {
    this.items.push(data);
  }

  this.size = function () {
    return self.items.length + _.reduce(self.children, function (memo, child) {
      return memo + child.size();
    }, 0);
  };
}


var hieararhicalKMeans = function (data, distanceMetric, centroidFinder) {

  var k = 2;

  var id = 0;
  var head = new ClusterNode(id);
  head.items = data;

  //this function uses loop instead of recursion because we don't want to face stack overflow
  var clustersToProcess = [head];

  while (clustersToProcess.length !== 0) {

    //process items
    var newClustersToProcess = [];

    _.each(clustersToProcess, function (cluster) {
      //calculate sub clusters
      var subClusters = kMeans(cluster.items, distanceMetric, centroidFinder, k);

      //protection against equal elements

      subClusters = _.filter(subClusters, function (subCluster) {
        return subCluster.length !== 0;
      });

      if (subClusters.length === 1) {
        return;
      }


      //calculate clusters

      _.each(subClusters, function (subCluster) {
        id++;

        var node = new ClusterNode(id);
        node.items = subCluster;
        cluster.children.push(node);

        if (node.items.length !== 1) {
          newClustersToProcess.push(node);
        }
      });

      cluster.items = [];
      if (cluster.children.length === 1) { //if only have one child, move child's items and delete child
        cluster.items = cluster.children[0].items;
        cluster.children = [];
      }
    });

    clustersToProcess = newClustersToProcess;
  }

  //findSubClusters(data, head);

  return head;
};

exports.kMeans = kMeans;
exports.hieararhicalKMeans = hieararhicalKMeans;