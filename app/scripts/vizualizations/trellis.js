'use strict';

angular.module('trellis', ['dataProvider', 'd3'])
  .directive('d3Trellis', ['$q', 'd3', 'itemPropertiesSelector', 'clusteredData',
    function ($q, d3, itemPropertiesSelector, clusteredData) {
      return {
        restrict: 'EA',
        scope: {},
        link: function (scope, element, args) {
          var svg = d3.select(element[0])
            .append('svg')
            .style('width', '100%');

          scope.render = function (cluster, numericProperties) {

            svg.selectAll('*').remove();

            //specify same height as width
            var width = d3.select(element[0]).node().offsetWidth;
            var height = width;
            svg.style('height', height);

            var scale = d3.scale.ordinal().domain(d3.range(numericProperties.length)).rangeRoundBands([0, width], 0.2);

            var xAxis = d3.svg.axis()
              .scale(scale)
              .orient('bottom')
              .ticks(5);

            var yAxis = d3.svg.axis()
              .scale(scale)
              .orient('left')
              .ticks(5);

            var color = d3.scale.category10();


            svg.selectAll('.x.axis')
              .data([1, 2, 3, 4, 5])
              .enter()
              .append('g')
              .attr('class', 'x axis');

            svg.selectAll('.y.axis')
              .data([1, 2, 3, 4, 5])
              .enter()
              .append('g')
              .attr('class', 'y axis');

            svg.selectAll('text')
              .data('test')
              .enter()
              .append('text')
              .text(function (d) {
                return d;
              })
              .color('black');


          };

          $q.all([itemPropertiesSelector.deferred, clusteredData]).then(function (values) {

            var properties = values[0];
            var cluster = values[1];

            scope.selectedNumericProperties = properties.selectedNumericProperties;
            scope.cluster = cluster;
            scope.render(scope.cluster, scope.selectedNumericProperties);

          });
        }
      };
    }]);