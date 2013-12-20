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

  .service('d3PolygonRadialLink', ['$q', 'd3', 'clusteredData', '$rootScope', 'itemsSelectionService', 'infoBoxLoader', 'initializeArea', 'PartitionManager', 'Painter',
    function ($q, d3, clusteredData, $rootScope, itemsSelectionService, infoBoxLoader, initializeArea, PartitionManager, Painter ) {
      return function (scope, element) {

        scope.enableFisheye = true;

        initializeArea(scope, element);

        var infoBoxLoading = infoBoxLoader(scope, element);

        $q.all(clusteredData, infoBoxLoading).then(function (cluster, infobox) {
          scope.cluster = cluster;
          scope.infobox = infobox;
          var partitionManager = new PartitionManager(scope, scope.cluster);
          var painter = new Painter(scope, partitionManager.getNodes());
          painter.render();
        });
      };
    }])

  .service('initializeArea', ['d3',
    function (d3) {
      return function (scope, element) {
        scope.width = d3.select(element[0]).node().offsetWidth;
        scope.height = scope.width;
        scope.center = { x: scope.width / 2, y: scope.height / 2 };
        scope.radius = Math.min(scope.width, scope.height) / 2.2;

        scope.svg = d3.select(element[0])
          .append('svg')
          .style('height', scope.height + 'px')
          .style('width', '100%');

        scope.area = scope.svg.append('g')
          .attr('transform', 'translate(' + scope.width / 2 + ',' + scope.height / 2 + ')');
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
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      };
    }])
  .service('Painter', ['d3', function(d3) {
    var identity = function(d) { return d.id; };

    function Painter(scope, nodes) {

      var self = this;
//      self.repaintLeaf = function(node) {
//        scope.arcs
//          .data([node], identity)
//          .
//      };

      self.render = function(){
        var elements = scope
          .selectAll('polygon')
          .data(nodes, identity);

        elements
          .enter()
          .append('polygon')
          .attr('points', '');


        elements
          .exit()
          .remove();
      };
    }

    return Painter;
  }])
  .service('PartitionManager', ['d3', function(d3) {


    function PartitionManager(scope, cluster) {

      var self = this;

      var partitionChildren = function (d) {
        if (d.nodeDepth >= scope.displayDepth) {
          return [];
        }
        return d.nodes;
      };

      var partitionValue = function (d) {
        var value = d.totalItemsCount;
        return value;
      };

      var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, scope.radius * scope.radius])
        .children(partitionChildren)
        .value(partitionValue);

      self.getNodes = function() {
        return partition.nodes(cluster);
      };

      return partition;
    }

    return PartitionManager;
  }]);