'use strict';

var irisDataSet = require('../irisFlowerDataSet');
var clusterizer = require('../clusterizer.js');
var distances = require('../distances.js');

exports.clusters = function(req, res) {

  var data = irisDataSet.data;
  //var clusters = clusterizer.hieararhicalKMeans(data,  );
  var clusters = clusterizer.kMeans(data, distances.euclideanDistance, distances.averageCoordinatesFinder, 2);

  res.json(clusters);
};