'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['$compile', '$http', '$q', 'd3', 'clusteredData', '$rootScope', 'itemsSelectionService',
    function ($compile, $http, $q, d3, clusteredData, $rootScope, itemsSelectionService) {

      return {
        restrict: 'EA',
        scope: {
          displayDepth: '='
        },
        link: function (scope, element) {

          var selectionAnimationDuration = 300;
          var appearanceAnimationDuration = 1200;

          var selectedColor = 'yellow';
          var selectedStroke = '#666';
          var defaultStroke = '#888';
          var colorScale = d3.scale.category20b();
          var unselectedOpacity = 0.5;
          var selectionValueModifier = 4;

          var infoBoxDeferred = $q.defer();
          scope.infoBox = {
            element: null,
            deferred: infoBoxDeferred.promise
          };

          //var useAnimation = true;
          scope.cluster = null;
          scope.pointedCluster = null;

          itemsSelectionService.onClusterSelectionChanged(function (e) {
            if (e.cluster.items.length !== 0) {
              scope.repaintLeaf(e.cluster);
            }
          });


          var width = d3.select(element[0]).node().offsetWidth;
          var height = width;

          var svg = d3.select(element[0])
            .append('svg')
            .style('height', height + 'px')
            .style('width', '100%');

          var area = svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

          //load infobox
          var loader = $http.get('/views/partials/clusterInfo.html');
          loader.then(function (html) {
            var box = angular.element(html.data);
            element.append(box);
            $compile(box)(scope);
            scope.infoBox.element = box;
            infoBoxDeferred.resolve(box);
          });


          var radius = Math.min(width, height) / 2.2;

          var partitionChildren = function (d) {

            if (d.nodeDepth >= scope.displayDepth) {
              return [];
            }

            return d.nodes;
          };

          var partitionValue = function (d) {
            var value = d.totalItemsCount;
            if (d.isSelected()) {
              return value * selectionValueModifier;
            }
            return value;
          };

          var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, radius * radius])
            .children(partitionChildren)
            .value(partitionValue);

          area
            .selectAll('path')
            .on('mouseover', function () {
              scope.update();
            });

          var arc = d3.svg.arc()
            .startAngle(function (d) {
              return d.x;
            })
            .endAngle(function (d) {
              return d.x + d.dx;
            })
            .innerRadius(function (d) {
              return Math.sqrt(d.y * (d.nodeDepth) / (scope.displayDepth + 1));
            })
            .outerRadius(function (d) {
              return Math.sqrt((d.y + d.dy) * ( d.nodeDepth + 1) / (scope.displayDepth + 1));
            });

          //var colorBrewer = d3.interpolateLab('red', 'blue');
          //var color = colorBrewer(0.5);

          var getColor = function (item) {

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
          };


          scope.updateStyle = function (arcs) {

            var hasSelectedCluster = itemsSelectionService.selectedCluster !== null;

            arcs
              .style('opacity', function (d) {
                if (!hasSelectedCluster) {
                  return 1;
                }
                return d.isSelected() ? 1 : unselectedOpacity;
              })
              .style('fill', getColor)
              .style('stroke', function (d) {
                return d.isSelected() ? selectedStroke : defaultStroke;
              });
          };

          //repaints only one leaf, with opacity / color change
          scope.repaintLeaf = function (cluster) {
            var arcs = scope.arcs
              .filter(function (d) {
                return d.id === cluster.id;
              })
              .transition()
              .duration(selectionAnimationDuration);

            scope.updateStyle(arcs);
          };

          scope.repaint = function () {
            var nodes = partition.nodes;
            var arcs = scope.arcs
              .data(nodes)
              .transition()
              .duration(selectionAnimationDuration)
              .attrTween('d', arcTween);

            //if (itemsSelectionService.hasSelectedCluster())
//            arcs.attrTween('d', arcTween);

            scope.updateStyle(arcs);
          };

          scope.onClusterClick = function (d) {

            itemsSelectionService.toggleClusterSelection(d);
            scope.repaint();
            $rootScope.$apply();
          };

          scope.onMouseOver = function(d,e) {
            scope.pointedCluster = d;
            $rootScope.$apply();
          };

          scope.onMouseOut = function() {
            scope.pointedCluster = null;
            $rootScope.$apply();
          };

          function arcTween(item) {
            var interpolate = d3.interpolate({ x: item.x0, dx: item.dx0 /* y: item.y0, dy: item.dy0*/ }, item);
            return function (t) {
              var interpolated = interpolate(t);
              item.x0 = interpolated.x;
              item.dx0 = interpolated.dx;
              //item.y0 = interpolated.y;
              //item.dy0 = interpolated.dy;
              return arc(interpolated);
            };
          }

          scope.render = function () {

            var data = area
              .datum(scope.cluster)
              .selectAll('path')
              .data(partition.nodes, function (d) {
                return d.id;
              });

            data
              .enter()
              .append('path')
              //.attr('display', function(d) { return d.dx < 0.005 ? null : 'none'; })
              .attr('class', 'arc')
              //.attr('d', arc)
              //.attr('d', initialArc)
              .each(function (d) {
                //preserve values for transition
                d.x0 = d.x * 0.1;
                d.dx0 = d.dx * 0.4;
                //d.y0 = d.y;
                //d.dy0 = d.dy * 0.4;
              });

            data
              .exit()
              .remove();


            scope.arcs = area
              .selectAll('.arc');

            setTimeout(function () {
              scope
                .arcs
                .transition()
                .duration(appearanceAnimationDuration)
                .ease('linear')
                .attrTween('d', arcTween);

              scope.updateStyle(scope.arcs);

            }, 100);


            scope.arcs.on('click', scope.onClusterClick);
            scope.arcs.on('mouseenter', scope.onMouseOver);
            scope.arcs.on('mouseleave', scope.onMouseOut);
            svg.on('mousemove', function(){
              var coordinates = d3.mouse( this );
              scope.tooltipX = (coordinates[0] + 50) + 'px';
              scope.tooltipY = (coordinates[1] + 10) + 'px';
              $rootScope.$apply();
            });
          };

          $q.all(clusteredData, scope.infoBox.deferred)
            .then(function (cluster, infoBox) {
              scope.cluster = cluster;
              scope.maxDepth = scope.cluster.findMaxDepth();
              scope.render();
              //scope.subscribe(cluster);

              $rootScope.$watch(function () {
                return Math.min(scope.displayDepth, scope.maxDepth);
              }, function () {
                scope.render();
              });

              $rootScope.$watch(
                function () {
                  return itemsSelectionService.currentSelector;
                },
                function (currentSelector) {
                  if (currentSelector !== itemsSelectionService.Selectors.CLUSTER) {
                    scope.repaint();
                  }
                }
              );
            });

        }
      };
    }]);
