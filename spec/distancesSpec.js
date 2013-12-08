'use strict';

var distances = require('../lib/distances.js');

describe('Distances: euclidean', function () {

  it('should calculate distance between simple objects', function () {

    var a = { x : 0, y : 3 };
    var b = { x : 0, y : 1 };

    var distance = distances.euclideanDistance(a, b);
    expect(distance).toBe(2);
  });
});
