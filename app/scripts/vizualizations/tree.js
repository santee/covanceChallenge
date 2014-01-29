'use strict';

angular.module('tree', ['dataProvider', 'd3', 'color'])
  .directive('d3Tree', ['$q', '$rootScope', 'd3', 'clusteredData', 'clusterColor', 'itemsSelectionService',
    function($q, $rootScope, d3, clusteredData, clusterColor, itemsSelectionService) {
      return {
        restrict: 'AE',
        scope: {
          displayDepth: '='
        },
        link: function(scope, element) {
          var circleRadius = 10;
          var circleRadiusScale = 3.0;
          var diameter = d3.select(element[0]).node().offsetWidth;

          $q.all(clusteredData).then(function(cluster) {
            scope.cluster = cluster;
            //render();
            $rootScope.$watch(function() { return scope.displayDepth; }, function() { render(); });

            itemsSelectionService.onClusterSelectionChanged(function(e) {
              d3.select(element[0]).selectAll('circle').filter(function(d) { return e.cluster === d; }).attr('fill', clusterColor.getColor);
            });
          });

          var render = function() {
            var tree = d3.layout.tree()
              .size([360, (diameter / 2) - circleRadius])
              .children(function(d) { return d.nodeDepth >= scope.displayDepth ? [] : d.nodes; })
              .separation(function (a, b) { return (a.parent === b.parent ? 1 : 2) / a.depth; });

            var diagonal = d3.svg.diagonal.radial().projection(function(d) { return [ d.y, d.x / 180 * Math.PI ]; });

            d3.select(element[0]).select('svg').remove();
            var svg = d3.select(element[0])
              .append('svg')
                .attr('width',  diameter)
                .attr('height', diameter)
              .append('g')
                .attr('transform', 'translate(' + diameter / 2 + ', ' + diameter / 2 + ')');


            var nodes = tree.nodes(scope.cluster);
            var links = tree.links(nodes);

            svg.selectAll('.link')
              .data(links)
              .enter()
              .append('path')
                .attr('class', 'link')
                .attr('d', diagonal);

            var node = svg.selectAll('.node')
              .data(nodes)
              .enter()
              .append('g')
                .attr('class', 'node')
                .attr('transform', function(d) { return 'rotate(' + (d.x - 90) + ') translate(' + d.y + ')'; });

            node.append('circle')
              .attr('r', function() { return circleRadius / scope.displayDepth * circleRadiusScale; })
              .attr('fill', clusterColor.getColor)
              .on('click', function(d) {
                itemsSelectionService.toggleClusterSelection(d);
                svg.selectAll('circle')
                  .attr('fill', clusterColor.getColor);
              });
          };
        }
      };
    }]);