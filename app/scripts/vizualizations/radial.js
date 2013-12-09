'use strict';

angular.module('radial', ['dataProvider', 'd3'])
  .directive('d3Radial', ['d3', function (d3) {

    return {
      restrict: 'EA',
      scope: {},
      link: function (scope, element, attrs) {

        var dataset = [5, 10, 15, 20, 25];

        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', 500)
          .attr('h', 50);

        scope.render = function (data) {

          var circles = svg.selectAll('circle')
            .data(dataset)
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
      }
    };
  }]);
