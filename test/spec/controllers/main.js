'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('covanceChallengeApp'));

  var data = irisFlowerDataSet.data;

  var MainCtrl,
    scope,
    $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/clusters')
      .respond([
        {'sepalLength': '5.1', 'sepalWidth': '3.5', 'petalLength': '1.4', 'petalWidth': '0.1', 'species': 'I. setosa'},
        {'sepalLength': '4.9', 'sepalWidth': '3.0', 'petalLength': '1.4', 'petalWidth': '0.2', 'species': 'I. setosa'},
        {'sepalLength': '4.7', 'sepalWidth': '3.2', 'petalLength': '1.3', 'petalWidth': '0.2', 'species': 'I. setosa'},
        {'sepalLength': '4.6', 'sepalWidth': '3.1', 'petalLength': '1.5', 'petalWidth': '0.2', 'species': 'I. setosa'},
      ]);
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.clusters).toBeUndefined();
    $httpBackend.flush();
    expect(scope.clusters.length).toBe(4);
  });
});
