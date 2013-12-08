'use strict';

var irisDataSet = require('../irisFlowerDataSet');
var clusterizer = require('../clusterizer.js');

exports.clusters = function(req, res) {

  var data = irisDataSet.data;
  var clusters = clusterizer.hieararhicalKMeans(data, function(a, b) { return 0; } );

  res.json(clusters);
};