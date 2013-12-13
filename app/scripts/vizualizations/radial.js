'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3', 'clusteredData', '$rootScope', 'itemsSelectionService', function (d3, clusteredData, $rootScope, itemsSelectionService) {
    return {
      restrict: 'EA',
      scope: {},
      link: function (scope, element) {

        scope.subscribe = function (cluster) {

          $rootScope.$watch(
            function () {
              return cluster.isSelected();
            },
            function () {
              scope.updateViz(cluster);
            }
          );

          _.each(cluster.children, function (child) {
            scope.subscribe(child);
          });
        };


        clusteredData.then(function (cluster) {
          scope.cluster = cluster;
          scope.render();
          scope.subscribe(cluster);

          $rootScope.$watch(
            function() {
              return itemsSelectionService.currentSelector;
            },
            function(currentSelector) {
              if (currentSelector !== itemsSelectionService.Selectors.CLUSTER) {
                scope.repaint(true);
              }
            }

          );

        });

        var width = d3.select(element[0]).node().offsetWidth;
        var height = width;

        var svg = d3.select(element[0])
          .append('svg')
          .style('height', height + 'px')
          .style('width', '100%');

        var area = svg.append('g')
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        var radius = Math.min(width, height) / 2.2;

        var partition = d3.layout.partition()
          .sort(null)
          .size([2 * Math.PI, radius * radius])
          .children(function (d) {
            return d.children;
          })
          .value(function (d) {
            return 1;
          });

        area
          .selectAll('path')
          .on('mouseover', function () {
            scope.update();
          });

        var findMaxDepth = function (cluster, currentDepth) {
          currentDepth = currentDepth || 1;
          var depth = currentDepth;
          _.each(cluster.children, function (child) {
            var childDepth = findMaxDepth(child, currentDepth + 1);
            if (childDepth > depth) {
              depth = childDepth;
            }
          });

          return depth;
        };

        var arc = d3.svg.arc()
          .startAngle(function (d) {
            return d.x;
          })
          .endAngle(function (d) {
            return d.x + d.dx;
          })
          .innerRadius(function (d) {
            return Math.sqrt(d.y * (d.depth + 1) / scope.maxDepth);
          })
          .outerRadius(function (d) {
            return Math.sqrt((d.y + d.dy) * (d.depth + 2) / scope.maxDepth);
          });

        var color = d3.scale.category20b();

        //var colorBrewer = d3.interpolateLab('red', 'blue');
        //var color = colorBrewer(0.5);

        var getColor = function (item) {

          if (item.isSelected()) {
            return 'yellow';
          }

          var id = item.id;

          var elem = item;
          while (elem.parent !== null && elem.parent.children[0].id === elem.id) {
            id = elem.parent.id;
            elem = elem.parent;
          }

          return color(id);
        };


        scope.updateColor = function (arcs) {
          arcs
            .style('opacity', function (d) {
              return d.isSelected() ? 1 : 0.9;
            })
            .style('fill', getColor)
            .style('stroke', function (d) {
              return d.isSelected() ? '#000' : '#fff';
            });
        };

        scope.updateViz = function (cluster) {
          var arcs = scope.arcs
            .filter(function (d) {
              return d.id === cluster.id;
            })
            .transition()
            .duration(500);

          scope.updateColor(arcs);
        };

        scope.onClusterClick = function (d) {

          itemsSelectionService.toggleClusterSelection(d);
          $rootScope.$apply();
          scope.repaint();
        };

        scope.repaint = function (returnToOriginal) {

          returnToOriginal = returnToOriginal || false;

          var nodes = partition.value(function (d) {
            return (d.isSelected() && !returnToOriginal) ? 4 : 1;
          }).nodes;

          function arcTween(item) {
            var interpolate = d3.interpolate({ x: item.x0, dx: item.dx0 }, item);
            return function (t) {
              var interpolated = interpolate(t);
              item.x0 = interpolated.x;
              item.dx0 = interpolated.dx;
              return arc(interpolated);
            };
          }

          var arcs = scope.arcs
            .data(nodes)
            .transition()
            .duration(1500)
            .attrTween('d', arcTween);

          scope.updateColor(arcs);

//            .style('opacity', function (d) {
//              return d.isSelected() ? 1 : 0.9;
//            })
//            .style('fill', getColor)
//            .style('stroke', function (d) {
//              return d.isSelected() ? '#000' : '#fff';
//            });
        };

        scope.render = function () {

          scope.maxDepth = findMaxDepth(scope.cluster);

          area
            .datum(scope.cluster)
            .selectAll('path')
            .data(partition.nodes, function (d) {
              return d.id;
            })
            .enter()
            .append('path')
            //.attr('display', function(d) { return d.dx < 0.005 ? null : 'none'; })
            .attr('class', 'arc')
            .attr('d', arc)
            .style('stroke', '#fff')
            .style('fill', getColor)
            .each(function (d) {
              //preserve values for transition
              d.x0 = d.x;
              d.dx0 = d.dx;
            });


          scope.arcs = area
            .selectAll('.arc');

          scope.arcs.on('click', scope.onClusterClick);

          //specify fisheye
        };
      }
    };
  }]);
