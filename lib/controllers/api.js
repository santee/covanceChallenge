'use strict';

var irisDataSet = require('../irisFlowerDataSet');
var clusterizer = require('../clusterizer.js');
var distances = require('../distances.js');
var _ = require('underscore');

var IRIS_DEFAULT = 'Iris default';
var IRIS_3000 = 'Iris randomized 3000pts';
var IRIS_15000 = 'Iris randomized 15000pts';

var dataSetNames = [
  IRIS_DEFAULT,
  IRIS_3000,
  IRIS_15000
];



var dataSets = {};

dataSets[IRIS_DEFAULT] = irisDataSet.data;
dataSets[IRIS_3000] = irisDataSet.data1500;
dataSets[IRIS_15000] = irisDataSet.data15000;



exports.dataSetNames = function(req, res) {
  res.json( dataSetNames );
};

var getDataSetName = function(query) {

  if (!query.hasOwnProperty('setName')) {
    console.log('Query does not contain setName property. Using default');
    return dataSetNames[0];
  }

  var reqName = query.setName;

  if (!_.contains(dataSetNames, reqName)) {
    throw 'Cannot find specified dataset';
  }

  return reqName;
};

var getDataSet = function(name) {
  if (dataSets.hasOwnProperty(name)) {
    return dataSets[name];
  } else {
    throw 'Cannot find specified dataSet';
  }
};

//cached clustered data
var clusteredDataSets = {};

var getClustered = function(name) {

  if (clusteredDataSets.hasOwnProperty(name)) {
    return clusteredDataSets[name];
  }
  console.log('preparing data');
  var dataSet = getDataSet(name);
  clusteredDataSets[name] = clusterizer.hieararhicalKMeans(dataSet, distances.euclideanDistance, distances.averageCoordinatesFinder);
  console.log('data clustered');
  return clusteredDataSets[name];
};

exports.data = function(req, res) {
  var dataSetName = getDataSetName(req.query);
  res.json(getDataSet(dataSetName));
};

exports.clusters = function(req, res) {

  var name = getDataSetName(req.query);
  var clustered = getClustered(  name );

  res.json(clustered);

};