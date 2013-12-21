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
        scope.pointedCluster = null;

        initializeArea(scope, element);

        var infoBoxLoading = infoBoxLoader(scope, element);

        $q.all(clusteredData, infoBoxLoading).then(function (cluster, infobox) {
          scope.cluster = cluster;
          scope.infobox = infobox;
          var partitionManager = new PartitionManager(scope, scope.cluster);
          var painter = new Painter(scope, partitionManager.getNodes());
          //painter.render();

          $rootScope.$watch(function() {
            return scope.displayDepth;
          }, function() {
            painter.render(partitionManager.getNodes());
          });

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
  .service('infoBoxLoader', ['$compile', '$http', '$q',
    function ($compile, $http, $q) {
      return function (scope, element) {

        var deferred = $q.defer();

        var loader = $http.get('/views/partials/clusterInfo.html');
        loader.then(function (html) {
          var box = angular.element(html.data);
          $compile(box)(scope);
          element.append(box);
          deferred.resolve(box);
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      };
    }])
  .service('Painter', ['$rootScope', 'itemsSelectionService', function($rootScope, itemsSelectionService) {
    var identity = function(d) { return d.id; };

    function Painter(scope) {
      var self = this;

      var selectedColor = 'yellow';
      var selectedStroke = '#888';
      var defaultStroke = '#888';
      var colorScale = d3.scale.category20b();

      function getColor(item) {
        if (item.isSelected()) {
          return selectedColor;
        }

        var id = item.id;

        var elem = item;
        while (elem.parent !== null && elem.parent.nodes[0].id === elem.id) {
          id = elem.parent.id;
          elem = elem.parent;
        }
        return colorScale(id);
      }

      function getStrokeColor(item) {
        return item.isSelected() ? selectedStroke : defaultStroke;
      }

      function getStrokeWidth(item) {
        return item.dx >= 0.01 ? 1 : 0;
      }

      self.drawnPoints = [];

      function getInnerRadius(node) {
        return Math.sqrt(node.y * (node.nodeDepth) / (scope.displayDepth + 1));
      }

      function getOuterRadius(node) {
        return Math.sqrt((node.y + node.dy) * ( node.nodeDepth + 1) / (scope.displayDepth + 1));
      }

      function getPoints(node) {
        var gap = 0.1; //5.73 degrees

        //calculate anchor angles
        var endAngle = node.x + node.dx;
        var currentAngle = node.x;
        var angles = [currentAngle];
        do {
          var angleLeft = endAngle - currentAngle;
          currentAngle += Math.min( gap, angleLeft);
          angles.push(currentAngle);

        } while(currentAngle < endAngle);

        function calculatePoints(radius, angles) {
          if (radius === 0) {
            return [];
          }
          return angles.map(function(angle) {
            return {
              x : radius * Math.cos(angle) + scope.radius,
              y : radius * Math.sin(angle) + scope.radius
            };
          });
        }

        //go through inner radius
        var innerRadius = getInnerRadius(node);
        var innerPoints = calculatePoints(innerRadius, angles);

        //go through outer radius
        var outerRadius = getOuterRadius(node);
        var outerPoints = calculatePoints(outerRadius, angles.reverse());

        var points = innerPoints.concat(outerPoints);
        self.drawnPoints[node.id] = points;
        return points;
      }

      function getPointsStringed(node) {
        var points = getPoints(node);
        return points.map(function(d) { return d.x + ',' + d.y; }).join(' ');
      }

      function drawPolygons(polygons) {
        polygons
          .style('fill', getColor)
          .style('stroke', getStrokeColor)
          .style('stroke-width', getStrokeWidth)
          .attr('points', getPointsStringed);
      }

      //repaints only selected leafs
      self.repaintLeafs = function(elements) {
        scope
          .svg
          .selectAll('polygon')
          .filter(function(d) {
            return _.contains(elements, d);
          })
          .call(drawPolygons);
      };



      self.render = function(nodes){

        function onClusterClick(node) {
          itemsSelectionService.toggleClusterSelection(node);
          self.render(nodes);
          $rootScope.$apply();
        }

        var elements =
          scope
          .svg
          .selectAll('polygon')
          .data(nodes, identity);

        elements
          .enter()
          .append('polygon')
          .attr('class', 'arc')
          .call(drawPolygons)
          .on('click', onClusterClick);

        elements
          .exit()
          .remove();

        elements
          .call(drawPolygons);
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
    }

    return PartitionManager;
  }]);