'use strict';

var irisDataSet = require('../irisFlowerDataSet');
var clusterizer = require('../clusterizer.js');
var distances = require('../distances.js');

exports.clusters = function(req, res) {

  var data = irisDataSet.data;
  //var clusters = clusterizer.hieararhicalKMeans(data,  );
  //var clusters = clusterizer.kMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder, 2);
  var clusters = clusterizer.hieararhicalKMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder);

  res.json(clusters);
};