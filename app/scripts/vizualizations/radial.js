'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['$compile', '$http', '$q', 'd3', 'clusteredData', '$rootScope', 'itemsSelectionService', 'radialLens',
    function ($compile, $http, $q, d3, clusteredData, $rootScope, itemsSelectionService, RadialLens) {

      return {
        restrict: 'EA',
        scope: {
          displayDepth: '=',
          useLens: '='
        },
        link: function (scope, element) {

          scope.useAnimation = !scope.useLens;

          var selectionAnimationDuration = 300;
          var appearanceAnimationDuration = 1000;

          var selectedColor = 'yellow';
          var selectedStroke = '#888';
          var defaultStroke = '#888';
          var colorScale = d3.scale.category20b();
          var unselectedOpacity = 1;
          var selectionValueModifier = 4;

          var infoBoxDeferred = $q.defer();
          scope.infoBox = {
            element: null,
            deferred: infoBoxDeferred.promise
          };

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


          //Lens stuff
          var radius = Math.min(width, height) / 2.2;
          var lensRadius = 150;
          scope.lens = new RadialLens(element[0], 4, lensRadius, width, height);
          var zoomDiv = document.createElement('div');
          zoomDiv.height = lensRadius * 2;
          zoomDiv.width = lensRadius * 2;
          zoomDiv.style.position = 'absolute';
          element[0].appendChild(zoomDiv);

          scope.updateLens = function () {
            scope.lens.setSvg(svg[0][0]);
          };

          scope.removeLens = function () {
            if (scope.zoomedCanvas !== null) {
              $(scope.zoomedCanvas).remove();
            }
          };

          $rootScope.$watch(function () {
              return scope.useLens;
            }, function () {
              scope.useAnimation = !scope.useLens;
              zoomDiv.style.visibility = scope.useLens ? 'visible' : 'hidden';
              if (scope.useLens) {
                scope.updateLens();
              }
            }
          );

          //partitions stuff
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

          //function to generate ARCs
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


          //returns color according to selection status and parents colors
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
              });

            if (scope.useAnimation) {
              arcs = arcs
                .transition()
                .duration(selectionAnimationDuration);
            }

            scope.updateStyle(arcs);
          };

          //updates
          scope.repaint = function () {
            if (scope.useAnimation) {
              var nodes = partition.nodes;

              scope.arcs
                .data(nodes)
                .transition()
                .duration(selectionAnimationDuration)
                .attrTween('d', arcTween);
            }

            scope.updateStyle(scope.arcs);
            scope.updateLens();
          };

          scope.onClusterClick = function (d) {

            itemsSelectionService.toggleClusterSelection(d);
            scope.repaint();
            $rootScope.$apply();
          };


          scope.onMouseOver = function (pointed) {
            scope.pointedCluster = pointed;

            scope
              .arcs
              .style('stroke-width', function (d) {
                if (d === pointed || d.isDescendantOf(pointed)) {
                  return 3;
                } else {
                  return 1;
                }
              });

            $rootScope.$apply();
          };

          scope.onMouseOut = function (leftItem) {
            scope.pointedCluster = null;

            scope
              .arcs
              .filter(function (d) {
                return d === leftItem;
              })
              .style('stroke-width', function () {
                return 1;
              });

            $rootScope.$apply();
          };

          function arcTween(item) {
            var interpolate = d3.interpolate({ x: item.x0, dx: item.dx0}, item);
            return function (t) {
              var interpolated = interpolate(t);
              item.x0 = interpolated.x;
              item.dx0 = interpolated.dx;
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
              .attr('class', 'arc')
              .each(function (d) {
                //preserve values for transition
                d.x0 = d.x * (!scope.useAnimation ? 1 : 0.1 );
                d.dx0 = d.dx * (!scope.useAnimation ? 1 : 0.4);
              });

            data
              .exit()
              .remove();

            scope.arcs = area
              .selectAll('.arc');

            setTimeout(function () {

              if (scope.useAnimation) {
                scope
                  .arcs
                  .transition()
                  .duration(appearanceAnimationDuration)
                  .ease('linear')
                  .attrTween('d', arcTween);
              } else {
                scope.arcs
                  .attr('d', arc);
              }

              scope.updateStyle(scope.arcs);
              scope.updateLens();

            }, 100);


            scope.arcs.on('click', scope.onClusterClick);
            scope.arcs.on('mouseenter', scope.onMouseOver);
            scope.arcs.on('mouseleave', scope.onMouseOut);
            svg.on('mousemove', function () {
              var coordinates = d3.mouse(this);
              scope.tooltipX = (coordinates[0] + 20) + 'px';
              scope.tooltipY = (coordinates[1] + 10) + 'px';
              $rootScope.$apply();

              var zoomed = scope.lens.getZoomedCanvas(coordinates[0], coordinates[1]);
              scope.removeLens();

              zoomDiv.appendChild(zoomed);
              scope.zoomedCanvas = zoomed;
              zoomDiv.style.left = coordinates[0] - lensRadius / 2 - 80 + 'px';
              zoomDiv.style.top = coordinates[1] - lensRadius / 2 - 80 + 'px';
              //element.append(zoomed);
            })
              .on('mouseenter', scope.updateLens)
              .on('mouseleave', scope.removeLens);
          };

          scope.zoomedCanvas = null;

          $q.all(clusteredData, scope.infoBox.deferred)
            .then(function (cluster) {

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
    }])
  .service('radialLens', function () {

    function RadialLens(parentElement, modifier, radius, originalWidth, originalHeight) {
      var self = this;

      self.modifier = modifier || 2;
      self.parentElement = parentElement;

      self.height = originalHeight;
      self.width = originalWidth;

      self.canvas = document.createElement('canvas');

      self.parentElement.appendChild(self.canvas);

      self.canvas.width = self.width;
      self.canvas.height = self.height;
      self.canvas.style['pointer-events'] = 'none';
      self.canvas.style.height = self.height + 'px';
      self.canvas.style.width = self.width + 'px';
      self.canvas.style.visibility = 'hidden';

      self.ctx = self.canvas.getContext('2d');

      self.radius = radius || 300;

      self.setSvg = function (element) {
        var xml = (new XMLSerializer()).serializeToString(element);
        self.ctx.clearRect(0, 0, self.width, self.height);

        self.ctx.drawSvg(xml, 0, 0, self.width, self.height);
      };

      self.getZoomedCanvas = function (x, y) {

        var zoomCanvas = document.createElement('canvas');
        zoomCanvas.width = radius * 2;
        zoomCanvas.height = radius * 2;
        zoomCanvas.style.height = radius * 2 + 'px';
        zoomCanvas.style.width = radius * 2 + 'px';
        zoomCanvas.style['pointer-events'] = 'none';

        var zoomContext = zoomCanvas.getContext('2d');

        zoomContext.save();
        zoomContext.beginPath();
        zoomContext.arc(radius, radius, radius, 0, 2 * Math.PI);
        zoomContext.clip();

        zoomContext.scale(self.modifier, self.modifier);

        //adjusting coordinates...
        var sourceX = Math.max(x - radius + 110, 0);
        var sourceY = Math.max(y - radius + 110, 0);
        zoomContext.drawImage(self.canvas, sourceX, sourceY, radius * 2, radius * 2, 0, 0, radius * 2, radius * 2);
        zoomContext.restore();

        return zoomCanvas;
      };
    }

    return RadialLens;
  });
