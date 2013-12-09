'use strict';

var distances = require('../lib/distances.js');
var clusterizer = require('../lib/clusterizer.js');
var iris = require('../lib/irisFlowerDataSet.js');

describe('Clusters: k-means', function(){
  it('should contain same amount of elements after clustering', function() {
    var clusters = clusterizer.kMeans(iris.data, distances.euclideanDistance, distances.averageCoordinatesFinder, 2);

    expect(clusters.length).toBe(2);
    expect(clusters[0].length + clusters[1].length).toBe(iris.data.length);
  });
});

describe('Clusters: hierarhical', function() {
  it('should contain same amount of elements after clustering', function() {

    var data = iris.data;

    var clusters = clusterizer.hieararhicalKMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder);

    expect(clusters.size()).toBe(data.length);
  });
});
