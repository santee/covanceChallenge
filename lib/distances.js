'use strict';

var _ = require('underscore');

// returns sqr( a.propertyName, b.propertyName)
// returns 0 if one or both objects do not have this property, or property value is not a number
var squaredPropDiff = function(a, b, propertyName){
  if (!a.hasOwnProperty(propertyName) || !b.hasOwnProperty(propertyName)) {
    return 0;
  }

  var aVal = Number( a.getPropertyValue(propertyName) );
  var bVal = Number( b.getPropertyValue(propertyName) );

  if (isNaN(aVal) || isNaN(bVal)) {
    return 0;
  }

  return square( aVal - bVal );
};

var euclideanDistance = function(a, b) {
  var properties = _.uniq( _.union( a.prototype.getOwnPropertyNames, b.prototype.getOwnPropertyNames) );

  for (var property in properties){

    a.hasOwnProperty(property);
  }
};


exports.euclideanDistance = euclideanDistance;
