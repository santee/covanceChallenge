'use strict';

angular.module('trellis', ['dataProvider', 'd3'])
  .directive('d3Trellis', ['$q', '$rootScope', 'd3', 'itemPropertiesSelector', 'itemsSelectionService', 'clusteredData',
    function ($q, $rootScope, d3, itemPropertiesSelector, itemsSelectionService, clusteredData) {
      return {
        restrict: 'EA',
        scope: {
        },
        link: function (scope, element) {

          $q.all([itemPropertiesSelector.deferred, clusteredData]).then(function (values) {

            var properties = values[0];
            var cluster = values[1];

            scope.selectedNumericProperties = properties.selectedNumericProperties;
            scope.selectedTextProperties = properties.selectedTextProperties;

            scope.clusterItems = cluster.getAllItems();
            scope.render();

            _.each(scope.clusterItems, function (item) {
              $rootScope.$watch(function () {
                return item.isSelected();
              }, function (isSelected) {

                if (isSelected) {
                  itemsSelectionService.selectedItems.push(item);
                } else {
                  itemsSelectionService.selectedItems = _.without(itemsSelectionService.selectedItems, item);
                }

                scope.circles
                  .filter(function (d) {
                    return d === item;
                  })
                  .classed('faded', !isSelected)
                  .classed('selected', isSelected);
              });
            });

            $rootScope.$watch(function () {
              return itemsSelectionService.selectedItems.length;
            }, function (selectedItemsCount, oldSelectedItemsCount) {
              if (selectedItemsCount === 0) {
                //clean selection
                scope.circles
                  .classed('faded', false)
                  .classed('selected', false);
              }
              if (oldSelectedItemsCount === 0) {
                scope.circles
                  .filter(function (d) {
                    return !d.isSelected();
                  })
                  .classed('faded', true)
                  .classed('selected', false);
              }
            });
          });


          var width = d3.select(element[0]).node().offsetWidth;
          var height = width;

          var svg = d3.select(element[0])
            .append('svg')
            .style('height', height + 'px')
            .style('width', '100%')
            .attr('preserveAspectRatio', 'xMinYMin slice');

          //specify same height as width
          //d3.select(element[0]).node().offsetHeight = height;

          var colors = d3.scale.category10();

          var defaultRadius = 3;

          var getColor = function (dataItem) {
            var textProperties = scope.selectedTextProperties;
            var value = _.reduce(textProperties, function (memo, property) {
              return memo + '_' + dataItem[property];
            }, '');

            return colors(value);
          };

          scope.render = function () {
            var numericProperties = scope.selectedNumericProperties;

            svg.selectAll('*').remove();

            var plotsScale = d3.scale.ordinal().domain(d3.range(numericProperties.length)).rangeRoundBands([0, width], 0.3, 0.2);

            var brushCell = null;

            var currentBrush = null;

            var turnOffBrush = function () {
              if (!_.isNull(brushCell) && !_.isNull(currentBrush)) {
                d3.select(brushCell).call(currentBrush.clear());
              }
            };

            $rootScope.$watch(function() {
              return itemsSelectionService.currentSelector;
            }, function(newSelectorName) {
              if (newSelectorName !== itemsSelectionService.Selectors.ITEMS) {
                turnOffBrush();
              }
            });


            var onCircleClick = function (point) {
              var ctrlKey = d3.event.ctrlKey;

              if (ctrlKey) {
                //allow multi choice
                point.toggleSelect();
              }
              else if (itemsSelectionService.selectedItems.length === 1 && point.isSelected()) {
                point.toggleSelect();
              }
              else {
                _.each(itemsSelectionService.selectedItems, function (item) {
                  item.select(false);
                });

                turnOffBrush();

                point.select(true);
              }

              scope.update();
            };

            var onCircleMouseOver = function () {
              if (!d3.event.shiftKey) {
                d3.select(this).attr('r', defaultRadius * 2);
                d3.select(this).classed('hover', true);
              }
            };

            var onCircleMouseOut = function () {
              d3.select(this).attr('r', defaultRadius);
              d3.select(this).classed('hover', false);
            };

            scope.update = function () {
              $rootScope.$apply();
            };

            scope.cells = [];

            _.each(numericProperties, function (yProperty, row) {

              _.each(numericProperties, function (xProperty, column) {

                var plotWidth = plotsScale.rangeBand();
                var plotHeight = plotsScale.rangeBand();
                var plotX = plotsScale(column);
                var plotY = plotsScale(row);

                var data = scope.clusterItems;

                var xLimits = d3.extent(data, function (item) {
                  return item[xProperty];
                });

                var yLimits = d3.extent(data, function (item) {
                  return item[yProperty];
                });

                //set up scales
                var xScale = d3.scale.linear()
                  .domain(xLimits)
                  .range([0, plotWidth])
                  .nice();

                var yScale = d3.scale.linear()
                  .domain(yLimits)
                  .range([plotHeight, 0])
                  .nice();

                //set up axis

                var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient('bottom')
                  .ticks(4)
                  .tickSize(-plotWidth, 0, 0);

                var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left')
                  .ticks(4)
                  .tickSize(-plotHeight, 0, 0);

                var cell = svg.append('g')
                  .attr('transform', 'translate(' + plotX + ',' + plotY + ')');

                scope.cells.push(cell);


                cell.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + 0 + ',' + plotHeight + ')')
                  .call(xAxis);

                cell.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + 0 + ', ' + 0 + ')')
                  .call(yAxis);


                var brushStart = function () {
                  itemsSelectionService.currentSelector = itemsSelectionService.Selectors.ITEMS;

                  if (brushCell !== this) {
                    currentBrush = brush;
                    turnOffBrush();
                    brushCell = this;
                  }
                  scope.update();
                };

                var brushMove = function () {
                  var e = brush.extent();
                  var elementsChanged = false;

                  _.each(scope.clusterItems, function (item) {
                    var outOfSelection = e[0][0] > item[xProperty] || item[xProperty] > e[1][0] ||
                      e[0][1] > item[yProperty] || item[yProperty] > e[1][1];

                    if (item.isSelected() === outOfSelection) {
                      elementsChanged = true;
                      item.select(!outOfSelection);
                    }
                  });

                  if (elementsChanged) {
                    scope.update();
                  }

                };

                var brushEnd = function () {
                  if (brush.empty()) {
                    _.each(scope.clusterItems, function (item) {
                      item.select(false);
                    });
                  }
                  scope.update();
                };

                var brush = d3.svg.brush()
                  .x(xScale)
                  .y(yScale)
                  .on('brushstart', brushStart)
                  .on('brush', brushMove)
                  .on('brushend', brushEnd);

                cell.append('g')
                  .attr('class', 'area')
                  .call(brush);

                var enterData = cell.selectAll('circle').data(scope.clusterItems).enter();
                enterData
                  .append('circle')
                  .attr('cx', function (d) {
                    return xScale(d[xProperty]);
                  })
                  .attr('cy', function (d) {
                    return yScale(d[yProperty]);
                  })
                  .attr('r', 0)
                  .transition()
                  .duration(1000)
                  .attr('r', defaultRadius)
                  .attr('class', 'circle')
                  .attr('fill', getColor);
              });
            });

            //register events
            scope.circles = svg.selectAll('circle');

            scope.circles
              .on('click', onCircleClick)
              .on('mouseover', onCircleMouseOver)
              .on('mouseout', onCircleMouseOut);
          };
        }
      };
    }]);