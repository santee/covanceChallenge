'use strict';

var distances = require('../lib/distances.js');

describe('Distances: euclidean distance', function () {

  it('should calculate distance between simple objects', function () {

    var a = { x : 0, y : 3 };
    var b = { x : 0, y : 1 };

    var distance = distances.euclideanDistance(a, b);
    expect(distance).toBe(2);
  });


  it('should work if string properties are presented in object', function () {

    var a = { x : 0, y : 3, text: 'test' };
    var b = { x : 0, y : 1, text2: 'test3' };

    var distance = distances.euclideanDistance(a, b);
    expect(distance).toBe(2);
  });


});
