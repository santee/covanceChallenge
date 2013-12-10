'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3','clusteredData', function (d3, clusteredData) {
    return {
      restrict: 'EA',
      scope: {},
      link: function (scope, element) {

        clusteredData.then(function (data) {

          scope.data = data;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', '100%');

          scope.render = function (data) {

            svg.selectAll('*').remove();

            if (!data) {
              return;
            }

            var circles = svg.selectAll('circle')
              .data(data)
              .enter()
              .append('circle');

            circles.attr('cx', function (d, i) {
              return i * 50 + 25;
            })
              .attr('cy', 25)
              .attr('r', function (d) {
                return d;
              });

          };

          scope.render();
        });
      }
    };
  }]);
