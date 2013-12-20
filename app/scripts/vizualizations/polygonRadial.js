'use strict';

angular.module('polygonRadial', ['dataProvider', 'd3'])
  //just an angularjs directive. Entry point for all interactions with radial control
  .directive('d3PolygonRadial', ['d3PolygonRadialLink',
    function (d3PolygonRadialLink) {

      return {
        restrict: 'EA',
        scope: {
          //variables binding
          displayDepth: '=',
          enableFisheye: '='
        },

        link: d3PolygonRadialLink
      };
    }])

  .service('d3PolygonRadialLink', ['$q', 'd3', 'clusteredData', '$rootScope', 'itemsSelectionService', 'infoBoxLoader',
    function ($q, d3, clusteredData, $rootScope, itemsSelectionService, infoBoxLoader) {
      return function (scope, element) {

        var infoBoxLoading = infoBoxLoader(scope, element);
        $q.all(clusteredData, infoBoxLoading).then(function(cluster, infobox) {
          scope.cluster = cluster;
          scope.infobox = infobox;
        });
      };
    }])

  .service('areaInitializer', ['d3',
    function(d3) {
      return function(scope, element) {

      };
    }])

  .service('infoBoxLoader', ['$compile, $http, $q',
    function ($compile, $http, $q) {
      return function (scope, element) {

        var deferred = $q.defer();

        var loader = $http.get('/views/partials/clusterInfo.html');
        loader.then(function (html) {
          var box = angular.element(html.data);
          element[0].appendChild(box);
          $compile(box)(scope);
          deferred.resolve(box);
        }, function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
      };
  }]);