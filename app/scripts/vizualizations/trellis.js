'use strict';

angular.module('trellis', ['dataProvider', 'd3'])
  .directive('d3Trellis', ['$q', 'd3', 'itemPropertiesSelector', 'clusteredData',
    function ($q, d3, itemPropertiesSelector, clusteredData) {
      return {
        restrict: 'EA',
        scope: {
        },
        link: function (scope, element) {
          var svg = d3.select(element[0])
            .append('svg')
            .style('width', '100%');


          var colors = d3.scale.category10();

          var getColor = function (dataItem) {
            var textProperties = scope.selectedTextProperties;
            var value = _.reduce(textProperties, function (memo, property) {
              return memo + '_' + dataItem.item[property];
            }, '');

            return colors(value);
          };


          var getPointClasses = function(dataItem) {
            var classes = ['circle'];

            if (dataItem.item.isSelected()) {
              classes.push('selected');
            }

            return classes.join();
          };


          scope.update = function () {
            d3.selectAll('circles')
              .data(scope.points)
              .attr('class', getPointClasses)
              .attr('fill', getColor);
          };

          scope.render = function () {
            var numericProperties = scope.selectedNumericProperties;

            svg.selectAll('*').remove();

            //specify same height as width
            var width = d3.select(element[0]).node().offsetWidth;
            var height = width;
            svg.style('height', height);

            var plotsScale = d3.scale.ordinal().domain(d3.range(numericProperties.length)).rangeRoundBands([0, width], 0.3, 0.2);

            scope.points = [];

            _.each(numericProperties, function (yProperty, row) {

              _.each(numericProperties, function (xProperty, column) {

                var plotWidth = plotsScale.rangeBand();
                var plotHeight = plotsScale.rangeBand();
                var plotX = plotsScale(column);
                var plotY = plotsScale(row);

                var data = scope.clusterItems;

                var maxXValue = _.max(data, function (item) {
                  return item[xProperty];
                })[xProperty];

                var maxYValue = _.max(data, function (item) {
                  return item[yProperty];
                })[yProperty];

                var minXValue = _.min(data, function (item) {
                  return item[xProperty];
                })[xProperty];

                var minYValue = _.min(data, function (item) {
                  return item[yProperty];
                })[yProperty];

                var maxXScale = maxXValue;
                var maxYScale = maxYValue;

                var minXScale = minXValue;
                var minYScale = minYValue;

                //set up scales
                var xScale = d3.scale.linear()
                  .domain([minXScale, maxXScale])
                  .range([0, plotWidth])
                  .nice();

                var yScale = d3.scale.linear()
                  .domain([minYScale, maxYScale])
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

                svg.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + plotX + ',' + (plotY + plotHeight) + ')')
                  .call(xAxis);

                svg.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(' + plotX + ', ' + plotY + ')')
                  .call(yAxis);

                scope.points = scope.points.concat(_.map(scope.clusterItems, function (item) {
                  return {
                    item: item,
                    x: plotX + xScale(item[xProperty]),
                    y: plotY + yScale(item[yProperty])
                  };
                }));
              });
            });

            scope.circles = svg.selectAll('circle')
              .data(scope.points)
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
              .attr('r', 3)
              .attr('class', getPointClasses)
              .attr('fill', getColor);

            //var specify

            svg.selectAll('circle')
              .on('click', function (point) {
                point.item.toggleSelect();
                scope.update();

                //svg.selectAll('selected')
              });
          };

          $q.all([itemPropertiesSelector.deferred, clusteredData]).then(function (values) {

            var properties = values[0];
            var cluster = values[1];

            scope.selectedNumericProperties = properties.selectedNumericProperties;
            scope.selectedTextProperties = properties.selectedTextProperties;

            scope.clusterItems = cluster.getAllItems();
            scope.render();

          });
        }
      };
    }]);