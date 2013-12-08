'use strict';

var irisDataSet = require('../irisFlowerDataSet');

exports.clusters = function(req, res) {
  res.json(irisDataSet.data);
};