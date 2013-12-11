'use strict';

angular.module('trellis', ['dataProvider', 'd3'])
  .directive('d3Trellis', ['$q', '$rootScope', 'd3', 'itemPropertiesSelector', 'clusteredData',
    function ($q, $rootScope, d3, itemPropertiesSelector, clusteredData) {
      return {
        restrict: 'EA',
        scope: {
        },
        link: function (scope, element) {

          var svg = d3.select(element[0])
            .append('svg')
            .style('width', '100%');

          var colors = d3.scale.category10();

          var defaultRadius = 3;

          var getColor = function (dataItem) {
            var textProperties = scope.selectedTextProperties;
            var value = _.reduce(textProperties, function (memo, property) {
              return memo + '_' + dataItem.item[property];
            }, '');

            return colors(value);
          };


          var getPointClasses = function (dataItem) {
            var classes = ['circle'];

            if (dataItem.item.isSelected()) {
              classes.push('selected');
            }
            else if (scope.selectedItems.length > 0) {
              classes.push('faded');
            }

            return classes.join(' ');
          };


          scope.render = function () {
            var numericProperties = scope.selectedNumericProperties;

            svg.selectAll('*').remove();

            //specify same height as width
            var width = d3.select(element[0]).node().offsetWidth;
            var height = width;
            svg.style('height', height);

            var plotsScale = d3.scale.ordinal().domain(d3.range(numericProperties.length)).rangeRoundBands([0, width], 0.3, 0.2);

            var brushCell;

            var currentBrush;

            var onCircleClick = function (point) {

              d3.select(brushCell).call( currentBrush.clear() );
              var ctrlKey = d3.event.ctrlKey;

              if (ctrlKey) {
                //allow multi choice
                point.item.toggleSelect();
              }
              else if (scope.selectedItems.length === 1 && point.item.isSelected()) {
                point.item.toggleSelect();
              }
              else {
                _.each(scope.selectedItems, function (item) {
                  item.select(false);
                });

                point.item.select(true);
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

            scope.points = [];

            _.each(numericProperties, function (yProperty, row) {

              _.each(numericProperties, function (xProperty, column) {

                var plotWidth = plotsScale.rangeBand();
                var plotHeight = plotsScale.rangeBand();
                var plotX = plotsScale(column);
                var plotY = plotsScale(row);

                var data = scope.clusterItems;

                var xLimits = d3.extent(data, function(item) {
                  return item[xProperty];
                });

                var yLimits = d3.extent(data, function(item) {
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


                cell.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + 0 + ',' + plotHeight + ')')
                  .call(xAxis);

                cell.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + 0 + ', ' + 0 + ')')
                  .call(yAxis);


                var brushStart = function (p) {
                  if (brushCell !== this) {
                    currentBrush = brush;
                    d3.select(brushCell).call(brush.clear());
                    brushCell = this;
                  }
                };

                var brushMove = function (p) {
                  var e = brush.extent();
                  var elementsChanged = false;

                  _.each(scope.clusterItems, function(item) {
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

                var brushEnd = function (p) {
                  if (brush.empty()){
                    _.each(scope.clusterItems, function(item) {
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

//                var area = cell.append('rect')
//                  .attr('x', 0)
//                  .attr('width', plotWidth)
//                  .attr('y', 0)
//                  .attr('height', plotHeight)
//                  .attr('fill', 'white')
//                  .attr('class', 'area');

                cell.append('g')
                  .attr('class','brush')
                  .call(brush);


                var points = _.map(scope.clusterItems, function (item) {
                  return {
                    item: item,
                    x: xScale(item[xProperty]),
                    y: yScale(item[yProperty])
                  };
                });

                scope.points = scope.points.concat(points);

                //add new properties
                cell.selectAll('circle')
                  .data(points)
                  .enter()
                  .append('circle')
                  .attr('cx', function (d) {
                    return d.x;
                  })
                  .attr('cy', function (d) {
                    return d.y;
                  })
                  .attr('r', 0)
                  .transition()
                  .duration(1000)
                  .attr('r', defaultRadius)
                  .attr('class', getPointClasses)
                  .attr('fill', getColor);
              });
            });

            //register events
            svg.selectAll('circle')
              .on('click', onCircleClick)
              .on('mouseover', onCircleMouseOver)
              .on('mouseout', onCircleMouseOut);
          };

          $q.all([itemPropertiesSelector.deferred, clusteredData]).then(function (values) {

            var properties = values[0];
            var cluster = values[1];

            scope.selectedNumericProperties = properties.selectedNumericProperties;
            scope.selectedTextProperties = properties.selectedTextProperties;

            scope.clusterItems = cluster.getAllItems();
            scope.selectedItems = []; //cached selected items for speed
            scope.render();

            $rootScope.$watchCollection(function () {
              return _.filter(scope.clusterItems, function (item) {
                return item.isSelected();
              });
            }, function (selectedItems) {
              scope.selectedItems = selectedItems;

              svg.selectAll('circle')
                .data(scope.points)
                .attr('class', getPointClasses)
                .attr('fill', getColor);
            });

          });
        }
      };
    }]);