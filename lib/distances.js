'use strict';

var _ = require('underscore');

// returns sqr( a.propertyName, b.propertyName)
// returns 0 if one or both objects do not have this property, or property value is not a number
var squaredPropDiff = function (a, b, propertyName) {

  if (!a.hasOwnProperty(propertyName) || !b.hasOwnProperty(propertyName)) {
    return 0;
  }

  var aVal = Number(a[propertyName]);
  var bVal = Number(b[propertyName]);

  if (isNaN(aVal) || isNaN(bVal)) {
    return 0;
  }

  return Math.pow(aVal - bVal, 2);
};

var euclideanDistance = function (a, b) {
  var allProperties = _.union(Object.getOwnPropertyNames(a), Object.getOwnPropertyNames(b));
  var properties = _.uniq(allProperties);

  var sum = _.reduce(properties, function (acc, property) {
    return acc + squaredPropDiff(a, b, property);
  }, 0);

  return Math.sqrt(sum);
};

var averageCoordinatesFinder = function (elems) {

  var allProperties = _.reduce(elems, function (properties, item) {
    var numericProperties = _.filter(Object.getOwnPropertyNames(item), function (property) {
      return !isNaN(Number(item[property]));
    });
    return _.chain(properties).union(numericProperties).uniq().value();
  }, []);

  var obj = {};

  _.each(allProperties, function(property) {
    var count = 0;
    var sum = 0;

    _.each(elems, function(item) {
      if (item.hasOwnProperty(property)) {
        var num = Number(item[property]);
        if (!isNaN(num)) {
          count++;
          sum += num;
        }
      }
    });

    obj[property] = sum / count;
  });

  return obj;
};

exports.euclideanDistance = euclideanDistance;
exports.averageCoordinatesFinder = averageCoordinatesFinder;