'use strict';

var irisDataSet = require('../irisFlowerDataSet');
var clusterizer = require('../clusterizer.js');
var distances = require('../distances.js');

console.log('preparing data');
var data = irisDataSet.data1500;
var clustered = clusterizer.hieararhicalKMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder);
console.log('data clustered');

exports.clusters = function(req, res) {
  //var clusters = clusterizer.hieararhicalKMeans(data,  );
  //var clusters = clusterizer.kMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder, 2);
  //var clusters = clusterizer.hieararhicalKMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder);

  res.json(clustered);

  //var clusters = clusterizer.hieararhicalKMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder);

  //res.json(clusters);
};