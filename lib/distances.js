'use strict';

var _ = require('underscore');

// returns sqr( a.propertyName, b.propertyName)
// returns 0 if one or both objects do not have this property, or property value is not a number
var squaredPropDiff = function(a, b, propertyName){

  if (!a.hasOwnProperty(propertyName) || !b.hasOwnProperty(propertyName)) {
    return 0;
  }

  var aVal = Number( a[propertyName] );
  var bVal = Number( b[propertyName] );

  if (isNaN(aVal) || isNaN(bVal)) {
    return 0;
  }

  return Math.pow( aVal - bVal , 2);
};

var euclideanDistance = function(a, b) {
  var allProperties = _.union( Object.getOwnPropertyNames(a), Object.getOwnPropertyNames(b));
  var properties = _.uniq( allProperties );

  var sum = _.reduce(properties, function(acc, property) { return acc + squaredPropDiff(a, b, property); }, 0);

  return Math.sqrt( sum );
};


exports.euclideanDistance = euclideanDistance;
